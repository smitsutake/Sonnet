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

vi.mock("driver.js", () => ({
	driver: (config: {onDestroyed?: () => void}) => {
		const tour: StubTour = {
			drive: vi.fn(),
			destroy: vi.fn(() => config.onDestroyed?.()),
		};
		tours.push(tour);
		return tour;
	},
}));

const {isTourRunning, useTour} = await import("./useTour");

const steps: TourStep[] = [
	{id: "intro", title: "Intro", body: "Body", stage: "intro"},
];

afterEach(() => {
	tours.length = 0;
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
