import {
	FeedbackItem,
	formatFeedbackDate,
	GradeData,
	gradePercentage,
} from "./feedbackTypes.ts";
import {
	ARROW_DASH_PATTERN,
	ARROW_STROKE_WIDTH,
	RectLike,
} from "./feedbackGeometry.ts";
import {routeArrow, routeToPath} from "./arrowRouting.ts";
import {InstanceId} from "../types.ts";

// ============================================================
// Feedback annotations for exported images
// ============================================================
//
// The on-screen overlay cannot be exported: it is a separate SVG sitting above
// the canvas, and only the graph's own SVG is serialised. So the annotated
// export rebuilds the boxes and arrows as plain SVG inside the exported
// document.
//
// Everything here is pure string building, driven by rectangles the caller
// measures, so it can be tested without a browser or a live graph.

export const EXPORT_BOX_WIDTH = 240;
export const EXPORT_BOX_PADDING = 10;
export const EXPORT_LINE_HEIGHT = 15;
export const EXPORT_COLUMN_GAP = 60;
export const EXPORT_BOX_GAP = 16;

// Rough wrap. The exported SVG has no layout engine, so each line is placed by
// hand and long words are left to overflow rather than being broken.
export const wrapText = (text: string, charactersPerLine: number): string[] => {
	if (text.trim() === "") {
		return [];
	}
	const lines: string[] = [];
	let current = "";

	text.split(/\s+/).forEach((word) => {
		const candidate = current === "" ? word : `${current} ${word}`;
		if (candidate.length > charactersPerLine && current !== "") {
			lines.push(current);
			current = word;
		} else {
			current = candidate;
		}
	});

	if (current !== "") {
		lines.push(current);
	}
	return lines;
};

const escapeXml = (value: string): string =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

export type ExportAnnotation = {
	item: FeedbackItem;
	colour: string;
	// Where each linked goal sits in the exported drawing.
	targetRects: RectLike[];
	// Every other goal shape, so the exported arrows detour around labels the
	// same way the on-screen ones do. Absent means "route straight".
	obstacles?: RectLike[];
};

export type AnnotationLayout = {
	markup: string;
	// How much wider the drawing needs to be to fit the comment column.
	extraWidth: number;
	// How much taller, if the column of comments runs past the drawing.
	requiredHeight: number;
};

// Builds the comment column and its arrows.
//
// Comments are stacked down the right-hand side, in the same order as the
// panel, and every comment is drawn -- unlike on screen, where only the
// selected one is shown. A static image has no way to select, so it has to
// carry everything, and the per-comment colours are what keep it readable.
export const buildAnnotationLayout = (
	annotations: ExportAnnotation[],
	drawingRight: number,
	drawingTop: number
): AnnotationLayout => {
	if (annotations.length === 0) {
		return {markup: "", extraWidth: 0, requiredHeight: 0};
	}

	const columnLeft = drawingRight + EXPORT_COLUMN_GAP;
	const parts: string[] = [];
	let cursorY = drawingTop;

	annotations.forEach(({item, colour, targetRects, obstacles}) => {
		const heading = `${item.author} — ${formatFeedbackDate(item.createdAt)}`;
		const bodyLines = wrapText(item.content, 34);
		const boxHeight =
			EXPORT_BOX_PADDING * 2
			+ EXPORT_LINE_HEIGHT * (bodyLines.length + 1);

		parts.push(
			`<rect x="${columnLeft}" y="${cursorY}" width="${EXPORT_BOX_WIDTH}" `
			+ `height="${boxHeight}" rx="4" fill="#ffffff" stroke="${colour}" `
			+ `stroke-width="1.5"/>`
		);
		parts.push(
			`<rect x="${columnLeft}" y="${cursorY}" width="5" height="${boxHeight}" `
			+ `fill="${colour}"/>`
		);
		parts.push(
			`<text x="${columnLeft + EXPORT_BOX_PADDING + 5}" `
			+ `y="${cursorY + EXPORT_BOX_PADDING + 10}" font-family="Helvetica, Arial, sans-serif" `
			+ `font-size="10" font-weight="bold" fill="${colour}">${escapeXml(heading)}</text>`
		);

		bodyLines.forEach((line, index) => {
			parts.push(
				`<text x="${columnLeft + EXPORT_BOX_PADDING + 5}" `
				+ `y="${cursorY + EXPORT_BOX_PADDING + 10 + EXPORT_LINE_HEIGHT * (index + 1)}" `
				+ `font-family="Helvetica, Arial, sans-serif" font-size="11" `
				+ `fill="#212529">${escapeXml(line)}</text>`
			);
		});

		// Arrows leave the left edge of the box and land on the right edge of
		// each shape the comment points at.
		const fromX = columnLeft;
		const fromY = cursorY + boxHeight / 2;

		targetRects.forEach((target, index) => {
			const toX = target.right;
			const toY = target.top + target.height / 2;
			// Routed around the other shapes, so the exported image matches what
			// the reviewer saw on screen.
			const route = routeArrow(
				{x: fromX, y: fromY},
				{x: toX, y: toY},
				obstacles ?? []
			);
			parts.push(
				`<path d="${routeToPath(route)}" fill="none" `
				+ `stroke="${colour}" stroke-width="${ARROW_STROKE_WIDTH}" `
				+ `stroke-dasharray="${ARROW_DASH_PATTERN}" stroke-linecap="round" `
				+ `marker-end="url(#feedback-export-head-${index === 0 ? colour.replace("#", "") : colour.replace("#", "")})"/>`
			);
		});

		cursorY += boxHeight + EXPORT_BOX_GAP;
	});

	const usedColours = [...new Set(annotations.map((a) => a.colour))];
	const markers = usedColours
		.map(
			(colour) =>
				`<marker id="feedback-export-head-${colour.replace("#", "")}" `
				+ `viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" `
				+ `markerUnits="userSpaceOnUse" orient="auto">`
				+ `<path d="M 1 1 L 9 5 L 1 9 z" fill="${colour}"/></marker>`
		)
		.join("");

	return {
		markup: `<defs>${markers}</defs>${parts.join("")}`,
		extraWidth: EXPORT_COLUMN_GAP + EXPORT_BOX_WIDTH + EXPORT_BOX_PADDING,
		requiredHeight: cursorY,
	};
};

