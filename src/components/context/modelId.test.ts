import {describe, expect, it} from "vitest";
import {newModelId} from "./modelId.ts";

describe("newModelId", () => {
	it("looks like an id, not a label", () => {
		expect(newModelId()).toMatch(/^m_\d+_[a-z0-9]+$/);
	});

	it("never repeats across calls", () => {
		const ids = new Set(Array.from({length: 20}, () => newModelId()));
		expect(ids.size).toBe(20);
	});
});
