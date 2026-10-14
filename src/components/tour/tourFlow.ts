import {anchorSelector} from "./tourSteps.ts";

// click the progress bar tab rather than setting state - ProgressBar keeps its
// own selectedTab, so otherwise the old tab stays highlighted

const POLL_INTERVAL_MS = 100;
const GIVE_UP_AFTER_MS = 5000;

const MODEL_TAB_ID = "graphTab";

// the canvas is display:none until the page has actually switched, so wait for
// it to have a size rather than just exist
const modelCanvasIsDrawn = (): boolean => {
	const canvas = document.querySelector(anchorSelector("model-canvas"));
	if (!canvas) {
		return false;
	}
	const {width, height} = canvas.getBoundingClientRect();
	return width > 0 && height > 0;
};

// returns a function that cancels the wait, e.g. if the editor unmounts
export const goToModelPage = (onReady: () => void): (() => void) => {
	document.getElementById(MODEL_TAB_ID)?.click();

	let waited = 0;
	const poll = window.setInterval(() => {
		waited += POLL_INTERVAL_MS;

		if (modelCanvasIsDrawn()) {
			window.clearInterval(poll);
			onReady();
			return;
		}

		if (waited >= GIVE_UP_AFTER_MS) {
			window.clearInterval(poll);
		}
	}, POLL_INTERVAL_MS);

	return () => window.clearInterval(poll);
};
