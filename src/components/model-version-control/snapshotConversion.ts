import {InitialTab} from "../../data/initialTabs.ts";
import {TabContent, TreeGoal} from "../types.ts";

// Restoring a snapshot goes through the same `reset` reducer action that opening
// a file does, and that action wants tabs shaped as InitialTab[] (label/icon/
// rows) rather than the TabContent[] (label/icon/goalIds) a snapshot stores.
// This is the same conversion WelcomeButtons does on file open.
export const tabContentToInitialTabs = (
	tabData: TabContent[],
	treeData: TreeGoal[]
): InitialTab[] => {
	const allGoals: Record<number, TreeGoal> = {};
	const index = (goals: TreeGoal[]) => {
		(goals || []).forEach((goal) => {
			allGoals[goal.id] = goal;
			index(goal.children || []);
		});
	};
	index(treeData || []);

	return (tabData || []).map((tab) => ({
		label: tab.label,
		icon: tab.icon,
		rows: (tab.goalIds || [])
			.map((id) => allGoals[id])
			.filter(Boolean),
	}));
};
