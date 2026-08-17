import {describe, expect, it} from "vitest";
import {
	buildColourMap,
	FEEDBACK_COLOURS,
	fadeColour,
	feedbackColourAt,
	MAX_FEEDBACK_ITEMS,
} from "./feedbackColours";

describe("feedback colours", () => {
	it("provides one colour per allowed comment", () => {
		expect(FEEDBACK_COLOURS).toHaveLength(MAX_FEEDBACK_ITEMS);
	});

	it("never repeats a colour within the cap", () => {
		expect(new Set(FEEDBACK_COLOURS).size).toBe(MAX_FEEDBACK_ITEMS);
	});

	it("assigns colours by position", () => {
		expect(feedbackColourAt(0)).toBe(FEEDBACK_COLOURS[0]);
		expect(feedbackColourAt(19)).toBe(FEEDBACK_COLOURS[19]);
	});

	it("wraps rather than returning undefined past the cap", () => {
		expect(feedbackColourAt(20)).toBe(FEEDBACK_COLOURS[0]);
	});

	it("maps comment ids to distinct colours", () => {
		const map = buildColourMap(["a", "b", "c"]);
		expect(new Set(Object.values(map)).size).toBe(3);
		expect(map.a).toBe(FEEDBACK_COLOURS[0]);
	});

	it("produces a translucent variant for unselected arrows", () => {
		expect(fadeColour("#1c5a92")).toBe("#1c5a9259");
	});
});
