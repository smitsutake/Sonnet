import {useEffect, useRef} from "react";
import {anchorSelector, TOUR_STEPS} from "./tourSteps.ts";
import {useTour} from "./useTour.ts";
import {shouldOpenAutomatically} from "./tourPolicy.ts";

// open the guide when you enter the editor, since the Guide button is easy to
// miss. can't start it on mount though - the anchors aren't in the dom yet, so
// poll until they are and give up after a bit.

const POLL_INTERVAL_MS = 100;
const GIVE_UP_AFTER_MS = 5000;

// wait for the first step with an actual anchor - the intro step has none so
// it always "resolves" and we'd start too early
const READY_ANCHOR = TOUR_STEPS.find((step) => step.anchor)?.anchor;

export const useAutoTour = (
	enabled: boolean = shouldOpenAutomatically()
): void => {
	const {startTour} = useTour();
	// once per visit to the editor, not once per re-render
	const alreadyOpened = useRef(false);

	useEffect(() => {
		if (!enabled || alreadyOpened.current || !READY_ANCHOR) {
			return;
		}

		let waited = 0;

		const poll = window.setInterval(() => {
			waited += POLL_INTERVAL_MS;

			if (document.querySelector(anchorSelector(READY_ANCHOR))) {
				window.clearInterval(poll);
				alreadyOpened.current = true;
				startTour();
				return;
			}

			// give up quietly. if the editor hasn't drawn in 5s something is
			// wrong and an overlay on top of it is the last thing they need.
			if (waited >= GIVE_UP_AFTER_MS) {
				window.clearInterval(poll);
			}
		}, POLL_INTERVAL_MS);

		return () => window.clearInterval(poll);
	}, [enabled, startTour]);
};
