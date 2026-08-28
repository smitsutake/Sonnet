import {describe, expect, it} from "vitest";
import {
	createEmptyGrade,
	FEEDBACK_STATUS,
	GradeData,
	gradePercentage,
	hasGrade,
	MAX_OVERALL_FEEDBACK_LENGTH,
	parseFeedbackData,
} from "./feedbackTypes";

const grade = (overrides: Partial<GradeData> = {}): GradeData => ({
	totalScore: 17,
	totalOutOf: 20,
	criteria: [{id: "c1", label: "Hierarchy", score: 8, outOf: 10}],
	overallFeedback: "Solid model, tighten the emotional goals.",
	gradedBy: "Leon Sterling",
	gradedAt: "2026-08-13T00:00:00.000Z",
	...overrides,
});

describe("hasGrade", () => {
	it("is false for an untouched form, so no button appears", () => {
		expect(hasGrade(createEmptyGrade("Leon Sterling"))).toBe(false);
	});

	it("is false when there is no grade at all", () => {
		expect(hasGrade(null)).toBe(false);
		expect(hasGrade(undefined)).toBe(false);
	});

	it("is true once any part has been filled in", () => {
		expect(hasGrade(grade({totalScore: 0, totalOutOf: 0, criteria: []}))).toBe(true);
		expect(
			hasGrade(grade({overallFeedback: "", criteria: [], totalScore: 5, totalOutOf: 0}))
		).toBe(true);
	});
});

describe("gradePercentage", () => {
	it("rounds to one decimal place", () => {
		expect(gradePercentage(grade())).toBe(85);
		expect(gradePercentage(grade({totalScore: 1, totalOutOf: 3}))).toBe(33.3);
	});

	it("returns null rather than NaN when no maximum was set", () => {
		expect(gradePercentage(grade({totalOutOf: 0}))).toBeNull();
	});
});

describe("grade in the saved file", () => {
	it("round trips through the schema", () => {
		const block = {
			status: FEEDBACK_STATUS.FEEDBACKED,
			items: [],
			grade: grade(),
			updatedAt: "2026-08-13T00:00:00.000Z",
		};
		expect(parseFeedbackData(block)).toEqual(block);
	});

	it("still parses a file with no grade", () => {
		const block = {
			status: FEEDBACK_STATUS.UNFEEDBACKED,
			items: [],
			updatedAt: "2026-08-13T00:00:00.000Z",
		};
		expect(parseFeedbackData(block)).toEqual(block);
	});

	it("rejects overall feedback beyond the limit", () => {
		const block = {
			status: FEEDBACK_STATUS.FEEDBACKED,
			items: [],
			grade: grade({overallFeedback: "x".repeat(MAX_OVERALL_FEEDBACK_LENGTH + 1)}),
			updatedAt: "2026-08-13T00:00:00.000Z",
		};
		expect(parseFeedbackData(block)).toBeNull();
	});

	it("accepts overall feedback exactly at the limit", () => {
		const block = {
			status: FEEDBACK_STATUS.FEEDBACKED,
			items: [],
			grade: grade({overallFeedback: "x".repeat(MAX_OVERALL_FEEDBACK_LENGTH)}),
			updatedAt: "2026-08-13T00:00:00.000Z",
		};
		expect(parseFeedbackData(block)).not.toBeNull();
	});
});
