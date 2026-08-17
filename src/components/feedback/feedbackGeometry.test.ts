import {describe, expect, it} from "vitest";
import {InstanceId} from "../types";
import {FeedbackItem} from "./feedbackTypes";
import {
	buildArrowPath,
	computeArrowLines,
	RectLike,
	targetsOfItem,
} from "./feedbackGeometry";

const rect = (left: number, top: number, width = 100, height = 20): RectLike => ({
	left,
	top,
	right: left + width,
	width,
	height,
});

const container = rect(0, 0, 1000, 800);

const item = (id: string, targets: InstanceId[]): FeedbackItem => ({
	id,
	content: "",
	author: "Leon Sterling",
	createdAt: "2026-03-12T00:00:00.000Z",
	targets,
});

describe("computeArrowLines", () => {
	it("produces one line per link, relative to the container", () => {
		const lines = computeArrowLines(
			[item("fb-1", ["8-1"])],
			container,
			() => rect(700, 100),
			() => rect(200, 300),
			"fb-1",
			() => "#1c5a92"
		);

		expect(lines).toHaveLength(1);
		// Leaves the left edge of the box, arrives at the right edge of the goal.
		expect(lines[0]).toMatchObject({
			key: "fb-1--8-1",
			fromX: 700,
			fromY: 110,
			toX: 300,
			toY: 310,
		});
	});

	it("draws one line per target when a comment points at several goals", () => {
		const lines = computeArrowLines(
			[item("fb-1", ["8-1", "9-1", "10-2"])],
			container,
			() => rect(700, 100),
			() => rect(200, 300),
			"fb-1",
			() => "#1c5a92"
		);
		expect(lines.map((line) => line.key)).toEqual([
			"fb-1--8-1",
			"fb-1--9-1",
			"fb-1--10-2",
		]);
	});

	it("skips a link whose goal is not on screen", () => {
		// Happens when the goal was deleted, or its cluster is collapsed.
		const lines = computeArrowLines(
			[item("fb-1", ["8-1", "9-1"])],
			container,
			() => rect(700, 100),
			(instanceId) => (instanceId === "8-1" ? rect(200, 300) : null),
			"fb-1",
			() => "#1c5a92"
		);
		expect(lines.map((line) => line.key)).toEqual(["fb-1--8-1"]);
	});

	it("skips a box that is not rendered", () => {
		const lines = computeArrowLines(
			[item("fb-1", ["8-1"])],
			container,
			() => null,
			() => rect(200, 300),
			"fb-1",
			() => "#1c5a92"
		);
		expect(lines).toEqual([]);
	});

	it("returns nothing for comments with no links", () => {
		const lines = computeArrowLines(
			[item("fb-1", [])],
			container,
			() => rect(700, 100),
			() => rect(200, 300),
			"fb-1",
			() => "#1c5a92"
		);
		expect(lines).toEqual([]);
	});

	it("offsets coordinates when the container is not at the page origin", () => {
		const lines = computeArrowLines(
			[item("fb-1", ["8-1"])],
			rect(50, 30, 1000, 800),
			() => rect(700, 100),
			() => rect(200, 300),
			"fb-1",
			() => "#1c5a92"
		);
		expect(lines[0]).toMatchObject({fromX: 650, fromY: 80, toX: 250, toY: 280});
	});
});

describe("computeArrowLines selection", () => {
	it("draws nothing when no comment is selected", () => {
		const lines = computeArrowLines(
			[item("fb-1", ["8-1"]), item("fb-2", ["9-1"])],
			container,
			() => rect(700, 100),
			() => rect(200, 300),
			null,
			() => "#1c5a92"
		);
		expect(lines).toEqual([]);
	});

	it("draws only the selected comment's arrows, in its colour", () => {
		const lines = computeArrowLines(
			[item("fb-1", ["8-1"]), item("fb-2", ["9-1"])],
			container,
			() => rect(700, 100),
			() => rect(200, 300),
			"fb-2",
			(itemId) => (itemId === "fb-2" ? "#c2410c" : "#1c5a92")
		);
		expect(lines).toHaveLength(1);
		expect(lines[0].itemId).toBe("fb-2");
		expect(lines[0].colour).toBe("#c2410c");
	});

	it("carries the comment and goal ids on every line", () => {
		const lines = computeArrowLines(
			[item("fb-1", ["8-1"])],
			container,
			() => rect(700, 100),
			() => rect(200, 300),
			"fb-1",
			() => "#1c5a92"
		);
		expect(lines[0]).toMatchObject({itemId: "fb-1", instanceId: "8-1"});
	});
});

describe("targetsOfItem", () => {
	it("returns nothing when no comment is selected", () => {
		expect(targetsOfItem([item("fb-1", ["8-1"])], null)).toEqual([]);
	});

	it("returns the targets of the selected comment", () => {
		expect(targetsOfItem([item("fb-1", ["8-1", "9-1"])], "fb-1")).toEqual([
			"8-1",
			"9-1",
		]);
	});

	it("returns nothing for a comment that no longer exists", () => {
		expect(targetsOfItem([item("fb-1", ["8-1"])], "fb-9")).toEqual([]);
	});
});

describe("buildArrowPath", () => {
	it("emits a cubic curve between the two endpoints", () => {
		const path = buildArrowPath({
			key: "k",
			itemId: "fb-1",
			instanceId: "8-1",
			colour: "#1c5a92",
			fromX: 700,
			fromY: 110,
			toX: 300,
			toY: 310,
		});
		expect(path.startsWith("M 700 110")).toBe(true);
		expect(path).toContain("C ");
		expect(path.endsWith("300 310")).toBe(true);
	});

	it("keeps a usable curve when the two ends nearly touch", () => {
		const path = buildArrowPath({
			key: "k",
			itemId: "fb-1",
			instanceId: "8-1",
			colour: "#1c5a92",
			fromX: 100,
			fromY: 50,
			toX: 100,
			toY: 60,
		});
		// Minimum control offset stops the curve collapsing into a dot.
		expect(path).toContain("76 50");
	});
});
