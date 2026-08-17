import {InstanceId} from "../types.ts";
import {FeedbackItem} from "./feedbackTypes.ts";

// Geometry for the feedback arrow overlay.
//
// Kept as plain functions, separate from the component, so the coordinate
// maths can be unit tested without mounting anything.

export type ArrowLine = {
	key: string;
	itemId: string;
	instanceId: InstanceId;
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	// Colour of the comment this arrow belongs to.
	colour: string;
};

// Minimal shape needed from a DOMRect, so tests can pass plain objects.
export type RectLike = {
	left: number;
	top: number;
	right: number;
	width: number;
	height: number;
};

export const GOAL_ANCHOR_ATTRIBUTE = "data-goal-instance";
export const FEEDBACK_ANCHOR_ATTRIBUTE = "data-feedback-id";

// Builds one line per (feedback box -> goal) link.
//
// Links whose goal cannot be located are skipped rather than treated as an
// error: the goal may have been deleted, or its branch may be collapsed. The
// chip inside the feedback box still records the link either way.
export const computeArrowLines = (
	items: FeedbackItem[],
	containerRect: RectLike,
	getBoxRect: (itemId: string) => RectLike | null,
	getGoalRect: (instanceId: InstanceId) => RectLike | null,
	// Only the selected comment draws arrows. Drawing every comment at once
	// turned the model into a thicket of crossing lines, so a reader picks one
	// comment at a time.
	selectedItemId: string | null,
	colourFor: (itemId: string) => string
): ArrowLine[] => {
	if (selectedItemId === null) {
		return [];
	}

	const lines: ArrowLine[] = [];

	items.filter((item) => item.id === selectedItemId).forEach((item) => {
		const boxRect = getBoxRect(item.id);
		if (!boxRect) {
			return;
		}

		item.targets.forEach((instanceId) => {
			const goalRect = getGoalRect(instanceId);
			if (!goalRect) {
				return;
			}

			lines.push({
				key: `${item.id}--${instanceId}`,
				itemId: item.id,
				instanceId,
				colour: colourFor(item.id),
				// The panel sits to the right of the hierarchy, so arrows leave the
				// left edge of the box and arrive at the right edge of the goal.
				fromX: boxRect.left - containerRect.left,
				fromY: boxRect.top + boxRect.height / 2 - containerRect.top,
				toX: goalRect.right - containerRect.left,
				toY: goalRect.top + goalRect.height / 2 - containerRect.top,
			});
		});
	});

	return lines;
};

// Flat S-curve. A horizontal control point at each end keeps several arrows
// readable when they converge on the same goal.
export const buildArrowPath = (line: ArrowLine): string => {
	const controlOffset = Math.max(24, Math.abs(line.fromX - line.toX) / 2);
	return (
		`M ${line.fromX} ${line.fromY} ` +
		`C ${line.fromX - controlOffset} ${line.fromY}, ` +
		`${line.toX + controlOffset} ${line.toY}, ` +
		`${line.toX} ${line.toY}`
	);
};

// instanceIds targeted by the given comment. Used to highlight the matching
// rows in the hierarchy while a comment is selected.
export const targetsOfItem = (
	items: FeedbackItem[],
	itemId: string | null
): InstanceId[] => {
	if (itemId === null) {
		return [];
	}
	const item = items.find((candidate) => candidate.id === itemId);
	return item ? item.targets : [];
};
