import React, {PropsWithChildren, useCallback, useEffect, useState} from "react";

import {useFileContext} from "../context/FileProvider.tsx";
import {reset} from "../context/treeDataSlice.ts";
import {useFeedbackContext} from "../feedback/feedbackContext.ts";
import {
	buildFeedbackData,
	hasGrade,
	parseFeedbackData,
} from "../feedback/feedbackTypes.ts";

import {VersionHistoryContext} from "./versionContext.ts";
import {loadVersions, saveVersions} from "./versionStorage.ts";
import {tabContentToInitialTabs} from "./snapshotConversion.ts";
import {ModelSnapshot, ModelVersion, newVersionId} from "./versionTypes.ts";

// Label used for automatic checkpoints (those taken when the user clicks Save).
const autoLabel = (date: Date): string =>
	date.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

const VersionHistoryProvider: React.FC<PropsWithChildren> = ({children}) => {
	const {treeData, tabData, dispatch} = useFileContext();
	const {
		items: feedbackItems,
		reviewerName,
		fileHadFeedback,
		grade,
		loadItems,
	} = useFeedbackContext();

	const [versions, setVersions] = useState<ModelVersion[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		loadVersions().then((stored) => {
			if (!cancelled) {
				setVersions(stored);
				setLoading(false);
			}
		});
		return () => {
			cancelled = true;
		};
	}, []);

	// Persist on every change so a page reload keeps the history.
	const persist = useCallback((next: ModelVersion[]) => {
		setVersions(next);
		void saveVersions(next);
	}, []);

	// Same feedback block a file save writes: a model is "reviewed" if a reviewer
	// is signed in now or the file already carried feedback (see SaveFileButton).
	const currentSnapshot = useCallback((): ModelSnapshot => {
		const wasReviewed = reviewerName !== null || fileHadFeedback;
		return {
			tabData,
			treeData: treeData || [],
			feedback: {
				...buildFeedbackData(feedbackItems, wasReviewed || hasGrade(grade)),
				...(hasGrade(grade) && grade ? {grade} : {}),
			},
		};
	}, [tabData, treeData, feedbackItems, reviewerName, fileHadFeedback, grade]);

	const saveCheckpoint = useCallback(
		async (label?: string) => {
			const now = new Date();
			const version: ModelVersion = {
				id: newVersionId(),
				label: label?.trim() || autoLabel(now),
				createdAt: now.toISOString(),
				auto: label === undefined,
				snapshot: currentSnapshot(),
			};
			persist([version, ...versions]);
		},
		[versions, currentSnapshot, persist]
	);

	const renameVersion = useCallback(
		async (id: string, label: string) => {
			persist(
				versions.map((v) =>
					v.id === id ? {...v, label: label.trim() || v.label} : v
				)
			);
		},
		[versions, persist]
	);

	const deleteVersion = useCallback(
		async (id: string) => {
			persist(versions.filter((v) => v.id !== id));
		},
		[versions, persist]
	);

	const restoreVersion = useCallback(
		(id: string) => {
			const version = versions.find((v) => v.id === id);
			if (!version) {
				return;
			}
			const {snapshot} = version;
			dispatch(
				reset({
					tabData: tabContentToInitialTabs(
						snapshot.tabData,
						snapshot.treeData
					),
					treeData: snapshot.treeData,
				})
			);
			loadItems(parseFeedbackData(snapshot.feedback));
		},
		[versions, dispatch, loadItems]
	);

	return (
		<VersionHistoryContext.Provider
			value={{
				versions,
				loading,
				saveCheckpoint,
				renameVersion,
				deleteVersion,
				restoreVersion,
			}}
		>
			{children}
		</VersionHistoryContext.Provider>
	);
};

export default VersionHistoryProvider;
