import {z} from "zod";
import {InstanceId} from "../types.ts";

// ============================================================
// Feedback data model
// ============================================================
//
// Feedback is stored inside the same .json file as the model itself, under a
// top-level "feedback" key. The key is OPTIONAL: files saved before this
// feature existed simply do not have it, and must keep loading normally.
//
// When a file without feedback is opened and then saved again, we stamp it
// with status "unfeedbacked" so that from that point on every file carries an
// explicit record of whether it has been reviewed.

export const FEEDBACK_STATUS = {
	FEEDBACKED: "feedbacked",
	UNFEEDBACKED: "unfeedbacked",
} as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUS)[keyof typeof FEEDBACK_STATUS];

export type FeedbackItem = {
	// Stable id used to key React lists and to anchor arrows in the DOM.
	id: string;
	// The body of the comment written by the reviewer.
	content: string;
	// Name typed by the reviewer when they entered teaching-staff mode.
	author: string;
	// ISO 8601 timestamp. Stored in full so the year is always recoverable.
	createdAt: string;
	// instanceIds of the goals this comment points at. A single comment may
	// point at any number of goals, including none.
	targets: InstanceId[];
};

// ============================================================
// Grading
// ============================================================
//
// A grade is separate from the per-goal comments: it is the reviewer's verdict
// on the model as a whole. It lives inside the same feedback block so that a
// file carries one self-contained record of everything a reviewer added.
//
// Scores are entirely reviewer-defined. Nothing here assumes a marking scheme,
// a maximum, or that the parts add up to the total, because AMMBER is used
// across several subjects with different rubrics.

export const MAX_OVERALL_FEEDBACK_LENGTH = 500;

export type GradeCriterion = {
	id: string;
	label: string;
	score: number;
	outOf: number;
};

export type GradeData = {
	totalScore: number;
	totalOutOf: number;
	criteria: GradeCriterion[];
	overallFeedback: string;
	gradedBy: string;
	gradedAt: string;
};

export type FeedbackData = {
	status: FeedbackStatus;
	items: FeedbackItem[];
	// Absent until a reviewer grades the model.
	grade?: GradeData;
	// Last time the feedback block itself was written.
	updatedAt: string;
};

// ============================================================
// Schemas
// ============================================================

const instanceIdSchema = z.custom<InstanceId>(
	(val) => typeof val === "string" && /^\d+-\d+$/.test(val)
);

export const FeedbackItemSchema = z.object({
	id: z.string(),
	content: z.string(),
	author: z.string(),
	createdAt: z.string(),
	targets: instanceIdSchema.array(),
});

export const GradeCriterionSchema = z.object({
	id: z.string(),
	label: z.string(),
	score: z.number(),
	outOf: z.number(),
});

export const GradeDataSchema = z.object({
	totalScore: z.number(),
	totalOutOf: z.number(),
	criteria: GradeCriterionSchema.array(),
	overallFeedback: z.string().max(MAX_OVERALL_FEEDBACK_LENGTH),
	gradedBy: z.string(),
	gradedAt: z.string(),
});

export const FeedbackDataSchema = z.object({
	status: z.enum([FEEDBACK_STATUS.FEEDBACKED, FEEDBACK_STATUS.UNFEEDBACKED]),
	items: FeedbackItemSchema.array(),
	// Optional so that files graded by no one, and files written before
	// grading existed, both still parse.
	grade: GradeDataSchema.optional(),
	updatedAt: z.string(),
});

// ============================================================
// Helpers
// ============================================================

// Reads the feedback block out of a parsed .json file.
//
// Anything we cannot validate is treated as "no feedback" rather than as an
// error: a malformed feedback block must never stop a student from opening
// their own model.
export const parseFeedbackData = (raw: unknown): FeedbackData | null => {
	if (raw === null || raw === undefined) {
		return null;
	}
	const result = FeedbackDataSchema.safeParse(raw);
	if (!result.success) {
		console.warn("Ignoring malformed feedback block in file", result.error);
		return null;
	}
	return result.data;
};

// True when the file carries feedback that is worth showing to whoever opened
// it. An empty "feedbacked" block still counts, because the reviewer may have
// deliberately cleared their comments.
export const hasFeedback = (data: FeedbackData | null): boolean =>
	data !== null && data.status === FEEDBACK_STATUS.FEEDBACKED;

export const createFeedbackItem = (author: string): FeedbackItem => ({
	// crypto.randomUUID is available in every browser this app already
	// supports; the fallback keeps unit tests and older runtimes working.
	id:
		typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
			? crypto.randomUUID()
			: `fb-${Date.now()}-${Math.random().toString(16).slice(2)}`,
	content: "",
	author,
	createdAt: new Date().toISOString(),
	targets: [],
});

// Builds the block that gets written into the .json file on save.
//
// Files that were never opened in teaching-staff mode are stamped
// "unfeedbacked" so the absence of review is explicit rather than implied.
export const buildFeedbackData = (
	items: FeedbackItem[],
	wasReviewed: boolean
): FeedbackData => ({
	status: wasReviewed ? FEEDBACK_STATUS.FEEDBACKED : FEEDBACK_STATUS.UNFEEDBACKED,
	items,
	updatedAt: new Date().toISOString(),
});

// Display format for the date shown on a feedback box. Always includes the
// year, and falls back to the raw string if the timestamp cannot be parsed.
export const formatFeedbackDate = (iso: string): string => {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return iso;
	}
	return date.toLocaleDateString("en-AU", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
};

// ============================================================
// Grade helpers
// ============================================================

const randomId = (prefix: string): string =>
	typeof crypto !== "undefined" && "randomUUID" in crypto
		? `${prefix}-${crypto.randomUUID()}`
		: `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

export const createGradeCriterion = (): GradeCriterion => ({
	id: randomId("crit"),
	label: "",
	score: 0,
	outOf: 0,
});

export const createEmptyGrade = (gradedBy: string): GradeData => ({
	totalScore: 0,
	totalOutOf: 0,
	criteria: [],
	overallFeedback: "",
	gradedBy,
	gradedAt: new Date().toISOString(),
});

// A grade counts as present only once the reviewer has actually put something
// in it. An untouched form should not make a "Your Grade" button appear.
export const hasGrade = (grade: GradeData | undefined | null): boolean => {
	if (!grade) {
		return false;
	}
	return (
		grade.overallFeedback.trim() !== ""
		|| grade.totalOutOf > 0
		|| grade.totalScore > 0
		|| grade.criteria.length > 0
	);
};

// Percentage for display. Returns null when no maximum was set, because
// dividing by zero would otherwise show NaN in the student's view.
export const gradePercentage = (grade: GradeData): number | null => {
	if (grade.totalOutOf <= 0) {
		return null;
	}
	return Math.round((grade.totalScore / grade.totalOutOf) * 1000) / 10;
};
