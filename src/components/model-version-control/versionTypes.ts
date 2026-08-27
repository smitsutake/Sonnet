import {TabContent, TreeGoal} from "../types.ts";
import {FeedbackData} from "../feedback/feedbackTypes.ts";

// A full picture of the model at one point in time. These are exactly the three
// pieces that make up a saved .json file (see JSONData in FileProvider), so a
// snapshot can be restored the same way opening a file is.
export type ModelSnapshot = {
	tabData: TabContent[];
	treeData: TreeGoal[];
	feedback?: FeedbackData;
};

// One entry in the Version History list.
export type ModelVersion = {
	id: string;
	// Shown in the list. Auto checkpoints get a timestamp label; manual ones get
	// whatever the user typed.
	label: string;
	// ISO timestamp of when the checkpoint was taken.
	createdAt: string;
	// true when created automatically by clicking Save, false when the user
	// saved a named checkpoint by hand.
	auto: boolean;
	snapshot: ModelSnapshot;
};

export const newVersionId = (): string =>
	`v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
