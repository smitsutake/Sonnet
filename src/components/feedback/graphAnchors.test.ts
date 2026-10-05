import {describe, expect, it} from "vitest";
import {instanceIdsFromCellId, primaryInstanceIdOfCell} from "./graphAnchors";
import {generateCellId} from "../utils/GraphUtils";

describe("instanceIdsFromCellId", () => {
	it("reads the instanceId off a functional goal cell", () => {
		expect(instanceIdsFromCellId("Functional-8-1")).toEqual(["8-1"]);
	});

	it("handles the long timestamp ids the editor generates", () => {
		expect(instanceIdsFromCellId("Functional-1786601987939-1")).toEqual([
			"1786601987939-1",
		]);
	});

	it("reads every instanceId off a shared non-functional cell", () => {
		expect(instanceIdsFromCellId("Nonfunctional-[8-1;9-2]")).toEqual([
			"8-1",
			"9-2",
		]);
	});

	it("ignores cells that are not goals", () => {
		expect(instanceIdsFromCellId("legend")).toEqual([]);
		expect(instanceIdsFromCellId(null)).toEqual([]);
		expect(instanceIdsFromCellId("")).toEqual([]);
		expect(instanceIdsFromCellId("Functional-not-an-id")).toEqual([]);
	});

	it("round trips ids produced by the editor's own generator", () => {
		// Guards against the two files drifting apart: if generateCellId ever
		// changes format, this fails rather than silently breaking every link.
		expect(instanceIdsFromCellId(generateCellId("Functional", "8-1"))).toEqual([
			"8-1",
		]);
		expect(
			instanceIdsFromCellId(generateCellId("Nonfunctional", ["8-1", "9-2"]))
		).toEqual(["8-1", "9-2"]);
	});
});

describe("primaryInstanceIdOfCell", () => {
	const fakeCell = (id: string | null) =>
		({getId: () => id}) as unknown as Parameters<typeof primaryInstanceIdOfCell>[0];

	it("returns the goal a shape is anchored on", () => {
		expect(primaryInstanceIdOfCell(fakeCell("Functional-8-1"))).toBe("8-1");
		expect(primaryInstanceIdOfCell(fakeCell("Nonfunctional-[8-1;9-2]"))).toBe(
			"8-1"
		);
	});

	it("returns null for clicks that did not land on a goal", () => {
		expect(primaryInstanceIdOfCell(null)).toBeNull();
		expect(primaryInstanceIdOfCell(fakeCell("legend"))).toBeNull();
	});
});
