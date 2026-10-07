import React, {useMemo, useState} from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";

import ConfirmModal from "../ConfirmModal.tsx";
import {useVersionHistory} from "./versionContext.ts";
import {byNewest, formatVersionTimestamp} from "./versionFormat.ts";
import {ModelVersion} from "./versionTypes.ts";

type VersionHistoryModalProps = {
	show: boolean;
	onHide: () => void;
};

// A pending restore or delete, confirmed through the one shared ConfirmModal
// rather than two separate ones -- both are "do this to one version, and it
// cannot be undone".
type PendingAction =
	| {type: "restore"; version: ModelVersion}
	| {type: "delete"; version: ModelVersion};

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
	show,
	onHide,
}) => {
	const {versions, loading, saveCheckpoint, renameVersion, deleteVersion, restoreVersion} =
		useVersionHistory();

	const [checkpointLabel, setCheckpointLabel] = useState("");
	const [renamingId, setRenamingId] = useState<string | null>(null);
	const [renameValue, setRenameValue] = useState("");
	const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

	const ordered = useMemo(
		() => [...versions].sort(byNewest),
		[versions]
	);

	const trimmedCheckpointLabel = checkpointLabel.trim();

	const handleSaveCheckpoint = async () => {
		if (trimmedCheckpointLabel.length === 0) {
			return;
		}
		await saveCheckpoint(trimmedCheckpointLabel);
		setCheckpointLabel("");
	};

	const startRename = (version: ModelVersion) => {
		setRenamingId(version.id);
		setRenameValue(version.label);
	};

	const commitRename = async () => {
		if (renamingId === null) {
			return;
		}
		if (renameValue.trim().length > 0) {
			await renameVersion(renamingId, renameValue);
		}
		setRenamingId(null);
	};

	const handleConfirmPendingAction = async () => {
		if (pendingAction === null) {
			return;
		}
		if (pendingAction.type === "restore") {
			restoreVersion(pendingAction.version.id);
			setPendingAction(null);
			// The editor now shows the restored version -- nothing left to look
			// at here.
			onHide();
		} else {
			await deleteVersion(pendingAction.version.id);
			setPendingAction(null);
		}
	};

	return (
		<>
			<Modal show={show} onHide={onHide} centered size="lg">
				<Modal.Header closeButton>
					<Modal.Title>Version History</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{/* Manual, named checkpoint. Auto checkpoints happen on their own
					    every time Save is clicked -- this is the "do it by hand, with
					    a label I'll recognise" path. */}
					<InputGroup className="mb-3">
						<Form.Control
							placeholder="Name this checkpoint (e.g. Before restructuring goals)"
							value={checkpointLabel}
							onChange={(event) => setCheckpointLabel(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									event.preventDefault();
									void handleSaveCheckpoint();
								}
							}}
						/>
						<Button
							variant="primary"
							disabled={trimmedCheckpointLabel.length === 0}
							onClick={handleSaveCheckpoint}
						>
							Save checkpoint
						</Button>
					</InputGroup>

					{loading ? (
						<p className="text-muted mb-0">Loading…</p>
					) : ordered.length === 0 ? (
						<p className="text-muted mb-0">
							No saved versions yet. A checkpoint is stored every time you
							save the model.
						</p>
					) : (
						<ListGroup>
							{ordered.map((version) => (
								<ListGroup.Item
									key={version.id}
									className="d-flex justify-content-between align-items-center gap-2"
								>
									{renamingId === version.id ? (
										<InputGroup size="sm" className="flex-grow-1">
											<Form.Control
												autoFocus
												value={renameValue}
												onChange={(event) => setRenameValue(event.target.value)}
												onKeyDown={(event) => {
													if (event.key === "Enter") {
														event.preventDefault();
														void commitRename();
													} else if (event.key === "Escape") {
														setRenamingId(null);
													}
												}}
											/>
											<Button variant="outline-secondary" onClick={() => setRenamingId(null)}>
												Cancel
											</Button>
											<Button variant="primary" onClick={commitRename}>
												Save
											</Button>
										</InputGroup>
									) : (
										<>
											<div className="flex-grow-1">
												<div className="fw-semibold">{version.label}</div>
												<div className="text-muted small">
													{formatVersionTimestamp(version.createdAt)}
												</div>
											</div>
											<Badge bg={version.auto ? "secondary" : "primary"}>
												{version.auto ? "Auto" : "Named"}
											</Badge>
											<Button
												size="sm"
												variant="outline-primary"
												onClick={() => setPendingAction({type: "restore", version})}
											>
												Restore
											</Button>
											<Button
												size="sm"
												variant="outline-secondary"
												onClick={() => startRename(version)}
											>
												Rename
											</Button>
											<Button
												size="sm"
												variant="outline-danger"
												onClick={() => setPendingAction({type: "delete", version})}
											>
												Delete
											</Button>
										</>
									)}
								</ListGroup.Item>
							))}
						</ListGroup>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={onHide}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>

			<ConfirmModal
				show={pendingAction !== null}
				title={pendingAction?.type === "restore" ? "Restore this version?" : "Delete this version?"}
				message={
					pendingAction?.type === "restore" ? (
						<>
							Replace the model currently open with{" "}
							<strong>{pendingAction.version.label}</strong>? Anything you
							have changed since your last save will be lost.
						</>
					) : (
						<>
							Delete <strong>{pendingAction?.version.label}</strong>? This
							cannot be undone.
						</>
					)
				}
				onHide={() => setPendingAction(null)}
				onConfirm={handleConfirmPendingAction}
			/>
		</>
	);
};

export default VersionHistoryModal;
