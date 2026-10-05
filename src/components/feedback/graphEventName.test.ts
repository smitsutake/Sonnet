import {readFileSync} from "node:fs";
import {describe, expect, it} from "vitest";
import {GRAPH_CLICK_EVENT} from "./graphAnchors";

describe("GRAPH_CLICK_EVENT", () => {
	it("still matches maxGraph's own click event name", () => {
		// GRAPH_CLICK_EVENT is written as a literal so that no component has to
		// import maxGraph at runtime -- the package's ESM entry point cannot be
		// resolved by vitest, so importing it anywhere makes that component
		// untestable.
		//
		// That trade-off is only safe if the value is checked against the
		// library, so the constant is read straight out of the installed
		// package. If maxGraph renames the event, this fails instead of every
		// link silently doing nothing.
		const source = readFileSync(
			"node_modules/@maxgraph/core/lib/view/event/InternalEvent.js",
			"utf8"
		);
		const match = source.match(/InternalEvent\.CLICK\s*=\s*'([^']+)'/);
		expect(match).not.toBeNull();
		expect(GRAPH_CLICK_EVENT).toBe(match![1]);
	});
});
