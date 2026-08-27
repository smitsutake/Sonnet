import React, {useMemo} from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";

import {useVersionHistory} from "./versionContext.ts";
import {byNewest, formatVersionTimestamp} from "./versionFormat.ts";

type VersionHistoryModalProps = {
	show: boolean;
	onHide: () => void;
};

// Lists every saved version, newest first. Restore / rename / delete controls
// are added in later stages.
const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
	show,
	onHide,
}) => {
	const {versions, loading} = useVersionHistory();

	const ordered = useMemo(
		() => [...versions].sort(byNewest),
		[versions]
	);

	return (
		<Modal show={show} onHide={onHide} centered size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Version History</Modal.Title>
			</Modal.Header>
			<Modal.Body>
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
								className="d-flex justify-content-between align-items-center"
							>
								<div>
									<div className="fw-semibold">{version.label}</div>
									<div className="text-muted small">
										{formatVersionTimestamp(version.createdAt)}
									</div>
								</div>
								<Badge bg={version.auto ? "secondary" : "primary"}>
									{version.auto ? "Auto" : "Named"}
								</Badge>
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
	);
};

export default VersionHistoryModal;