// Convenience for the caller: pairs each comment with the rectangles of the
// goals it points at, dropping links whose goal is not on the drawing.
export const collectAnnotations = (
	items: FeedbackItem[],
	colourFor: (itemId: string) => string,
	rectFor: (instanceId: InstanceId) => RectLike | null,
	obstaclesFor?: (item: FeedbackItem) => RectLike[]
): ExportAnnotation[] =>
	items.map((item) => ({
		item,
		colour: colourFor(item.id),
		targetRects: item.targets
			.map(rectFor)
			.filter((rect): rect is RectLike => rect !== null),
		obstacles: obstaclesFor ? obstaclesFor(item) : [],
	}));

// ============================================================
// Grade banner for exported images
// ============================================================

export const GRADE_BANNER_PADDING = 16;
export const GRADE_BANNER_LINE_HEIGHT = 15;

export type GradeBanner = {
	markup: string;
	// Vertical space the banner occupies. The drawing is pushed down by this
	// much so the banner sits above everything else.
	height: number;
};

// Builds the header strip carrying the mark and the overall comment.
//
// Returns a zero-height banner for an ungraded model, so the caller can add
// the offset unconditionally.
export const buildGradeBanner = (
	grade: GradeData | null,
	width: number
): GradeBanner => {
	if (!grade) {
		return {markup: "", height: 0};
	}

	const percentage = gradePercentage(grade);
	const scoreText =
		grade.totalOutOf > 0
			? `${grade.totalScore} / ${grade.totalOutOf}`
			: `${grade.totalScore}`;
	const percentageText = percentage === null ? "" : `  (${percentage}%)`;

	const componentText = grade.criteria
		.map(
			(criterion) =>
				`${criterion.label || "Unnamed"}: ${criterion.score}`
				+ (criterion.outOf > 0 ? `/${criterion.outOf}` : "")
		)
		.join("   ");

	const feedbackLines = wrapText(grade.overallFeedback, Math.max(40, Math.floor(width / 7)));

	const parts: string[] = [];
	let y = GRADE_BANNER_PADDING + 22;

	parts.push(
		`<text x="${GRADE_BANNER_PADDING}" y="${y}" `
		+ `font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="bold" `
		+ `fill="#1c5a92">Grade: ${escapeXml(scoreText)}${escapeXml(percentageText)}</text>`
	);
	y += 20;

	if (componentText !== "") {
		parts.push(
			`<text x="${GRADE_BANNER_PADDING}" y="${y}" `
			+ `font-family="Helvetica, Arial, sans-serif" font-size="11" `
			+ `fill="#495057">${escapeXml(componentText)}</text>`
		);
		y += GRADE_BANNER_LINE_HEIGHT + 4;
	}

	if (feedbackLines.length > 0) {
		parts.push(
			`<text x="${GRADE_BANNER_PADDING}" y="${y}" `
			+ `font-family="Helvetica, Arial, sans-serif" font-size="11" font-weight="bold" `
			+ `fill="#212529">Overall feedback</text>`
		);
		y += GRADE_BANNER_LINE_HEIGHT;

		feedbackLines.forEach((line) => {
			parts.push(
				`<text x="${GRADE_BANNER_PADDING}" y="${y}" `
				+ `font-family="Helvetica, Arial, sans-serif" font-size="11" `
				+ `fill="#212529">${escapeXml(line)}</text>`
			);
			y += GRADE_BANNER_LINE_HEIGHT;
		});
	}

	parts.push(
		`<text x="${GRADE_BANNER_PADDING}" y="${y + 4}" `
		+ `font-family="Helvetica, Arial, sans-serif" font-size="9" fill="#6c757d">`
		+ `Graded by ${escapeXml(grade.gradedBy)} on `
		+ `${escapeXml(formatFeedbackDate(grade.gradedAt))}</text>`
	);

	const height = y + GRADE_BANNER_PADDING + 8;

	return {
		markup:
			`<rect x="0" y="0" width="${width}" height="${height}" fill="#f5faff"/>`
			+ `<rect x="0" y="${height - 1}" width="${width}" height="1" fill="#c9d9e6"/>`
			+ parts.join(""),
		height,
	};
};
