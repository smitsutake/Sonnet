/**
 * @vitest-environment jsdom
 */
import {renderHook} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {TourStep} from "./tourSteps";

// driver.js is stubbed - what's being tested is whether we hold onto the
// instance and destroy it at the right time, not what the library draws

type StubTour = {
	drive: ReturnType<typeof vi.fn>;
	destroy: ReturnType<typeof vi.fn>;
};

const tours: StubTour[] = [];

const configs: {steps?: {popover?: {title?: string}}[]}[] = [];

// titles of the steps actually handed to driver.js for the nth tour
const driveSteps = (n: number): string[] =>
	(configs[n].steps ?? []).map((s) => s.popover?.title ?? "");

vi.mock("driver.js", () => ({
	driver: (config: {onDestroyed?: () => void; steps?: unknown[]}) => {
		const tour: StubTour = {
			drive: vi.fn(),
			destroy: vi.fn(() => config.onDestroyed?.()),
		};
		tours.push(tour);
		configs.push(config as {steps?: {popover?: {title?: string}}[]});
		return tour;
	},
}));

const {isTourRunning, useTour} = await import("./useTour");

const steps: TourStep[] = [
	{id: "intro", title: "Intro", body: "Body", stage: "intro"},
];

// a stand-in for the real list: a few goal steps then the model half
const fullSteps: TourStep[] = [
	{id: "intro", title: "Intro", body: "b", stage: "intro"},
	{id: "goal-tabs", title: "Tabs", body: "b", stage: "goals"},
	{id: "add-goal", title: "Adding", body: "b", stage: "goals"},
	{id: "hierarchy", title: "Hierarchy", body: "b", stage: "hierarchy"},
	{id: "model", title: "Model", body: "b", stage: "model"},
];

afterEach(() => {
	tours.length = 0;
	configs.length = 0;
});

describe("starting part-way through", () => {
	it("starts at the top when no step is named", () => {
		const {result, unmount} = renderHook(() => useTour());
		result.current.startTour(fullSteps);

		expect(tours[0].drive).toHaveBeenCalledWith(0);
		unmount();
	});

	it("starts at the named step", () => {
		// pressing Guide on the render model page skips the goal list half
		const {result, unmount} = renderHook(() => useTour());
		result.current.startTour(fullSteps, "hierarchy");

		expect(tours[0].drive).toHaveBeenCalledWith(3);
		unmount();
	});

	it("only runs the steps it was handed", () => {
		// the goal list page passes a list with the canvas steps taken out
		const {result, unmount} = renderHook(() => useTour());
		result.current.startTour(fullSteps.filter((s) => s.stage !== "model"));

		expect(driveSteps(0)).toEqual(["Intro", "Tabs", "Adding", "Hierarchy"]);
		unmount();
	});

	it("falls back to the top if that step got filtered out", () => {
		// nothing in jsdom renders the anchors, but these steps have none, so
		// they all survive - ask for one that isn't in the list at all
		const {result, unmount} = renderHook(() => useTour());
		result.current.startTour(fullSteps, "not-a-step");

		expect(tours[0].drive).toHaveBeenCalledWith(0);
		unmount();
	});
});

describe("tour lifecycle", () => {
	it("destroys the tour when the editor unmounts", () => {
		// browser back button with the tour open used to leave the overlay
		// sitting on the welcome page with nothing clickable
		const {result, unmount} = renderHook(() => useTour());
		result.current.startTour(steps);
		expect(tours).toHaveLength(1);

		unmount();

		expect(tours[0].destroy).toHaveBeenCalledTimes(1);
		expect(isTourRunning()).toBe(false);
	});

	it("forgets the tour once it's closed", () => {
		const {result, unmount} = renderHook(() => useTour());
		result.current.startTour(steps);
		expect(isTourRunning()).toBe(true);

		result.current.stopTour();

		expect(isTourRunning()).toBe(false);
		unmount();
	});

	it("doesn't stack two overlays if a tour is somehow started twice", () => {
		// defensive, not a bug anyone can trigger by hand right now
		const {result, unmount} = renderHook(() => useTour());
		result.current.startTour(steps);
		result.current.startTour(steps);

		expect(tours).toHaveLength(2);
		expect(tours[0].destroy).toHaveBeenCalledTimes(1);
		expect(tours[1].destroy).not.toHaveBeenCalled();

		unmount();
	});
});
