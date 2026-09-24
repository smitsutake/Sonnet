// ============================================================
// Guided tour content
// ============================================================
//
// The tour has two jobs, and the second matters more than the first.
//
//   1. where the controls are
//   2. what belongs in each category
//
// New users generally work out the buttons on their own. What stops them is
// not knowing whether something is a Do, a Be or a Feel. That is a modelling
// question, not a UI question, so the wording here needs to be checked by the
// client rather than invented by us.
//
// Steps are declared as data so they can be tested without launching a driver:
// tourSteps.test.ts checks that every anchor a step points at is one the app
// actually renders.

export type TourStepId = string;

export type TourStep = {
	id: TourStepId;
	// data-tour value of the element to highlight. Omit for a step that stands
	// on its own, such as the introduction.
	anchor?: string;
	title: string;
	body: string;
	// Which stage of the editor the step belongs to, so the tour can be run in
	// sections rather than all at once.
	stage: "intro" | "goals" | "hierarchy" | "model";
	// anchor lives inside the graph section, which is display:none on the goal
	// list page - so these steps only run from the render model page
	modelPageOnly?: boolean;
	// which side the popover sits on. only needed for the toolbar - it's narrow
	// and against the right edge, so driver.js puts the popover over it.
	side?: "top" | "right" | "bottom" | "left";
};

// Anchors are attributes rather than CSS selectors on purpose.
//
// A selector like ".btn-primary" breaks the moment someone restyles a button,
// silently and with no error. A data-tour attribute has no other reason to
// exist, so it survives refactoring and greps cleanly.
export const TOUR_ANCHOR_ATTRIBUTE = "data-tour";

export const anchorSelector = (anchor: string): string =>
	`[${TOUR_ANCHOR_ATTRIBUTE}="${anchor}"]`;

// ============================================================
// Category explanations
// ============================================================
//
// PLACEHOLDER WORDING -- needs the client's review.
//
// These definitions are drawn from the do/be/feel framework as described in
// the AMMBER paper, but the examples are ours. Leon teaches this material, so
// the examples that actually help are the ones he uses in class, not ones we
// made up. Treat this block as a draft to be corrected, not as settled copy.

export type CategoryGuide = {
	label: string;
	anchor: string;
	summary: string;
	examples: string[];
	watchOutFor: string;
};

export const CATEGORY_GUIDES: CategoryGuide[] = [
	{
		label: "Do",
		anchor: "tab-do",
		summary: "A functional goal: something the system has to do.",
		examples: ["Record attendance", "Generate a weekly report"],
		watchOutFor:
			"If it describes how well something is done rather than what is done, it is probably a Be.",
	},
	{
		label: "Be",
		anchor: "tab-be",
		summary: "A quality goal: how the system should be while doing its job.",
		examples: ["Reliable", "Easy to learn"],
		watchOutFor:
			"A Be describes the system. If it describes a person's state of mind, it is a Feel.",
	},
	{
		label: "Feel",
		anchor: "tab-feel",
		summary: "An emotional goal: how people should feel when using the system.",
		examples: ["Confident", "Not overwhelmed"],
		watchOutFor:
			"Feel is about the people, not the software. This is the pair most often mixed up with Be.",
	},
	{
		label: "Concern",
		anchor: "tab-concern",
		summary: "An anti-goal: something the system should avoid causing.",
		examples: ["Losing a session's work", "Feeling judged"],
		watchOutFor:
			"A Concern is what you want to prevent, not simply the opposite of a goal you already have.",
	},
	{
		label: "Who",
		anchor: "tab-who",
		summary: "A stakeholder: a person or role involved with the system.",
		examples: ["Student", "Coach"],
		watchOutFor:
			"Name the role rather than an individual, so the model stays readable to someone outside the project.",
	},
];

const categoryStep = (guide: CategoryGuide): TourStep => ({
	id: `category-${guide.label.toLowerCase()}`,
	anchor: guide.anchor,
	title: guide.label,
	body:
		`${guide.summary}<br><br>`
		+ `<strong>For example:</strong> ${guide.examples.join(", ")}.<br><br>`
		+ `<em>${guide.watchOutFor}</em>`,
	stage: "goals",
});

// ============================================================
// The tour
// ============================================================

