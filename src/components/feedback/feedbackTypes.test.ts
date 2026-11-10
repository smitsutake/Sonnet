import {describe, expect, it} from "vitest";
import {
	buildFeedbackData,
	createFeedbackItem,
	FEEDBACK_STATUS,
	FeedbackItem,
	formatFeedbackDate,
	hasFeedback,
	parseFeedbackData,
} from "./feedbackTypes";

const sampleItem = (overrides: Partial<FeedbackItem> = {}): FeedbackItem => ({
	id: "fb-1",
	content: "Consider splitting this goal",
	author: "Leon Sterling",
	createdAt: "2026-03-12T04:05:06.000Z",
	targets: ["8-1"],
	...overrides,
});

describe("parseFeedbackData", () => {
	it("returns null for a file saved before the feedback feature existed", () => {
		expect(parseFeedbackData(undefined)).toBeNull();
		expect(parseFeedbackData(null)).toBeNull();
	});

	it("reads back a well formed block", () => {
		const block = {
			status: FEEDBACK_STATUS.FEEDBACKED,
			items: [sampleItem()],
			updatedAt: "2026-03-12T04:05:06.000Z",
		};
		expect(parseFeedbackData(block)).toEqual(block);
	});

	it("treats a malformed block as absent rather than throwing", () => {
		// A student must still be able to open their model even if the feedback
		// block has been hand-edited into something invalid.
		expect(parseFeedbackData({status: "reviewed", items: []})).toBeNull();
		expect(parseFeedbackData({status: FEEDBACK_STATUS.FEEDBACKED})).toBeNull();
		expect(parseFeedbackData("nonsense")).toBeNull();
	});

	it("rejects an item whose instanceId is not in n-n form", () => {
		const block = {
			status: FEEDBACK_STATUS.FEEDBACKED,
			items: [sampleItem({targets: ["not-an-instance-id"] as never})],
			updatedAt: "2026-03-12T04:05:06.000Z",
		};
		expect(parseFeedbackData(block)).toBeNull();
	});
});

describe("hasFeedback", () => {
	it("is false when there is no block at all", () => {
		expect(hasFeedback(null)).toBe(false);
	});

	it("is false for a file explicitly stamped unfeedbacked", () => {
		expect(
			hasFeedback({
				status: FEEDBACK_STATUS.UNFEEDBACKED,
				items: [],
				updatedAt: "2026-03-12T00:00:00.000Z",
			})
		).toBe(false);
	});

	it("is true for a reviewed file even when the reviewer cleared every comment", () => {
		expect(
			hasFeedback({
				status: FEEDBACK_STATUS.FEEDBACKED,
				items: [],
				updatedAt: "2026-03-12T00:00:00.000Z",
			})
		).toBe(true);
	});
});

describe("buildFeedbackData", () => {
	it("stamps unfeedbacked when the model was never reviewed", () => {
		const data = buildFeedbackData([], false);
		expect(data.status).toBe(FEEDBACK_STATUS.UNFEEDBACKED);
		expect(data.items).toEqual([]);
	});

	it("stamps feedbacked when a reviewer was present", () => {
		const data = buildFeedbackData([sampleItem()], true);
		expect(data.status).toBe(FEEDBACK_STATUS.FEEDBACKED);
		expect(data.items).toHaveLength(1);
	});

	it("writes a timestamp that survives a round trip through the schema", () => {
		const data = buildFeedbackData([sampleItem()], true);
		expect(parseFeedbackData(data)).toEqual(data);
	});
});

describe("createFeedbackItem", () => {
	it("records the reviewer and starts with no comment and no arrows", () => {
		const item = createFeedbackItem("Ben Golding");
		expect(item.author).toBe("Ben Golding");
		expect(item.content).toBe("");
		expect(item.targets).toEqual([]);
	});

	it("gives each item a distinct id", () => {
		const first = createFeedbackItem("Ben Golding");
		const second = createFeedbackItem("Ben Golding");
		expect(first.id).not.toBe(second.id);
	});
});

describe("formatFeedbackDate", () => {
	it("includes the year", () => {
		expect(formatFeedbackDate("2026-03-12T04:05:06.000Z")).toContain("2026");
	});

	it("falls back to the raw value when the timestamp cannot be parsed", () => {
		expect(formatFeedbackDate("not a date")).toBe("not a date");
	});
});
