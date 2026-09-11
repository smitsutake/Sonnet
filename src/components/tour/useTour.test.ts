/**
 * @vitest-environment jsdom
 */
import {afterEach, describe, expect, it} from "vitest";
import {findRenderedAnchor, isRendered, resolveSteps} from "./useTour";
import {TourStep} from "./tourSteps";

const step = (id: string, anchor?: string): TourStep => ({
	id,
	anchor,
	title: id,
	body: id,
	stage: "goals",
});

// jsdom doesn't lay anything out so everything is 0x0. fake the size on the
// elements that would be visible in a real browser
const sized = (element: Element, width: number, height: number): Element => {
	element.getBoundingClientRect = () =>
		({width, height, top: 0, left: 0, right: width, bottom: height,
			x: 0, y: 0, toJSON: () => ({})}) as DOMRect;
	return element;
};

const mount = (html: string): HTMLElement => {
	document.body.innerHTML = html;
	return document.body;
};

afterEach(() => {
	document.body.innerHTML = "";
});

describe("isRendered", () => {
	it("accepts an element that occupies space", () => {
		const element = sized(mount('<div id="a"></div>').querySelector("#a")!, 100, 20);
		expect(isRendered(element)).toBe(true);
	});

	it("rejects an element that exists but measures nothing", () => {
		// this is the case that was broken - SectionPanel display:none's the
		// model canvas but keeps it mounted
		const element = mount('<div id="a" style="display:none"></div>').querySelector("#a")!;
		expect(isRendered(element)).toBe(false);
	});
});

describe("findRenderedAnchor", () => {
	it("skips hidden copies and returns the one on screen", () => {
		// goal-table exists 5 times (one per tab pane), 4 of them hidden.
		// taking the first one only works when you're on the Do tab
		const root = mount(`
			<table data-tour="goal-table" id="do"></table>
			<table data-tour="goal-table" id="be"></table>
			<table data-tour="goal-table" id="feel"></table>
		`);
		sized(root.querySelector("#feel")!, 719, 97);

		expect(findRenderedAnchor("goal-table", root)?.id).toBe("feel");
	});

	it("returns nothing when every copy is hidden", () => {
		const root = mount('<div data-tour="model-canvas"></div>');
		expect(findRenderedAnchor("model-canvas", root)).toBeNull();
	});
});

describe("resolveSteps", () => {
	it("resolves each step to the element it will highlight", () => {
		const element = sized(mount('<div id="a"></div>').querySelector("#a")!, 10, 10);
		const resolved = resolveSteps([step("a", "one")], () => element);

		expect(resolved).toHaveLength(1);
		expect(resolved[0].element).toBe(element);
	});

	it("drops steps whose anchor is not on screen", () => {
		const steps = [step("a", "one"), step("b", "two")];
		const resolved = resolveSteps(steps, (anchor) =>
			anchor === "one" ? document.createElement("div") : null
		);
		expect(resolved.map((r) => r.step.id)).toEqual(["a"]);
	});

	it("always keeps steps that have no anchor", () => {
		const resolved = resolveSteps([step("intro"), step("a", "one")], () => null);
		expect(resolved.map((r) => r.step.id)).toEqual(["intro"]);
	});

	it("returns nothing when the page has none of the anchors", () => {
		expect(resolveSteps([step("a", "one")], () => null)).toEqual([]);
	});
});
