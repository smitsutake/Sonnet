import {createContext, useContext} from "react";
import {FeedbackData, FeedbackItem} from "./feedbackTypes.ts";

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

	// Replaces the whole set. Called whenever a file is opened.
	loadItems: (data: FeedbackData | null) => void;

	// True when the open file arrived already carrying feedback. Drives the
	// read-only view for a student opening a reviewed model.
	fileHadFeedback: boolean;
};

export const FeedbackContext = createContext<FeedbackContextProps | null>(null);

export const useFeedbackContext = (): FeedbackContextProps => {
	const context = useContext(FeedbackContext);
	if (!context) {
		throw new Error("useFeedbackContext must be used within FeedbackProvider.");
	}
	return context;
};
