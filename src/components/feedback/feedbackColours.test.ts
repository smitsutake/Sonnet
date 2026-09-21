import {describe, expect, it} from "vitest";
import {FEEDBACK_COLOUR, MAX_FEEDBACK_ITEMS} from "./feedbackColours";

describe("feedback colours", () => {
	it("caps comments at twenty", () => {
		expect(MAX_FEEDBACK_ITEMS).toBe(20);
	});

	it("uses the same blue for every comment", () => {
		expect(FEEDBACK_COLOUR).toBe("#0d6efd");
	});
});
