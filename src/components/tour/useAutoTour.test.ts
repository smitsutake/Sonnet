/**
 * @vitest-environment jsdom
 */
import {act, renderHook} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

const drive = vi.fn();

vi.mock("driver.js", () => ({
	driver: () => ({drive, destroy: vi.fn()}),
}));

const {useAutoTour} = await import("./useAutoTour");

// the anchor it waits for - the goal tabs, first step that points at anything
const showTabs = () => {
	const tabs = document.createElement("div");
	tabs.setAttribute("data-tour", "goal-tabs");
	document.body.append(tabs);
};

beforeEach(() => {
	vi.useFakeTimers();
	drive.mockClear();
});

afterEach(() => {
	vi.useRealTimers();
	document.body.innerHTML = "";
});

describe("useAutoTour", () => {
	it("waits for the editor to draw, then opens the guide", () => {
		renderHook(() => useAutoTour());

		// ProjectEdit has mounted but maxGraph and the tab panes haven't put
		// anything in the dom yet
		act(() => {
			vi.advanceTimersByTime(300);
		});
		expect(drive).not.toHaveBeenCalled();

		showTabs();
		act(() => {
			vi.advanceTimersByTime(100);
		});

		expect(drive).toHaveBeenCalledTimes(1);
	});

	it("opens it once, not once per poll", () => {
		showTabs();
		renderHook(() => useAutoTour());

		act(() => {
			vi.advanceTimersByTime(2000);
		});

		expect(drive).toHaveBeenCalledTimes(1);
	});

	it("gives up instead of polling forever", () => {
		renderHook(() => useAutoTour());

		act(() => {
			vi.advanceTimersByTime(5000);
		});
		// turns up way too late
		showTabs();
		act(() => {
			vi.advanceTimersByTime(5000);
		});

		expect(drive).not.toHaveBeenCalled();
	});

	it("does nothing when switched off", () => {
		showTabs();
		renderHook(() => useAutoTour(false));

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		expect(drive).not.toHaveBeenCalled();
	});
});
