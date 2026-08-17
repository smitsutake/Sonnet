// ============================================================
// Colours for feedback comments
// ============================================================
//
// Each comment gets its own colour so that a box and the arrows leaving it can
// be matched by eye. The palette is fixed at twenty entries and comments are
// capped at the same number, so no two comments on a model ever share a
// colour and the mapping stays stable as comments are added or deleted.
//
// Colours are assigned by position in the list rather than stored in the file.
// That keeps the saved format unchanged and means a reviewer deleting a
// comment does not leave a gap in the palette.

export const MAX_FEEDBACK_ITEMS = 20;

// Twenty hues chosen to stay distinguishable against the pale panel
// background, and dark enough for white text to be unnecessary.
export const FEEDBACK_COLOURS = [
	"#1c5a92",
	"#c2410c",
	"#15803d",
	"#7e22ce",
	"#b91c1c",
	"#0f766e",
	"#a16207",
	"#4338ca",
	"#be185d",
	"#166534",
	"#0369a1",
	"#9a3412",
	"#6d28d9",
	"#065f46",
	"#854d0e",
	"#9f1239",
	"#1e40af",
	"#3f6212",
	"#86198f",
	"#374151",
] as const;

// Colour for the comment at the given position. Wraps defensively, although
// the item cap means it should never need to.
export const feedbackColourAt = (index: number): string =>
	FEEDBACK_COLOURS[index % FEEDBACK_COLOURS.length];

// Builds a lookup from comment id to colour, so components do not have to
// track list positions themselves.
export const buildColourMap = (
	itemIds: string[]
): Record<string, string> =>
	Object.fromEntries(
		itemIds.map((id, index) => [id, feedbackColourAt(index)])
	);

// A faded version of the same colour, used for arrows that belong to a
// comment other than the selected one.
export const fadeColour = (colour: string): string => `${colour}59`;
