import {RectLike} from "./feedbackGeometry.ts";

// ============================================================
// Routing feedback arrows around the model
// ============================================================
//
// A straight run from a comment box to its goal crosses whatever happens to
// lie between them, and the thing it most often crosses is the label inside
// another goal. Text under a line is hard to read, and the reader cannot tell
// which shape the arrow is actually pointing at.
//
// So arrows are routed around the shapes instead. This is not general path
// finding: it is a bounded detour heuristic, which is enough because the
// obstacles are a handful of axis-aligned boxes laid out by the model's own
// layout algorithm.
//
//   1. try the straight segment
//   2. if it clips a shape, step over or under that shape, whichever is nearer
//   3. repeat on the two halves, up to a small depth
//
// If it runs out of depth the last segment is drawn as-is. A slightly ugly
// arrow is better than no arrow, and better than hanging while searching.

export type Point = {x: number; y: number};

// Kept clear of the shape edge so the line does not graze the border.
export const OBSTACLE_MARGIN = 14;

const MAX_DETOUR_DEPTH = 4;

const inflate = (rect: RectLike, by: number): RectLike => ({
	left: rect.left - by,
	top: rect.top - by,
	right: rect.right + by,
	width: rect.width + by * 2,
	height: rect.height + by * 2,
});

// Liang-Barsky. Returns true when the segment enters the rectangle at all,
// including the case where it starts or ends inside it.
export const segmentHitsRect = (
	from: Point,
	to: Point,
	rect: RectLike
): boolean => {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const bottom = rect.top + rect.height;

	let enter = 0;
	let exit = 1;

	const clip = (p: number, q: number): boolean => {
		if (p === 0) {
			// Parallel to this edge: only a miss if it starts outside it.
			return q >= 0;
		}
		const r = q / p;
		if (p < 0) {
			if (r > exit) {
				return false;
			}
			enter = Math.max(enter, r);
		} else {
			if (r < enter) {
				return false;
			}
			exit = Math.min(exit, r);
		}
		return true;
	};

	return (
		clip(-dx, from.x - rect.left)
		&& clip(dx, rect.right - from.x)
		&& clip(-dy, from.y - rect.top)
		&& clip(dy, bottom - from.y)
		&& enter <= exit
	);
};

// The obstacle a segment meets first, or null.
const firstHit = (
	from: Point,
	to: Point,
	obstacles: RectLike[]
): RectLike | null => {
	let nearest: RectLike | null = null;
	let nearestDistance = Infinity;

	obstacles.forEach((rect) => {
		if (!segmentHitsRect(from, to, rect)) {
			return;
		}
		const centreX = rect.left + rect.width / 2;
		const centreY = rect.top + rect.height / 2;
		const distance = (centreX - from.x) ** 2 + (centreY - from.y) ** 2;
		if (distance < nearestDistance) {
			nearestDistance = distance;
			nearest = rect;
		}
	});

	return nearest;
};

const routeSegment = (
	from: Point,
	to: Point,
	obstacles: RectLike[],
	depth: number
): Point[] => {
	if (depth <= 0) {
		return [to];
	}

	const blocker = firstHit(from, to, obstacles);
	if (!blocker) {
		return [to];
	}

	// Two waypoints, not one.
	//
	// A single waypoint beside the shape is not enough: the leg from it to the
	// destination often runs straight back through the shape. Instead the route
	// picks a clear horizontal corridor and travels along it past the whole
	// width of the obstacle, so the middle leg is guaranteed to miss.
	const midY = (from.y + to.y) / 2;
	const above = blocker.top - OBSTACLE_MARGIN;
	const below = blocker.top + blocker.height + OBSTACLE_MARGIN;
	const corridorY = Math.abs(midY - above) <= Math.abs(midY - below) ? above : below;

	const leftOfBlocker = blocker.left - OBSTACLE_MARGIN;
	const rightOfBlocker = blocker.right + OBSTACLE_MARGIN;

	// Enter the corridor on the side the arrow is coming from, leave on the
	// side it is heading towards.
	const travellingLeft = to.x < from.x;
	const entryX = travellingLeft ? rightOfBlocker : leftOfBlocker;
	const exitX = travellingLeft ? leftOfBlocker : rightOfBlocker;

	const entry = {x: entryX, y: corridorY};
	const exit = {x: exitX, y: corridorY};

	// The obstacle stays in the list for the outer legs: it is only the middle
	// leg that is known to be clear of it.
	const remaining = obstacles.filter((rect) => rect !== blocker);

	return [
		...routeSegment(from, entry, remaining, depth - 1),
		exit,
		...routeSegment(exit, to, remaining, depth - 1),
	];
};

// Full route, start point included.
export const routeArrow = (
	from: Point,
	to: Point,
	obstacles: RectLike[]
): Point[] => {
	// The target's own shape is not an obstacle -- the arrow has to reach it --
	// and neither is anything the line only grazes, hence the margin.
	const padded = obstacles.map((rect) => inflate(rect, 0));
	return [from, ...routeSegment(from, to, padded, MAX_DETOUR_DEPTH)];
};

// Renders a route as a path with rounded corners, so a detour reads as a bend
// rather than as a mistake.
export const routeToPath = (points: Point[], radius = 10): string => {
	if (points.length === 0) {
		return "";
	}
	if (points.length === 1) {
		return `M ${points[0].x} ${points[0].y}`;
	}
	if (points.length === 2) {
		// No corners: keep the gentle curve used before routing existed.
		const [start, end] = points;
		const gap = end.x - start.x;
		const offset = gap / 2;
		const bend = gap === 0 ? 24 : 0;
		return (
			`M ${start.x} ${start.y} `
			+ `C ${start.x + offset + bend} ${start.y}, `
			+ `${end.x - offset - bend} ${end.y}, `
			+ `${end.x} ${end.y}`
		);
	}

	const parts = [`M ${points[0].x} ${points[0].y}`];

	for (let index = 1; index < points.length - 1; index += 1) {
		const previous = points[index - 1];
		const corner = points[index];
		const next = points[index + 1];

		const inLength = Math.hypot(corner.x - previous.x, corner.y - previous.y);
		const outLength = Math.hypot(next.x - corner.x, next.y - corner.y);
		const r = Math.min(radius, inLength / 2, outLength / 2);

		if (r < 1) {
			parts.push(`L ${corner.x} ${corner.y}`);
			continue;
		}

		const beforeX = corner.x - ((corner.x - previous.x) / inLength) * r;
		const beforeY = corner.y - ((corner.y - previous.y) / inLength) * r;
		const afterX = corner.x + ((next.x - corner.x) / outLength) * r;
		const afterY = corner.y + ((next.y - corner.y) / outLength) * r;

		parts.push(`L ${beforeX} ${beforeY}`);
		parts.push(`Q ${corner.x} ${corner.y}, ${afterX} ${afterY}`);
	}

	const last = points[points.length - 1];
	parts.push(`L ${last.x} ${last.y}`);

	return parts.join(" ");
};
