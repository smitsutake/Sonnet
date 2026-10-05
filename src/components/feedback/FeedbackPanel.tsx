import React, {useEffect} from "react";
import type {Cell, EventObject} from "@maxgraph/core";
import Button from "react-bootstrap/Button";
import {InstanceId, TreeGoal} from "../types.ts";
import {useFileContext} from "../context/FileProvider.tsx";
import {useGraph} from "../context/GraphContext.tsx";
import {GRAPH_CLICK_EVENT, primaryInstanceIdOfCell} from "./graphAnchors.ts";
import {FEEDBACK_COLOUR, MAX_FEEDBACK_ITEMS} from "./feedbackColours.ts";
import {useFeedbackContext} from "./feedbackContext.ts";
import {formatFeedbackDate} from "./feedbackTypes.ts";
import "./FeedbackPanel.css";

// ============================================================
// Feedback panel
// ============================================================
//
// Right-hand column shown in two situations:
//   1. a reviewer has entered teaching-staff mode  -> editable
//   2. a student opened a file that already carries feedback -> read only
//
// Linking works by arming a box and then clicking a goal in the hierarchy. The
// click is caught by a document-level listener rather than by changing Tree,
// so the only change needed in Tree is the data attribute that identifies a
// goal row.

// Flattens the tree so a linked instanceId can be shown with its goal text.
const collectGoalLabels = (
	nodes: TreeGoal[],
	into: Map<InstanceId, string>
): Map<InstanceId, string> => {
	nodes.forEach((node) => {
		into.set(node.instanceId, node.content);
		if (node.children && node.children.length > 0) {
			collectGoalLabels(node.children, into);
		}
	});
	return into;
};

