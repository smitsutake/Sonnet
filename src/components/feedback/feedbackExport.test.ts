import {describe, expect, it} from "vitest";
import {
	buildAnnotationLayout,
	collectAnnotations,
	EXPORT_BOX_WIDTH,
	ExportAnnotation,
	wrapText,
} from "./feedbackExport";
import {FeedbackItem} from "./feedbackTypes";
import {RectLike} from "./feedbackGeometry";

const item = (id: string, content: string, targets: string[] = []): FeedbackItem => ({
	id,
	content,
	author: "Leon Sterling",
	createdAt: "2026-08-13T00:00:00.000Z",
	targets: targets as FeedbackItem["targets"],
});

const rect = (left: number, top: number): RectLike => ({
	left,
	top,
	right: left + 100,
	width: 100,
	height: 20,
});

describe("wrapText", () => {
	it("breaks on whitespace at the given width", () => {
		expect(wrapText("one two three four", 9)).toEqual(["one two", "three", "four"]);
	});

	it("returns nothing for an empty comment", () => {
		expect(wrapText("", 20)).toEqual([]);
		expect(wrapText("   ", 20)).toEqual([]);
	});

	it("keeps an over-long word on its own line rather than dropping it", () => {
		expect(wrapText("short supercalifragilistic", 10)).toEqual([
			"short",
			"supercalifragilistic",
		]);
	});
});

describe("buildAnnotationLayout", () => {
	const annotation = (
		id: string,
		colour: string,
		targets: RectLike[]
	): ExportAnnotation => ({
		item: item(id, "Consider splitting this goal"),
		colour,
		targetRects: targets,
	});

	it("produces nothing when there is no feedback", () => {
		const layout = buildAnnotationLayout([], 500, 10);
		expect(layout.markup).toBe("");
		expect(layout.extraWidth).toBe(0);
	});

	it("draws every comment, not just one", () => {
		// A static image cannot be clicked, so unlike the on-screen overlay the
		// export has to carry all of the comments at once.
		const layout = buildAnnotationLayout(
			[
				annotation("fb-1", "#1c5a92", [rect(100, 100)]),
				annotation("fb-2", "#c2410c", [rect(100, 200)]),
			],
			500,
			10
		);
		expect(layout.markup).toContain("#1c5a92");
		expect(layout.markup).toContain("#c2410c");
	});

	it("reserves room to the right of the drawing", () => {
		const layout = buildAnnotationLayout(
			[annotation("fb-1", "#1c5a92", [rect(100, 100)])],
			500,
			10
		);
		expect(layout.extraWidth).toBeGreaterThan(EXPORT_BOX_WIDTH);
		expect(layout.markup).toContain(`x="560"`);
	});

	it("draws one arrow per linked goal", () => {
		const layout = buildAnnotationLayout(
			[annotation("fb-1", "#1c5a92", [rect(100, 100), rect(100, 300)])],
			500,
			10
		);
		// The marker definition contains a straight <path> of its own, so count
		// only the cubic curves, which are the arrows.
		expect(layout.markup.match(/ C /g)).toHaveLength(2);
	});

	it("emits an arrowhead marker for each colour used", () => {
		const layout = buildAnnotationLayout(
			[
				annotation("fb-1", "#1c5a92", [rect(100, 100)]),
				annotation("fb-2", "#c2410c", [rect(100, 200)]),
			],
			500,
			10
		);
		expect(layout.markup.match(/<marker /g)).toHaveLength(2);
	});

	it("escapes comment text so a stray angle bracket cannot break the file", () => {
		const layout = buildAnnotationLayout(
			[
				{
					item: item("fb-1", 'goal <b>"x" & y</b>'),
					colour: "#1c5a92",
					targetRects: [rect(100, 100)],
				},
			],
			500,
			10
		);
		expect(layout.markup).not.toContain("<b>");
		expect(layout.markup).toContain("&lt;b&gt;");
		expect(layout.markup).toContain("&amp;");
	});

	it("stacks comments downward without overlapping", () => {
		const layout = buildAnnotationLayout(
			[
				annotation("fb-1", "#1c5a92", []),
				annotation("fb-2", "#c2410c", []),
			],
			500,
			10
		);
		const ys = [...layout.markup.matchAll(/<rect x="560" y="([\d.]+)" width="240"/g)].map(
			(m) => Number(m[1])
		);
		expect(ys[0]).toBeLessThan(ys[1]);
	});
});

describe("collectAnnotations", () => {
	it("drops links whose goal is not on the drawing", () => {
		const annotations = collectAnnotations(
			[item("fb-1", "x", ["8-1", "9-1"])],
			() => "#1c5a92",
			(instanceId) => (instanceId === "8-1" ? rect(100, 100) : null)
		);
		expect(annotations[0].targetRects).toHaveLength(1);
	});

	it("keeps a comment that has no visible targets, so its text is still exported", () => {
		const annotations = collectAnnotations(
			[item("fb-1", "general remark", [])],
			() => "#1c5a92",
			() => null
		);
		expect(annotations).toHaveLength(1);
		expect(annotations[0].targetRects).toEqual([]);
	});
});
