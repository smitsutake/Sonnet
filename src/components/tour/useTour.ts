import {useCallback} from "react";
import {driver, DriveStep} from "driver.js";
import "driver.js/dist/driver.css";
import {anchorSelector, TOUR_STEPS, TourStep} from "./tourSteps.ts";

// ============================================================
// Running the guided tour
// ============================================================
//
// driver.js is used rather than a hand-rolled overlay: MIT licensed, no
// dependencies of its own, and about 5kb. Given this project was burned once
// by mxGraph being abandoned, a library with no dependency tree was worth
// preferring over a richer one.
//
// Steps whose anchor is not on the screen are skipped rather than shown
// against nothing. That happens legitimately: the model canvas is not drawn
// while the goal list is open, and the save controls are absent on the welcome
// screen. A step with no anchor at all is always shown, centred.
//
// NOTE: "the element exists" is not the same as "you can see it" here.
// SectionPanel keeps all 3 sections mounted and just display:none's the ones
// you're not on, and GoalList renders a GoalListTable in all 5 tab panes. So
// querySelector finds stuff that isn't on screen and driver.js highlights a
// 0x0 box in the corner. Check the size instead.

// is this actually on screen? checkVisibility() is newish so fall back to
// measuring it - 0x0 means hidden one way or another
export const isRendered = (element: Element): boolean => {
	const candidate = element as HTMLElement & {
		checkVisibility?: () => boolean;
	};

	if (typeof candidate.checkVisibility === "function"
		&& !candidate.checkVisibility()) {
		return false;
	}

	const {width, height} = element.getBoundingClientRect();
	return width > 0 && height > 0;
};

// there can be more than one element with the same anchor (goal-table is in
// all 5 tab panes), so pick the visible one rather than the first one
export const findRenderedAnchor = (
	anchor: string,
	root: ParentNode = document
): Element | null =>
	[...root.querySelectorAll(anchorSelector(anchor))].find(isRendered) ?? null;

export type ResolvedStep = {
	step: TourStep;
	element?: Element;
};

// work out the element for each step, drop the ones with nothing to point at.
// pass driver.js the element, NOT the selector - if you give it a selector it
// does its own querySelector later and picks the hidden one again
export const resolveSteps = (
	steps: TourStep[],
	find: (anchor: string) => Element | null = (anchor) =>
		findRenderedAnchor(anchor)
): ResolvedStep[] =>
	steps.flatMap((step) => {
		if (!step.anchor) {
			return [{step}];
		}
		const element = find(step.anchor);
		return element ? [{step, element}] : [];
	});

const toDriveStep = ({step, element}: ResolvedStep): DriveStep => ({
	...(element ? {element} : {}),
	popover: {title: step.title, description: step.body},
});

export const useTour = () => {
	const startTour = useCallback((steps: TourStep[] = TOUR_STEPS) => {
		const resolved = resolveSteps(steps);

		if (resolved.length === 0) {
			return;
		}

		driver({
			showProgress: true,
			allowClose: true,
			nextBtnText: "Next",
			prevBtnText: "Back",
			doneBtnText: "Done",
			steps: resolved.map(toDriveStep),
		}).drive();
	}, []);

	return {startTour};
};
