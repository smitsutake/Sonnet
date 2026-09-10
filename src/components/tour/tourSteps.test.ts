import {readdirSync, readFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";
import {
	anchorSelector,
	CATEGORY_GUIDES,
	TOUR_ANCHOR_ATTRIBUTE,
	TOUR_STEPS,
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
