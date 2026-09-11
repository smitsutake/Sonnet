import {useCallback, useEffect} from "react";
import {driver, DriveStep} from "driver.js";
import "driver.js/dist/driver.css";
import "./tourTheme.css";
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

// keep the driver instance so something can destroy it later.
//
// the overlay is appended to document.body, not into the react tree, so react
// unmounting the editor doesn't take it with it. if you hit the browser back
// button while the tour is open you end up on the welcome page with the
// overlay still on top of it and nothing clickable (Esc gets you out, but
// nobody knows that).
//
// module scope, not a useRef: TourButton and anything else that calls
// useTour() would each get their own ref and neither could stop the other's
// overlay. there's only one overlay per page so there should only be one
// handle.
let activeTour: ReturnType<typeof driver> | undefined;

export const stopTour = (): void => {
	activeTour?.destroy();
	activeTour = undefined;
};

export const isTourRunning = (): boolean => activeTour !== undefined;

export const useTour = () => {
	const startTour = useCallback((steps: TourStep[] = TOUR_STEPS) => {
		const present = visibleSteps(
			steps,
			(selector) => document.querySelector(selector) !== null
		);

		if (present.length === 0) {
			return;
		}

		// defensive - you can't currently reach this with a mouse or keyboard
		// because the overlay swallows the click, but it's one line
		stopTour();

		const tour = driver({
			showProgress: true,
			allowClose: true,
			nextBtnText: "Next",
			prevBtnText: "Back",
			doneBtnText: "Done",
			// scopes tourTheme.css to this popover only
			popoverClass: "ammber-tour",
			steps: present.map(toDriveStep),
			// also fires when the user presses Done or clicks the overlay, so we
			// don't keep a handle to something that's already gone
			onDestroyed: () => {
				activeTour = undefined;
			},
		});

		activeTour = tour;
		tour.drive();
	}, []);

	// this is the bit that cleans up the overlay when the editor unmounts
	useEffect(() => stopTour, []);

	return {startTour, stopTour};
};
