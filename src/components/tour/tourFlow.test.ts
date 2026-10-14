/**
 * @vitest-environment jsdom
 */
import {act, renderHook} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

type StubTour = {
	drive: ReturnType<typeof vi.fn>;
	destroy: ReturnType<typeof vi.fn>;
};
type StubConfig = {
	onDestroyed?: () => void;
	onDoneClick?: () => void;
	doneBtnText?: string;
	steps?: {popover?: {title?: string}}[];
};

const tours: StubTour[] = [];
const configs: StubConfig[] = [];

vi.mock("driver.js", () => ({
	driver: (config: StubConfig) => {
		const tour: StubTour = {
			drive: vi.fn(),
			destroy: vi.fn(() => config.onDestroyed?.()),
		};
		tours.push(tour);
		configs.push(config);
		return tour;
	},
}));

const {goToModelPage} = await import("./tourFlow");
const {useTour, stopTour} = await import("./useTour");

// jsdom has no layout, so fake a size on whatever should count as drawn
const sized = (el: Element, w: number, h: number) => {
	el.getBoundingClientRect = () =>
		({width: w, height: h, top: 0, left: 0, right: w, bottom: h,
			x: 0, y: 0, toJSON: () => ({})}) as DOMRect;
};

// enough of the editor for both pages: the model tab, the hidden canvas and
// the hierarchy panel the model page tour starts on
const mountEditor = () => {
	document.body.innerHTML = `
		<div id="graphTab"></div>
		<div data-tour="goal-tabs"></div>
		<div data-tour="hierarchy-panel"></div>
		<div data-tour="model-canvas"></div>
	`;
	const tab = document.getElementById("graphTab")!;
	const canvas = document.querySelector('[data-tour="model-canvas"]')!;
	sized(canvas, 0, 0);
	return {tab, canvas};
};

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	stopTour();
	vi.useRealTimers();
	document.body.innerHTML = "";
	tours.length = 0;
	configs.length = 0;
});

describe("goToModelPage", () => {
	it("clicks the progress bar tab so its own state switches too", () => {
		const {tab} = mountEditor();
		const click = vi.fn();
		tab.addEventListener("click", click);

		goToModelPage(() => {});

		expect(click).toHaveBeenCalledTimes(1);
	});

	it("waits for the canvas to be drawn before carrying on", () => {
		const {canvas} = mountEditor();
		const ready = vi.fn();
		goToModelPage(ready);

		vi.advanceTimersByTime(300);
		expect(ready).not.toHaveBeenCalled();

		sized(canvas, 800, 600);
		vi.advanceTimersByTime(100);
		expect(ready).toHaveBeenCalledTimes(1);

		vi.advanceTimersByTime(1000);
		expect(ready).toHaveBeenCalledTimes(1);
	});

	it("gives up if the canvas never shows", () => {
		const {canvas} = mountEditor();
		const ready = vi.fn();
		goToModelPage(ready);

		vi.advanceTimersByTime(5000);
		sized(canvas, 800, 600);
		vi.advanceTimersByTime(1000);

		expect(ready).not.toHaveBeenCalled();
	});

	it("can be cancelled", () => {
		const {canvas} = mountEditor();
		const ready = vi.fn();
		const cancel = goToModelPage(ready);

		cancel();
		sized(canvas, 800, 600);
		vi.advanceTimersByTime(1000);

		expect(ready).not.toHaveBeenCalled();
	});
});

describe("startForPage", () => {
	it("goal list page: Done moves to the model page and starts its steps", () => {
		const {canvas} = mountEditor();
		const {result, unmount} = renderHook(() => useTour());
		act(() => result.current.startForPage(false));

		expect(configs[0].doneBtnText).toBe("Next");
		expect(configs[0].onDoneClick).toBeTypeOf("function");

		// press Done on the last goal list step
		act(() => configs[0].onDoneClick!());
		expect(tours[0].destroy).toHaveBeenCalled();

		sized(canvas, 800, 600);
		act(() => {
			vi.advanceTimersByTime(100);
		});

		expect(tours).toHaveLength(2);
		expect(configs[1].steps?.[0].popover?.title).toBe("Arranging the hierarchy");
		// the model page is the end, so plain Done there
		expect(configs[1].onDoneClick).toBeUndefined();
		unmount();
	});

	it("render model page: just its own steps, nothing after", () => {
		mountEditor();
		const {result, unmount} = renderHook(() => useTour());
		act(() => result.current.startForPage(true));

		expect(configs[0].onDoneClick).toBeUndefined();
		expect(configs[0].doneBtnText).toBe("Done");
		unmount();
	});

	it("doesn't start the model page tour if the editor closes while waiting", () => {
		const {canvas} = mountEditor();
		const {result, unmount} = renderHook(() => useTour());
		act(() => result.current.startForPage(false));
		act(() => configs[0].onDoneClick!());

		unmount();
		sized(canvas, 800, 600);
		vi.advanceTimersByTime(1000);

		expect(tours).toHaveLength(1);
	});
});
