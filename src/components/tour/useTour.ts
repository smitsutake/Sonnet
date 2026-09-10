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
// Steps whose anchor is not on the page are skipped rather than shown against
// nothing. That happens legitimately: the model canvas does not exist while
// the goal list is open, and the save controls are missing on the welcome
// screen. A step with no anchor at all is always shown, centred.

const toDriveStep = (step: TourStep): DriveStep => {
	if (!step.anchor) {
		return {
			popover: {title: step.title, description: step.body},
		};
	}
	return {
		element: anchorSelector(step.anchor),
		popover: {title: step.title, description: step.body},
	};
};

export const visibleSteps = (
	steps: TourStep[],
	isPresent: (selector: string) => boolean
): TourStep[] =>
	steps.filter((step) => !step.anchor || isPresent(anchorSelector(step.anchor)));

export const useTour = () => {
	const startTour = useCallback((steps: TourStep[] = TOUR_STEPS) => {
		const present = visibleSteps(
			steps,
			(selector) => document.querySelector(selector) !== null
		);

		if (present.length === 0) {
			return;
		}

		driver({
			showProgress: true,
			allowClose: true,
			nextBtnText: "Next",
			prevBtnText: "Back",
			doneBtnText: "Done",
			steps: present.map(toDriveStep),
		}).drive();
	}, []);

	return {startTour};
};
