import {describe, expect, it} from "vitest";
import {visibleSteps} from "./useTour";
import {TourStep} from "./tourSteps";

const step = (id: string, anchor?: string): TourStep => ({
	id,
	anchor,
	title: id,
	body: id,
	stage: "goals",
});

describe("visibleSteps", () => {
	it("keeps steps whose anchor is on the page", () => {
		const steps = [step("a", "one"), step("b", "two")];
		const result = visibleSteps(steps, () => true);
		expect(result.map((s) => s.id)).toEqual(["a", "b"]);
	});

	it("drops steps whose anchor is not rendered yet", () => {
		// Legitimate: the model canvas does not exist while the goal list is
		// open, and the save controls are absent on the welcome screen. Better
		// to skip the step than point at nothing.
		const steps = [step("a", "one"), step("b", "two")];
		const result = visibleSteps(steps, (selector) =>
			selector.includes("one")
		);
		expect(result.map((s) => s.id)).toEqual(["a"]);
	});

	it("always keeps steps that have no anchor", () => {
		const steps = [step("intro"), step("a", "one")];
		const result = visibleSteps(steps, () => false);
		expect(result.map((s) => s.id)).toEqual(["intro"]);
	});

	it("returns nothing when the page has none of the anchors", () => {
		expect(visibleSteps([step("a", "one")], () => false)).toEqual([]);
	});
});
