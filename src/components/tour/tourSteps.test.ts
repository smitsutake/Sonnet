import {readdirSync, readFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";
import {
	anchorSelector,
	CATEGORY_GUIDES,
	TOUR_ANCHOR_ATTRIBUTE,
	TOUR_STEPS,
	firstStepAfterGoals,
	tourForPage,
	stepsForStage,
} from "./tourSteps";

// ============================================================
// The tour must point at things that exist
// ============================================================
//
// A guided tour is exactly the kind of feature that rots. Someone renames a
// class, restyles a panel, or moves a button, and the tour quietly highlights
// nothing — with no error, no failing build, and no way to notice short of
// running it by hand.
//
// The paper is blunt about documentation going stale on this project: the
// manual sat untouched from 2019 to 2025. So the tour is wired to the source
// rather than trusted: every anchor a step names must actually be rendered
// somewhere in the app, and every anchor the app renders must be used.

// use fs instead of grep, grep isn't on windows. also work out src/ from this
// file so it doesn't matter where you run vitest from
const SRC_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const sourceFiles = (directory: string = SRC_ROOT): string[] =>
	readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			return sourceFiles(path);
		}
		return entry.name.endsWith(".tsx") ? [path] : [];
	});

// build these from the constant, otherwise renaming it makes the check match
// nothing and still pass. new regex each call because /g remembers lastIndex
const literalAnchor = () =>
	new RegExp(`${TOUR_ANCHOR_ATTRIBUTE}="([^"{]+)"`, "g");

// some components take the anchor as a tourAnchor prop and write it out as
// data-tour={tourAnchor}, which the pattern above can't see. add a spelling
// here if you add another one, or this check quietly stops covering it.
const forwardedAnchor = () => /tourAnchor="([^"{]+)"/g;

const templatedTabAnchor = () =>
	new RegExp(`${TOUR_ANCHOR_ATTRIBUTE}=\\{\`tab-\\$\\{`);

const anchorsInSource = (): Set<string> => {
	const found = new Set<string>();
	sourceFiles().forEach((file) => {
		const text = readFileSync(file, "utf8");
		// Literal attributes: data-tour="goal-tabs"
		[...text.matchAll(literalAnchor())].forEach((match) =>
			found.add(match[1])
		);
		// forwarded: tourAnchor="tool-zoom"
		[...text.matchAll(forwardedAnchor())].forEach((match) =>
			found.add(match[1])
		);
		// Template attributes: data-tour={`tab-${...}`}
		if (templatedTabAnchor().test(text)) {
			CATEGORY_GUIDES.forEach((guide) => found.add(guide.anchor));
		}
	});
	return found;
};

describe("tour anchors", () => {
	it("every step points at an anchor the app renders", () => {
		const rendered = anchorsInSource();
		const missing = TOUR_STEPS.filter(
			(step) => step.anchor && !rendered.has(step.anchor)
		).map((step) => `${step.id} -> ${step.anchor}`);

		expect(missing).toEqual([]);
	});

	it("every anchor in the app is used by a step", () => {
		// An orphaned anchor is dead weight that the next person has to work out
		// the purpose of.
		const used = new Set(
			TOUR_STEPS.map((step) => step.anchor).filter(Boolean)
		);
		const orphaned = [...anchorsInSource()].filter(
			(anchor) => !used.has(anchor)
		);

		expect(orphaned).toEqual([]);
	});

	it("builds a selector that matches the attribute the app writes", () => {
		expect(anchorSelector("goal-tabs")).toBe('[data-tour="goal-tabs"]');
	});
});

describe("tour content", () => {
	it("covers all five goal categories", () => {
		const labels = CATEGORY_GUIDES.map((guide) => guide.label);
		expect(labels).toEqual(["Do", "Be", "Feel", "Concern", "Who"]);
	});

	it("gives every category a definition, examples and a warning", () => {
		CATEGORY_GUIDES.forEach((guide) => {
			expect(guide.summary.trim()).not.toBe("");
			expect(guide.examples.length).toBeGreaterThan(0);
			expect(guide.watchOutFor.trim()).not.toBe("");
		});
	});

	it("gives every step a title and body", () => {
		TOUR_STEPS.forEach((step) => {
			expect(step.title.trim()).not.toBe("");
			expect(step.body.trim()).not.toBe("");
		});
	});

	it("knows where the model half of the guide starts", () => {
		// what the Guide button jumps to on the render model page
		const id = firstStepAfterGoals();
		const step = TOUR_STEPS.find((s) => s.id === id);

		expect(step).toBeDefined();
		expect(["hierarchy", "model"]).toContain(step!.stage);

		// and everything before it really is goal list stuff
		const before = TOUR_STEPS.slice(0, TOUR_STEPS.findIndex((s) => s.id === id));
		before.forEach((s) => expect(["intro", "goals"]).toContain(s.stage));
	});

	it("drops only the canvas steps on the goal list page", () => {
		// the canvas and its toolbar are display:none there. Reset, the goal
		// list toggle and Save/Export are in the header, so they stay.
		const ids = tourForPage(false).steps.map((s) => s.id);

		["model", "shape-palette", "tool-zoom", "tool-colour", "tool-font-size",
			"tool-lines"].forEach((id) => expect(ids).not.toContain(id));
		["reset-model", "toggle-goal-list", "save-export"]
			.forEach((id) => expect(ids).toContain(id));
	});

	it("runs the whole guide from the render model page, starting at step 9", () => {
		const model = tourForPage(true);

		expect(model.steps).toHaveLength(TOUR_STEPS.length);
		expect(model.startAt).toBe(firstStepAfterGoals());
		expect(tourForPage(false).startAt).toBeUndefined();
	});

	it("only marks steps whose anchor is inside the graph section", () => {
		TOUR_STEPS.filter((s) => s.modelPageOnly)
			.forEach((s) => expect(s.stage).toBe("model"));
	});

	it("uses unique step ids", () => {
		const ids = TOUR_STEPS.map((step) => step.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("can be run one stage at a time", () => {
		expect(stepsForStage("goals").length).toBeGreaterThan(0);
		expect(stepsForStage("model").length).toBeGreaterThan(0);
		const total = (["intro", "goals", "hierarchy", "model"] as const)
			.map((stage) => stepsForStage(stage).length)
			.reduce((sum, count) => sum + count, 0);
		expect(total).toBe(TOUR_STEPS.length);
	});
});