const FeedbackPanel: React.FC = () => {
	const {treeData} = useFileContext();
	const {graph} = useGraph();
	const {
		reviewerName,
		items,
		addItem,
		updateItemContent,
		removeItem,
		toggleTarget,
		linkingItemId,
		setLinkingItemId,
		selectedItemId,
		setSelectedItemId,
	} = useFeedbackContext();

	const isEditable = reviewerName !== null;
	const atItemLimit = items.length >= MAX_FEEDBACK_ITEMS;
	const goalLabels = collectGoalLabels(treeData ?? [], new Map());

	// While a box is armed, the next click on a goal row links it. Clicking
	// anywhere else cancels, which avoids leaving the editor in a mode the
	// reviewer has forgotten about.
	useEffect(() => {
		if (linkingItemId === null) {
			return;
		}

		// mousedown, not click.
		//
		// Goal rows in the hierarchy are drag sources. The drag library takes
		// over from mousedown onwards, and the row can be re-rendered before
		// mouseup, so the browser never fires a click event on it at all. A
		// click listener therefore looks correct in tests -- which dispatch
		// click directly -- while doing nothing in a real browser.
		//
		// Capturing mousedown gets in ahead of the drag logic, and stopping
		// propagation there also prevents a link from starting a drag.
		const handlePointerDown = (event: MouseEvent) => {
			const target = event.target as HTMLElement | null;
			if (!target) {
				return;
			}

			// Presses inside the panel are the reviewer operating the panel.
			if (target.closest(".feedback-panel")) {
				return;
			}

			const goalRow = target.closest("[data-goal-instance]");
			if (goalRow) {
				const instanceId = goalRow.getAttribute("data-goal-instance");
				if (instanceId) {
					event.preventDefault();
					event.stopPropagation();
					toggleTarget(linkingItemId, instanceId as InstanceId);
				}
			}

			// Deliberately no "cancel on any other press": the gaps between goal
			// rows are easy to hit, and dropping out of linking mode on a near
			// miss made the feature feel broken. Linking ends only on Esc or on
			// pressing the button again.
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setLinkingItemId(null);
			}
		};

		// Shapes on the rendered model are not DOM elements, so the mousedown
		// listener above cannot see them. maxGraph reports its own clicks, and
		// the cell it hands back carries the instanceId in its id.
		const handleGraphClick = (_sender: unknown, event: EventObject) => {
			const cell = event.getProperty("cell") as Cell | null;
			const instanceId = primaryInstanceIdOfCell(cell);
			if (instanceId) {
				toggleTarget(linkingItemId, instanceId);
				// Stops the click also selecting the shape, which would leave the
				// reviewer with maxGraph's resize handles on screen.
				event.consume();
			}
		};

		if (graph) {
			graph.addListener(GRAPH_CLICK_EVENT, handleGraphClick);
		}

		document.addEventListener("mousedown", handlePointerDown, true);
		document.addEventListener("keydown", handleKeyDown);
		document.body.classList.add("feedback-linking-active");

		return () => {
			if (graph) {
				graph.removeListener(handleGraphClick);
			}
			document.removeEventListener("mousedown", handlePointerDown, true);
			document.removeEventListener("keydown", handleKeyDown);
			document.body.classList.remove("feedback-linking-active");
		};
	}, [linkingItemId, toggleTarget, setLinkingItemId, graph]);

	return (
		<div className="feedback-panel">
			<div className="feedback-panel__header">
				<div>
					<p className="feedback-panel__title">Feedback</p>
					{isEditable && (
						<span className="feedback-panel__reviewer">
							Reviewing as {reviewerName}
						</span>
					)}
				</div>
				{isEditable && (
					<Button
						variant="primary"
						size="sm"
						onClick={addItem}
						disabled={atItemLimit}
						title={
							atItemLimit
								? `A model can carry at most ${MAX_FEEDBACK_ITEMS} comments`
								: "Add new feedback"
						}
						aria-label="Add new feedback"
					>
						+
					</Button>
				)}
			</div>

			<div className="feedback-panel__list">
				{items.length === 0 && (
					<p className="feedback-panel__empty">
						{isEditable
							? "No feedback yet. Use + to add the first comment."
							: "This model has no feedback comments."}
					</p>
				)}

				{items.map((item) => {
					const isLinking = linkingItemId === item.id;
					const isSelected = selectedItemId === item.id;
					const colour = FEEDBACK_COLOUR;
					return (
						<div
							key={item.id}
							data-feedback-id={item.id}
							role="button"
							tabIndex={0}
							aria-pressed={isSelected}
							className={
								"feedback-box"
								+ (isLinking ? " feedback-box--linking" : "")
								+ (isSelected ? " feedback-box--selected" : "")
							}
							// The colour ties the box to the arrows leaving it.
							style={{borderLeft: `5px solid ${colour}`}}
							// Selecting a comment is how a reader finds out which goals
							// it refers to, so it works for students as well as for
							// reviewers. Clicking a selected box clears the selection.
							onClick={() => setSelectedItemId(isSelected ? null : item.id)}
							onKeyDown={(event) => {
								// The box is keyboard-selectable, but Enter and Space
								// must keep their normal meaning inside the comment
								// field: swallowing them here made it impossible to
								// type a space.
								if (event.target !== event.currentTarget) {
									return;
								}
								if (event.key === "Enter" || event.key === " ") {
									event.preventDefault();
									setSelectedItemId(isSelected ? null : item.id);
								}
							}}
						>
							<div className="feedback-box__meta">
								<span className="feedback-box__author" style={{color: colour}}>
									{item.author}
								</span>
								<span>{formatFeedbackDate(item.createdAt)}</span>
							</div>

							{isEditable ? (
								<textarea
									className="feedback-box__text"
									value={item.content}
									placeholder="Write your comment"
									onClick={(event) => event.stopPropagation()}
									onChange={(event) =>
										updateItemContent(item.id, event.target.value)
									}
								/>
							) : (
								<p className="feedback-box__readonly">{item.content}</p>
							)}

							{item.targets.length > 0 && (
								<div className="feedback-box__targets">
									{item.targets.map((instanceId) => (
										<span
											key={instanceId}
											className="feedback-box__target-chip"
											style={{
												borderColor: colour,
												color: colour,
											}}
										>
											{goalLabels.get(instanceId) || "(deleted goal)"}
										</span>
									))}
								</div>
							)}

							{isEditable && (
								<div className="feedback-box__actions">
									<Button
										variant={isLinking ? "primary" : "outline-primary"}
										size="sm"
										onClick={(event) => {
											event.stopPropagation();
											// Arming a box also selects it, so its existing
											// arrows are visible while more are added.
											setSelectedItemId(item.id);
											setLinkingItemId(isLinking ? null : item.id);
										}}
									>
										{isLinking ? "Click a goal…" : "Link goal"}
									</Button>
									<Button
										variant="outline-secondary"
										size="sm"
										onClick={(event) => {
											event.stopPropagation();
											removeItem(item.id);
										}}
									>
										Delete
									</Button>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{linkingItemId !== null ? (
				<p className="text-muted small mt-2 mb-0">
					Click a goal on the <strong>model</strong> or in the hierarchy to
					link or unlink it. Press Esc, or press the button again, when
					done.
				</p>
			) : (
				items.length > 0 && (
					<p className="text-muted small mt-2 mb-0">
						{selectedItemId === null
							? "Select a comment to see the goals it points at."
							: "Click the comment again to hide its arrows."}
						{atItemLimit && ` Limit of ${MAX_FEEDBACK_ITEMS} comments reached.`}
					</p>
				)
			)}
		</div>
	);
};

export default FeedbackPanel;
