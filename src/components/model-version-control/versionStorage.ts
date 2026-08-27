import {get, set} from "idb-keyval";
import {ModelVersion} from "./versionTypes.ts";

// History is kept in IndexedDB rather than localStorage because snapshots hold a
// whole model each and localStorage's ~5MB budget is shared with the rest of the
// app. Scope is a single global list -- the editor only ever holds one model at
// a time.
const STORAGE_KEY = "ammber/versionHistory";

// A safety valve so the store cannot grow without bound. Oldest entries are
// dropped first; a manual (named) checkpoint is never dropped in favour of an
// auto one.
const MAX_VERSIONS = 50;

export const loadVersions = async (): Promise<ModelVersion[]> => {
	try {
		const stored = await get<ModelVersion[]>(STORAGE_KEY);
		return Array.isArray(stored) ? stored : [];
	} catch (error) {
		console.error("Failed to load version history:", error);
		return [];
	}
};

export const saveVersions = async (versions: ModelVersion[]): Promise<void> => {
	try {
		await set(STORAGE_KEY, prune(versions));
	} catch (error) {
		console.error("Failed to save version history:", error);
	}
};

// Keeps the newest MAX_VERSIONS, but only ever drops auto checkpoints. If the
// list is still over budget once every auto entry that can go has gone, the
// oldest manual entries are trimmed too.
const prune = (versions: ModelVersion[]): ModelVersion[] => {
	if (versions.length <= MAX_VERSIONS) {
		return versions;
	}
	const sorted = [...versions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	const kept: ModelVersion[] = [];
	for (const version of sorted) {
		if (kept.length < MAX_VERSIONS || !version.auto) {
			kept.push(version);
		}
	}
	return kept.slice(0, MAX_VERSIONS);
};
