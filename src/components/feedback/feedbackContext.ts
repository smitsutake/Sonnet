import {createContext, useContext} from "react";
import {InstanceId} from "../types.ts";
import {FeedbackData, FeedbackItem, GradeData} from "./feedbackTypes.ts";

// The context object and its hook live apart from the provider component so
// that the provider module only exports a component. Mixing component and
// non-component exports in one module breaks React Fast Refresh.

export type FeedbackContextProps = {
	// Null until the reviewer has confirmed they are teaching staff and given a
	// name. Non-null means teaching-staff mode is active.
	reviewerName: string | null;
	startReviewSession: (name: string) => void;
	endReviewSession: () => void;

	// Feedback attached to the model that is currently open.
	items: FeedbackItem[];
	addItem: () => void;
	updateItemContent: (id: string, content: string) => void;
	removeItem: (id: string) => void;
	toggleTarget: (id: string, instanceId: InstanceId) => void;

	// Replaces the whole set. Called whenever a file is opened.
	loadItems: (data: FeedbackData | null) => void;

	// True when the open file arrived already carrying feedback. Drives the
	// read-only view for a student opening a reviewed model.
	fileHadFeedback: boolean;

	// id of the box waiting for a goal to be clicked, or null.
	linkingItemId: string | null;
	setLinkingItemId: (id: string | null) => void;

	// The reviewer's verdict on the model as a whole, or null if ungraded.
	grade: GradeData | null;
	setGrade: (grade: GradeData | null) => void;

	// Whether the grade overlay is on screen. Opened automatically once, when
	// a graded file is loaded, and reopened from the "Your Grade" button.
	isGradeVisible: boolean;
	setGradeVisible: (visible: boolean) => void;

	// id of the box the reader has selected, or null for "show everything".
	// Selection is available to students as well as reviewers: it is how a
	// student works out which goals a given comment is about.
	selectedItemId: string | null;
	setSelectedItemId: (id: string | null) => void;
};

export const FeedbackContext = createContext<FeedbackContextProps | null>(null);

export const useFeedbackContext = (): FeedbackContextProps => {
	const context = useContext(FeedbackContext);
	if (!context) {
		throw new Error("useFeedbackContext must be used within FeedbackProvider.");
	}
	return context;
};
