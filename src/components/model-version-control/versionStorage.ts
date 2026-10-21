import {del, get, keys, set} from "idb-keyval";
import {byNewest} from "./versionFormat.ts";
import {ModelVersion} from "./versionTypes.ts";

// History is kept in IndexedDB rather than localStorage because snapshots hold a
// whole model each and localStorage's ~5MB budget is shared with the rest of the
// app.
//
// Scoped per model, keyed by the model's own id (see modelId.ts) rather than
// held in one global list: the editor only ever has one model open at a time,
// but IndexedDB persists across the browser being closed and reopened, and
// several different models get opened in the same browser over time (a
// student's own file, a sample model, a classmate's file to look at). A
// single shared list would mix all of their checkpoints together and show
// every one of them regardless of which model is currently open.
const STORAGE_KEY_PREFIX = "ammber/versionHistory/";

const storageKey = (modelId: string): string => `${STORAGE_KEY_PREFIX}${modelId}`;

// A safety valve so one model's store cannot grow without bound. Oldest
// entries are dropped first; a manual (named) checkpoint is never dropped in
// favour of an auto one.
const MAX_VERSIONS = 50;

export const loadVersions = async (modelId: string): Promise<ModelVersion[]> => {
	try {
		const stored = await get<ModelVersion[]>(storageKey(modelId));
		return Array.isArray(stored) ? stored : [];
	} catch (error) {
		console.error("Failed to load version history:", error);
		return [];
	}
};

export const saveVersions = async (
	modelId: string,
	versions: ModelVersion[]
): Promise<void> => {
	try {
		const pruned = prune(versions);
		if (pruned.length === 0) {
			// idb-keyval happily stores an empty array, but there is no reason to
			// keep a key around for a model with no checkpoints left.
			await del(storageKey(modelId));
			return;
		}
		await set(storageKey(modelId), pruned);
	} catch (error) {
		console.error("Failed to save version history:", error);
	}
};

// Every model id this browser has ever stored history for. Not currently
// surfaced in the UI (Version History only ever shows the model that is
// open), but kept here rather than reaching for idb-keyval's `keys()`
// elsewhere, so a future "browse all my models" view has one place to start.
export const storedModelIds = async (): Promise<string[]> => {
	try {
		const allKeys = await keys<IDBValidKey>();
		return allKeys
			.filter((key): key is string => typeof key === "string")
			.filter((key) => key.startsWith(STORAGE_KEY_PREFIX))
			.map((key) => key.slice(STORAGE_KEY_PREFIX.length));
	} catch (error) {
		console.error("Failed to list stored model histories:", error);
		return [];
	}
};

// Keeps the newest MAX_VERSIONS, but only ever drops auto checkpoints. If the
// list is still over budget once every auto entry that can go has gone, the
// oldest manual entries are trimmed too.
export const prune = (versions: ModelVersion[]): ModelVersion[] => {
	if (versions.length <= MAX_VERSIONS) {
		return versions;
	}
	const sorted = [...versions].sort(byNewest);
	// Manual entries claim their slots first; auto entries only get whatever
	// budget is left over.
	const manual = sorted.filter((v) => !v.auto).slice(0, MAX_VERSIONS);
	const auto = sorted
		.filter((v) => v.auto)
		.slice(0, MAX_VERSIONS - manual.length);
	return [...manual, ...auto].sort(byNewest);
};
