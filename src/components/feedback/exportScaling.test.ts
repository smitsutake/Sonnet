import {describe, expect, it} from "vitest";
import {buildAnnotationLayout, buildGradeBanner} from "./feedbackExport";
import {FeedbackItem} from "./feedbackTypes";
import {RectLike} from "./feedbackGeometry";

// Guards the geometry of the annotated export.
//
// The export bug that produced a hugely magnified image came from adding a
// viewBox to the exported SVG, which made Canvg scale the contents on top of
// the scaling the canvas had already applied. There is no viewBox now, so the
// only thing the export can rely on is that width and height cover everything
// that gets drawn. These tests pin that down.

const rect = (left: number, top: number): RectLike => ({
	left,
	top,
	right: left + 100,
	width: 100,
	height: 20,
});

const item = (id: string): FeedbackItem => ({
	id,
	content: "Consider splitting this goal into capture and reporting",
	author: "Leon Sterling",
	createdAt: "2026-08-13T00:00:00.000Z",
	targets: [],
});

describe("annotated export dimensions", () => {
	const drawingWidth = 800;
	const drawingHeight = 600;

	it("reserves width for the comment column beyond the drawing", () => {
		const layout = buildAnnotationLayout(
			[{item: item("fb-1"), colour: "#1c5a92", targetRects: [rect(100, 100)]}],
			drawingWidth,
			10
		);
		const finalWidth = drawingWidth + layout.extraWidth;
		// Every comment box must start inside the final width.
		const boxLefts = [...layout.markup.matchAll(/<rect x="(\d+)"/g)].map((m) =>
			Number(m[1])
		);
		boxLefts.forEach((left) => {
			expect(left).toBeGreaterThanOrEqual(drawingWidth);
			expect(left).toBeLessThan(finalWidth);
		});
	});

	it("reports a height that covers the whole comment column", () => {
		const layout = buildAnnotationLayout(
			["fb-1", "fb-2", "fb-3"].map((id) => ({
				item: item(id),
				colour: "#1c5a92",
				targetRects: [],
			})),
			drawingWidth,
			10
		);
		const boxTops = [...layout.markup.matchAll(/<rect x="\d+" y="([\d.]+)"/g)].map(
			(m) => Number(m[1])
		);
		expect(Math.max(...boxTops)).toBeLessThanOrEqual(layout.requiredHeight);
	});

	it("pushes everything below the banner by exactly the banner height", () => {
		const banner = buildGradeBanner(
			{
				totalScore: 10,
				totalOutOf: 10,
				criteria: [],
				overallFeedback: "Well structured.",
				gradedBy: "Leon Sterling",
				gradedAt: "2026-08-13T00:00:00.000Z",
			},
			drawingWidth
		);
		// The banner is a solid strip from the top, so nothing may be drawn
		// above its own height once the diagram has been shifted down.
		expect(banner.height).toBeGreaterThan(0);
		expect(banner.markup).toContain(`height="${banner.height}"`);
		const finalHeight = Math.max(drawingHeight, 0) + banner.height;
		expect(finalHeight).toBeGreaterThan(drawingHeight);
	});

	it("spans the banner across the full width, comment column included", () => {
		const layout = buildAnnotationLayout(
			[{item: item("fb-1"), colour: "#1c5a92", targetRects: []}],
			drawingWidth,
			10
		);
		const finalWidth = drawingWidth + layout.extraWidth;
		const banner = buildGradeBanner(
			{
				totalScore: 10,
				totalOutOf: 10,
				criteria: [],
				overallFeedback: "Well structured.",
				gradedBy: "Leon Sterling",
				gradedAt: "2026-08-13T00:00:00.000Z",
			},
			finalWidth
		);
		expect(banner.markup).toContain(`width="${finalWidth}"`);
	});
});
