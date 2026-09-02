import React, {PropsWithChildren, useCallback, useMemo, useState} from "react";
import {InstanceId} from "../types.ts";
import {createFeedbackItem, FeedbackData, FeedbackItem} from "./feedbackTypes.ts";
import {MAX_FEEDBACK_ITEMS} from "./feedbackColours.ts";
import {FeedbackContext} from "./feedbackContext.ts";

// ============================================================
// Feedback session state
// ============================================================
//
// Everything in here is deliberately held in memory only.
//
// The reviewer's name must survive opening one student's file after another
// while the tab stays open, but must NOT survive a refresh, a new tab, a new
// browser or a private window. React state gives us exactly that: React Router
// navigation does not remount the provider, but any real page load does.
//
// This is why we do not use localStorage or sessionStorage here. sessionStorage
// in particular would be wrong -- it survives a refresh.

const FeedbackProvider: React.FC<PropsWithChildren> = ({children}) => {
	const [reviewerName, setReviewerName] = useState<string | null>(null);
	const [items, setItems] = useState<FeedbackItem[]>([]);
	const [fileHadFeedback, setFileHadFeedback] = useState(false);
	const [linkingItemId, setLinkingItemId] = useState<string | null>(null);
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

	const startReviewSession = useCallback((name: string) => {
		setReviewerName(name.trim());
	}, []);

	const endReviewSession = useCallback(() => {
		setReviewerName(null);
		setLinkingItemId(null);
	}, []);

	const addItem = useCallback(() => {
		setItems((previous) => {
			// addItem is only reachable from the panel, which only renders once a
			// session has started, but guard anyway rather than write an item with
			// an empty author into a saved file.
			if (reviewerName === null) {
				return previous;
			}
			// Comments are capped so that every one keeps a distinct colour.
			// Enforced here as well as on the button, so a file that arrives
			// over the limit cannot be pushed further over it.
			if (previous.length >= MAX_FEEDBACK_ITEMS) {
				return previous;
			}
			return [...previous, createFeedbackItem(reviewerName)];
		});
	}, [reviewerName]);

	const updateItemContent = useCallback((id: string, content: string) => {
		setItems((previous) =>
			previous.map((item) => (item.id === id ? {...item, content} : item))
		);
	}, []);

	const removeItem = useCallback((id: string) => {
		setItems((previous) => previous.filter((item) => item.id !== id));
		setLinkingItemId((current) => (current === id ? null : current));
		setSelectedItemId((current) => (current === id ? null : current));
	}, []);

	// One comment can point at many goals, and the same goal can be pointed at
	// by many comments. Clicking a goal that is already linked removes the link.
	const toggleTarget = useCallback((id: string, instanceId: InstanceId) => {
		setItems((previous) =>
			previous.map((item) => {
				if (item.id !== id) {
					return item;
				}
				const alreadyLinked = item.targets.includes(instanceId);
				return {
					...item,
					targets: alreadyLinked
						? item.targets.filter((target) => target !== instanceId)
						: [...item.targets, instanceId],
				};
			})
		);
	}, []);

	const loadItems = useCallback((data: FeedbackData | null) => {
		setItems(data?.items ?? []);
		setFileHadFeedback(data !== null);
		setLinkingItemId(null);
		setSelectedItemId(null);
	}, []);

	const value = useMemo(
		() => ({
			reviewerName,
			startReviewSession,
			endReviewSession,
			items,
			addItem,
			updateItemContent,
			removeItem,
			toggleTarget,
			loadItems,
			fileHadFeedback,
			linkingItemId,
			setLinkingItemId,
			selectedItemId,
			setSelectedItemId,
		}),
		[
			reviewerName,
			startReviewSession,
			endReviewSession,
			items,
			addItem,
			updateItemContent,
			removeItem,
			toggleTarget,
			loadItems,
			fileHadFeedback,
			linkingItemId,
			selectedItemId,
		]
	);

	return (
		<FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>
	);
};

export default FeedbackProvider;
