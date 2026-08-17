import React, {useEffect, useRef, useState} from "react";
import {InstanceId} from "../types.ts";
import {useGraph} from "../context/GraphContext.tsx";
import {graphRectForInstanceId} from "./graphAnchors.ts";
import {FeedbackItem} from "./feedbackTypes.ts";
import {buildColourMap} from "./feedbackColours.ts";
import {
	ArrowLine,
	buildArrowPath,
	computeArrowLines,
	FEEDBACK_ANCHOR_ATTRIBUTE,
	GOAL_ANCHOR_ATTRIBUTE,
	RectLike,
	targetsOfItem,
} from "./feedbackGeometry.ts";

// ============================================================
// Arrow overlay
// ============================================================
//
// Draws one arrow per (feedback box -> goal) link.
//
// The two ends live in different component trees -- boxes in FeedbackPanel,
// goals deep inside Tree -- so they are located by data attributes rather than
// by refs. That keeps the coupling to a single documented contract:
//
//   [data-feedback-id="<item id>"]        on a feedback box
//   [data-goal-instance="<instanceId>"]   on a goal row in the hierarchy
//
// Positions are recomputed on an animation frame. Polling is used rather than
// listeners because goal rows move for many reasons that are awkward to
// observe individually: panel resizing, tree scrolling, drag and drop,
// collapsing a cluster, and window resize.

type FeedbackArrowsProps = {
	items: FeedbackItem[];
	// Element the overlay is positioned against; coordinates are made relative
	// to this element's bounding box.
	containerRef: React.RefObject<HTMLElement>;
	// Comment currently selected by the reader, or null for "show everything".
	selectedItemId: string | null;
};

// Escapes a value for use inside a quoted attribute selector.
//
// CSS.escape is deliberately NOT used here. It escapes for *identifiers*, so
// an instanceId such as "8-1" comes back as "\\38 -1" because a CSS identifier
// may not begin with a digit. Every instanceId in this app begins with a
// digit, so passing them through CSS.escape mangles every lookup. Inside a
// quoted attribute value only the quote and the backslash need escaping.
//
// CSS is also absent in jsdom, so calling it threw and silently killed the
// animation frame loop under test.
const quoteAttributeValue = (value: string): string =>
	value.replace(/["\\]/g, "\\$&");

// Marker ids must be valid in a url(#...) reference, so the hash is dropped.
const arrowheadId = (colour: string): string =>
	`feedback-arrowhead-${colour.replace("#", "")}`;

const rectOf = (attribute: string, value: string): RectLike | null => {
	const element = document.querySelector(
		`[${attribute}="${quoteAttributeValue(value)}"]`
	);
	return element ? element.getBoundingClientRect() : null;
};

const FeedbackArrows: React.FC<FeedbackArrowsProps> = ({
	items,
	containerRef,
	selectedItemId,
}) => {
	const [lines, setLines] = useState<ArrowLine[]>([]);
	const frameRef = useRef<number>();
	const {graph} = useGraph();
	const colourMap = buildColourMap(items.map((item) => item.id));

	// A goal is drawn in two places. The rendered model is the one reviewers
	// actually look at, so it wins; the hierarchy row is the fallback for when
	// the canvas is hidden or the shape has been scrolled away.
	const graphRef = useRef(graph);
	graphRef.current = graph;

	useEffect(() => {
		let cancelled = false;

		const tick = () => {
			if (cancelled) {
				return;
			}
			const container = containerRef.current;
			if (container) {
				const next = computeArrowLines(
					items,
					container.getBoundingClientRect(),
					(itemId) => rectOf(FEEDBACK_ANCHOR_ATTRIBUTE, itemId),
					(instanceId: InstanceId) =>
						graphRectForInstanceId(graphRef.current, instanceId)
						?? rectOf(GOAL_ANCHOR_ATTRIBUTE, instanceId),
					selectedItemId,
					(itemId) => colourMap[itemId] ?? "#1c5a92"
				);
				setLines((previous) =>
					// Skip the state update, and so the re-render, on frames where
					// nothing actually moved.
					JSON.stringify(previous) === JSON.stringify(next) ? previous : next
				);
			}
			frameRef.current = requestAnimationFrame(tick);
		};

		frameRef.current = requestAnimationFrame(tick);

		return () => {
			cancelled = true;
			if (frameRef.current !== undefined) {
				cancelAnimationFrame(frameRef.current);
			}
		};
	}, [items, containerRef, selectedItemId, colourMap]);

	// Marks the goal rows a selected comment points at, so the link reads in
	// both directions. Done from here rather than inside Tree so that the tree
	// component stays unaware of the feedback feature.
	useEffect(() => {
		const targets = targetsOfItem(items, selectedItemId);
		const marked: Element[] = [];

		targets.forEach((instanceId) => {
			const element = document.querySelector(
				`[${GOAL_ANCHOR_ATTRIBUTE}="${quoteAttributeValue(instanceId)}"]`
			);
			if (element) {
				element.classList.add("feedback-goal-targeted");
				marked.push(element);
			}
		});

		return () => {
			marked.forEach((element) =>
				element.classList.remove("feedback-goal-targeted")
			);
		};
	}, [items, selectedItemId]);

	return (
		<svg className="feedback-arrows" aria-hidden="true">
			<defs>
				{/* One arrowhead per colour in use: SVG markers cannot inherit the
				    stroke colour of the path that references them. */}
				{[...new Set(lines.map((line) => line.colour))].map((colour) => (
					<marker
						key={colour}
						id={arrowheadId(colour)}
						viewBox="0 0 10 10"
						refX="9"
						refY="5"
						markerWidth="9"
						markerHeight="9"
						// Without this the head is scaled by the stroke width,
						// which made it balloon into a blob on thicker arrows.
						markerUnits="userSpaceOnUse"
						orient="auto"
					>
						<path d="M 1 1 L 9 5 L 1 9 z" fill={colour} />
					</marker>
				))}
			</defs>
			{lines.map((line) => (
				<path
					key={line.key}
					d={buildArrowPath(line)}
					fill="none"
					stroke={line.colour}
					strokeWidth={2}
					markerEnd={`url(#${arrowheadId(line.colour)})`}
				/>
			))}
		</svg>
	);
};

export default FeedbackArrows;
