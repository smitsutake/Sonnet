import {describe, expect, it} from "vitest";
import {
	OBSTACLE_MARGIN,
	Point,
	routeArrow,
	routeToPath,
	segmentHitsRect,
} from "./arrowRouting";
import {RectLike} from "./feedbackGeometry";

const rect = (
	left: number,
	top: number,
	width = 100,
	height = 40
): RectLike => ({
	left,
	top,
	right: left + width,
	width,
	height,
});

const p = (x: number, y: number): Point => ({x, y});

describe("segmentHitsRect", () => {
	const box = rect(100, 100);

	it("detects a segment passing straight through", () => {
		expect(segmentHitsRect(p(0, 120), p(300, 120), box)).toBe(true);
	});

	it("detects a segment that starts inside", () => {
		expect(segmentHitsRect(p(120, 110), p(400, 400), box)).toBe(true);
	});

	it("ignores a segment that passes above", () => {
		expect(segmentHitsRect(p(0, 50), p(300, 50), box)).toBe(false);
	});

	it("ignores a segment that stops short", () => {
		expect(segmentHitsRect(p(0, 120), p(50, 120), box)).toBe(false);
	});

	it("ignores a segment running parallel and clear of the box", () => {
		expect(segmentHitsRect(p(0, 0), p(0, 500), box)).toBe(false);
	});
});

describe("routeArrow", () => {
	it("goes straight when nothing is in the way", () => {
		const route = routeArrow(p(700, 100), p(200, 300), []);
		expect(route).toEqual([p(700, 100), p(200, 300)]);
	});

	it("adds a waypoint when a shape blocks the line", () => {
		// A goal label sitting between the comment box and its target is the
		// case this whole module exists for.
		const blocker = rect(400, 180, 120, 40);
		const route = routeArrow(p(700, 200), p(200, 200), [blocker]);
		expect(route.length).toBeGreaterThan(2);
	});

	it("produces a route that clears the shape it detoured around", () => {
		const blocker = rect(400, 180, 120, 40);
		const route = routeArrow(p(700, 200), p(200, 200), [blocker]);

		// Every segment of the finished route must miss the obstacle.
		for (let index = 0; index < route.length - 1; index += 1) {
			expect(segmentHitsRect(route[index], route[index + 1], blocker)).toBe(false);
		}
	});

	it("keeps clear of the shape by the margin, not just by a hair", () => {
		const blocker = rect(400, 180, 120, 40);
		const route = routeArrow(p(700, 200), p(200, 200), [blocker]);
		const waypoints = route.slice(1, -1);
		waypoints.forEach((point) => {
			const clearsVertically =
				point.y <= blocker.top - OBSTACLE_MARGIN
				|| point.y >= blocker.top + blocker.height + OBSTACLE_MARGIN;
			const clearsHorizontally =
				point.x <= blocker.left - OBSTACLE_MARGIN
				|| point.x >= blocker.right + OBSTACLE_MARGIN;
			expect(clearsVertically || clearsHorizontally).toBe(true);
		});
	});

	it("always starts at the box and ends at the goal", () => {
		const route = routeArrow(p(700, 200), p(200, 200), [
			rect(400, 180, 120, 40),
			rect(300, 150, 60, 100),
		]);
		expect(route[0]).toEqual(p(700, 200));
		expect(route[route.length - 1]).toEqual(p(200, 200));
	});

	it("terminates on a crowded diagram rather than searching forever", () => {
		const obstacles = Array.from({length: 12}, (_unused, index) =>
			rect(200 + index * 40, 150, 30, 100)
		);
		const route = routeArrow(p(700, 200), p(150, 200), obstacles);
		expect(route.length).toBeGreaterThan(1);
		expect(route.length).toBeLessThan(40);
	});
});

describe("routeToPath", () => {
	it("keeps the gentle curve when there is no detour", () => {
		const path = routeToPath([p(700, 100), p(200, 300)]);
		expect(path).toContain("C ");
	});

	it("rounds the corners of a detour", () => {
		const path = routeToPath([p(700, 200), p(500, 100), p(200, 200)]);
		expect(path).toContain("Q ");
		expect(path.startsWith("M 700 200")).toBe(true);
		expect(path.endsWith("200 200")).toBe(true);
	});

	it("falls back to a sharp corner when the segments are too short to round", () => {
		const path = routeToPath([p(100, 100), p(101, 100), p(102, 100)]);
		expect(path).toContain("L ");
	});

	it("returns nothing for an empty route", () => {
		expect(routeToPath([])).toBe("");
	});
});
