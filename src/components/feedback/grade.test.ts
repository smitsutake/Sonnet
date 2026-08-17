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
import {buildGradeBanner} from "./feedbackExport";

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

describe("buildGradeBanner", () => {
	it("takes no space when the model is ungraded", () => {
		const banner = buildGradeBanner(null, 800);
		expect(banner.markup).toBe("");
		expect(banner.height).toBe(0);
	});

	it("shows the mark, the percentage and the components", () => {
		const banner = buildGradeBanner(grade(), 800);
		expect(banner.markup).toContain("17 / 20");
		expect(banner.markup).toContain("85%");
		expect(banner.markup).toContain("Hierarchy: 8/10");
		expect(banner.height).toBeGreaterThan(0);
	});

	it("omits the percentage when no maximum was set", () => {
		const banner = buildGradeBanner(grade({totalOutOf: 0}), 800);
		expect(banner.markup).not.toContain("%)");
	});

	it("records who graded it and when", () => {
		const banner = buildGradeBanner(grade(), 800);
		expect(banner.markup).toContain("Leon Sterling");
		expect(banner.markup).toContain("2026");
	});

	it("escapes the overall feedback", () => {
		const banner = buildGradeBanner(
			grade({overallFeedback: 'watch the <b>"do"</b> & "be" split'}),
			800
		);
		expect(banner.markup).not.toContain("<b>");
		expect(banner.markup).toContain("&amp;");
	});

	it("grows taller as the overall feedback gets longer", () => {
		const short = buildGradeBanner(grade({overallFeedback: "Good."}), 400);
		const long = buildGradeBanner(
			grade({overallFeedback: "word ".repeat(80)}),
			400
		);
		expect(long.height).toBeGreaterThan(short.height);
	});
});
