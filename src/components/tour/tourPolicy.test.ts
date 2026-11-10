/**
 * @vitest-environment jsdom
 */
import {beforeEach, describe, expect, it} from "vitest";
import {shouldOpenAutomatically} from "./tourPolicy";

beforeEach(() => {
	window.sessionStorage.clear();
});

describe("shouldOpenAutomatically", () => {
	it("opens for someone using the editor", () => {
		expect(shouldOpenAutomatically("", false)).toBe(true);
	});

	it("stays out of cypress's way", () => {
		// the specs click "Create Model" then work inside the editor, so an
		// overlay fails all of them on the overlay and not on what they test
		expect(shouldOpenAutomatically("", true)).toBe(false);
	});

	it("can be turned off by hand with ?tour=off", () => {
		expect(shouldOpenAutomatically("?tour=off", false)).toBe(false);
	});

	it("can be forced on with ?tour=on, which is how you'd test the guide itself", () => {
		expect(shouldOpenAutomatically("?tour=on", true)).toBe(true);
	});

	it("lets ?tour=off win even outside a test run", () => {
		expect(shouldOpenAutomatically("?tour=off", true)).toBe(false);
	});

	it("ignores a value it doesn't recognise", () => {
		// a typo shouldn't quietly switch the feature off
		expect(shouldOpenAutomatically("?tour=maybe", false)).toBe(true);
		expect(shouldOpenAutomatically("?tour=maybe", true)).toBe(false);
	});

	it("finds the flag in a query string with other params in it", () => {
		expect(shouldOpenAutomatically("?debug=1&tour=off", false)).toBe(false);
	});

	it("keeps the flag through the navigation into the editor", () => {
		// ?tour=off is typed on the welcome page but "Create Model" loses the
		// query string, so without remembering it the flag does nothing
		expect(shouldOpenAutomatically("?tour=off", false)).toBe(false);
		expect(shouldOpenAutomatically("", false)).toBe(false);
	});

	it("lets ?tour=on survive the same navigation under cypress", () => {
		expect(shouldOpenAutomatically("?tour=on", true)).toBe(true);
		expect(shouldOpenAutomatically("", true)).toBe(true);
	});

	it("is read once at boot, not only when the editor mounts", async () => {
		// nothing calls this while you're on the welcome page, so the module has
		// to grab the flag on import
		window.sessionStorage.clear();
		window.history.replaceState({}, "", "/?tour=off");
		await import("./tourPolicy?boot");

		expect(window.sessionStorage.getItem("ammber.tour")).toBe("off");
		expect(shouldOpenAutomatically("", false)).toBe(false);
	});

	it("lets a later flag replace an earlier one", () => {
		expect(shouldOpenAutomatically("?tour=off", false)).toBe(false);
		expect(shouldOpenAutomatically("?tour=on", false)).toBe(true);
		expect(shouldOpenAutomatically("", false)).toBe(true);
	});
});
