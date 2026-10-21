import {describe, expect, it} from "vitest";
import {prune} from "./versionStorage.ts";
import {ModelVersion} from "./versionTypes.ts";

// minute 0 is the oldest; higher minutes are newer.
const version = (minute: number, auto: boolean): ModelVersion => ({
	id: `v_${minute}`,
	label: `v${minute}`,
	createdAt: new Date(Date.UTC(2026, 0, 1, 0, minute)).toISOString(),
	auto,
	snapshot: {tabData: [], treeData: []},
});

describe("prune", () => {
	it("leaves a list within budget untouched", () => {
		const versions = [version(1, true), version(0, false)];
		expect(prune(versions)).toBe(versions);
	});

	it("keeps an old named checkpoint over newer auto ones", () => {
		const named = version(0, false);
		const autos = Array.from({length: 55}, (_, i) => version(i + 1, true));
		const kept = prune([named, ...autos]);

		expect(kept).toHaveLength(50);
		expect(kept).toContainEqual(named);
		// The 49 newest autos fill the rest; the oldest autos go.
		expect(kept.filter((v) => v.auto).map((v) => v.id)).toEqual(
			autos.slice(-49).reverse().map((v) => v.id)
		);
	});

	it("trims the oldest named checkpoints only once no auto ones are left", () => {
		const named = Array.from({length: 52}, (_, i) => version(i, false));
		const kept = prune([...named, version(60, true)]);

		expect(kept).toHaveLength(50);
		expect(kept.every((v) => !v.auto)).toBe(true);
		expect(kept.map((v) => v.id)).not.toContain("v_0");
		expect(kept.map((v) => v.id)).not.toContain("v_1");
	});
});