export const TOUR_STEPS: TourStep[] = [
	{
		id: "intro",
		title: "Building a motivational model",
		body:
			"A motivational model captures what a system should do, how it should "
			+ "be, and how people should feel about it.<br><br>"
			+ "There are three stages, and the bar at the top moves between them: "
			+ "list the goals, arrange them into a hierarchy, then render the model.",
		stage: "intro",
	},
	{
		id: "goal-tabs",
		anchor: "goal-tabs",
		title: "The five categories",
		body:
			"Goals are entered under one of five headings. Getting the category "
			+ "right matters more than getting the wording right first time — you "
			+ "can always reword later.",
		stage: "goals",
	},
	...CATEGORY_GUIDES.map(categoryStep),
	{
		id: "add-goal",
		anchor: "goal-table",
		title: "Adding a goal",
		body:
			"Type into a row and press Enter to start the next one. Leave "
			+ "anything you are unsure about where it is — a model is easier to "
			+ "fix once it is on the screen than in your head.",
		stage: "goals",
	},
	{
		id: "hierarchy",
		anchor: "hierarchy-panel",
		title: "Arranging the hierarchy",
		body:
			"Drag goals from the list into this panel to build the structure. "
			+ "Dragging a goal onto another makes it a child; dragging it "
			+ "sideways changes how deep it sits.",
		stage: "hierarchy",
	},
	{
		id: "progress",
		anchor: "progress-bar",
		title: "Moving between stages",
		body:
			"Use this bar to move on to the rendered model, and to come back. "
			+ "Nothing is lost by switching between stages.",
		stage: "hierarchy",
	},
	{
		id: "model",
		anchor: "model-canvas",
		title: "The rendered model",
		body:
			"The diagram is laid out for you. Goals can still be dragged to "
			+ "tidy up the result, and the toolbar changes colours and font size.",
		modelPageOnly: true,
		stage: "model",
	},
	{
		id: "shape-palette",
		anchor: "shape-palette",
		title: "The shapes",
		body:
			"Drag a shape onto the diagram to add a goal that is not in the "
			+ "list, or to draw a line between two that are. The shapes match the "
			+ "five categories: a parallelogram for a Do, a heart for a Feel, and "
			+ "so on.",
		modelPageOnly: true,
		stage: "model",
		side: "left",
	},
	{
		id: "tool-zoom",
		anchor: "tool-zoom",
		title: "Zoom",
		body:
			"Zoom in and out, and recentre the view. Recentre is the one to "
			+ "reach for after a large model has been dragged off screen.",
		modelPageOnly: true,
		stage: "model",
		side: "left",
	},
	{
		id: "tool-colour",
		anchor: "tool-colour",
		title: "Colour",
		body:
			"Recolours the selected goals. Colour carries no meaning in the "
			+ "notation, so it is free to use for whatever a particular reader "
			+ "needs to see -- grouping by team, say, or marking what is not "
			+ "settled yet.",
		modelPageOnly: true,
		stage: "model",
		side: "left",
	},
	{
		id: "tool-font-size",
		anchor: "tool-font-size",
		title: "Font size",
		body:
			"Scales the text on the diagram. Worth turning up before exporting "
			+ "a model that has to be readable on a slide.",
		modelPageOnly: true,
		stage: "model",
		side: "left",
	},
	{
		id: "tool-lines",
		anchor: "tool-lines",
		title: "Line visibility",
		body:
			"Hides the lines between goals. A dense model is often easier to "
			+ "read once the connections are out of the way, and they come back "
			+ "unchanged.",
		modelPageOnly: true,
		stage: "model",
		side: "left",
	},
	{
		id: "reset-model",
		anchor: "reset-model",
		title: "Starting over",
		body:
			"Empty clears the model completely. Default loads the worked "
			+ "example, which is a quicker way to see what a finished model "
			+ "looks like than building one.<br><br>"
			+ "<em>Neither can be undone, so save first if the current model is "
			+ "worth keeping.</em>",
		stage: "model",
	},
	{
		id: "toggle-goal-list",
		anchor: "toggle-goal-list",
		title: "More room for the diagram",
		body:
			"Hides the goal list so the diagram has the whole window. The list "
			+ "is still there, and nothing in it is lost by hiding it.",
		stage: "model",
	},
	{
		id: "save-export",
		anchor: "save-export",
		title: "Saving and sharing",
		body:
			"Save keeps the model as a .json file you can reopen and keep "
			+ "editing. Export produces a PNG or SVG for a report or a slide.",
		stage: "model",
	},
];

export const stepsForStage = (stage: TourStep["stage"]): TourStep[] =>
	TOUR_STEPS.filter((step) => step.stage === stage);

// step 9 - where the model half starts. the first 8 are all goal list stuff.
const GOAL_LIST_STAGES: TourStep["stage"][] = ["intro", "goals"];

export const firstStepAfterGoals = (): TourStepId | undefined =>
	TOUR_STEPS.find((step) => !GOAL_LIST_STAGES.includes(step.stage))?.id;

// what the guide runs on the page you're on. kept here so the Guide button and
// the automatic open can't drift apart.
export const tourForPage = (showGraphSection: boolean): {
	steps: TourStep[];
	startAt?: TourStepId;
} => showGraphSection
	? {steps: TOUR_STEPS, startAt: firstStepAfterGoals()}
	: {steps: TOUR_STEPS.filter((step) => !step.modelPageOnly)};
