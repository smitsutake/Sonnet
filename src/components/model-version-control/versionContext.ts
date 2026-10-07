import {createContext, useContext} from "react";
import {ModelVersion} from "./versionTypes.ts";

// The context object and its hook are kept apart from the provider component so
// the provider module only exports a component (keeps React Fast Refresh happy),
// matching the pattern used by feedbackContext.

export type VersionHistoryContextProps = {
	versions: ModelVersion[];
	loading: boolean;

	// Take a snapshot of the model currently open. `label` undefined means an
	// automatic checkpoint (labelled with a timestamp); a string means a manual
	// named checkpoint.
	saveCheckpoint: (label?: string) => Promise<void>;

	renameVersion: (id: string, label: string) => Promise<void>;
	deleteVersion: (id: string) => Promise<void>;

	// Replace the model currently open with the one stored in this version.
	restoreVersion: (id: string) => void;
};

export const VersionHistoryContext =
	createContext<VersionHistoryContextProps | null>(null);

export const useVersionHistory = (): VersionHistoryContextProps => {
	const context = useContext(VersionHistoryContext);
	if (!context) {
		throw new Error(
			"useVersionHistory must be used within VersionHistoryProvider."
		);
	}
	return context;
};
