import React, {useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import {
	createEmptyGrade,
	createGradeCriterion,
	GradeCriterion,
	GradeData,
	MAX_OVERALL_FEEDBACK_LENGTH,
} from "./feedbackTypes.ts";

// ============================================================
// Grading form
// ============================================================
//
// Everything is reviewer-defined: the total, its maximum, and any number of
// named component scores. Nothing is computed or validated against a rubric,
// because AMMBER is used across subjects that mark differently. In particular
// the component scores are NOT required to add up to the total -- a reviewer
// may want a holistic mark alongside indicative parts.

type GradeEditModalProps = {
	show: boolean;
	reviewerName: string;
	existingGrade: GradeData | null;
	onCancel: () => void;
	onSave: (grade: GradeData) => void;
};

// Empty input should mean zero, not NaN, which would end up in the file.
const toNumber = (value: string): number => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
};

const GradeEditModal: React.FC<GradeEditModalProps> = ({
	show,
	reviewerName,
	existingGrade,
	onCancel,
	onSave,
}) => {
	const [draft, setDraft] = useState<GradeData>(() =>
		existingGrade ?? createEmptyGrade(reviewerName)
	);

	// Reload the stored grade each time the dialog opens, so a cancelled edit
	// does not leak into the next one.
	useEffect(() => {
		if (show) {
			setDraft(existingGrade ?? createEmptyGrade(reviewerName));
		}
	}, [show, existingGrade, reviewerName]);

	const updateCriterion = (
		id: string,
		changes: Partial<GradeCriterion>
	) => {
		setDraft((previous) => ({
			...previous,
			criteria: previous.criteria.map((criterion) =>
				criterion.id === id ? {...criterion, ...changes} : criterion
			),
		}));
	};

	const remaining = MAX_OVERALL_FEEDBACK_LENGTH - draft.overallFeedback.length;

	const handleSave = () => {
		onSave({
			...draft,
			// Blank rows are dropped rather than written out, so a reviewer can
			// add a row, change their mind, and just save.
			criteria: draft.criteria.filter(
				(criterion) =>
					criterion.label.trim() !== ""
					|| criterion.score !== 0
					|| criterion.outOf !== 0
			),
			gradedBy: reviewerName,
			gradedAt: new Date().toISOString(),
		});
	};

	return (
		<Modal show={show} onHide={onCancel} centered size="lg" backdrop="static">
			<Modal.Header closeButton>
				<Modal.Title>Grade this model</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form.Group className="mb-4">
					<Form.Label className="fw-semibold">Total score</Form.Label>
					<div className="d-flex align-items-center gap-2">
						<Form.Control
							type="number"
							style={{maxWidth: "8rem"}}
							value={draft.totalScore}
							onChange={(event) =>
								setDraft({...draft, totalScore: toNumber(event.target.value)})
							}
						/>
						<span className="text-muted">out of</span>
						<Form.Control
							type="number"
							style={{maxWidth: "8rem"}}
							value={draft.totalOutOf}
							onChange={(event) =>
								setDraft({...draft, totalOutOf: toNumber(event.target.value)})
							}
						/>
					</div>
				</Form.Group>

				<Form.Group className="mb-4">
					<div className="d-flex justify-content-between align-items-center mb-2">
						<Form.Label className="fw-semibold mb-0">
							Component scores
						</Form.Label>
						<Button
							size="sm"
							variant="outline-primary"
							onClick={() =>
								setDraft({
									...draft,
									criteria: [...draft.criteria, createGradeCriterion()],
								})
							}
						>
							Add component
						</Button>
					</div>

					{draft.criteria.length === 0 ? (
						<p className="text-muted small mb-0">
							Optional. Add components if you want to break the mark down.
						</p>
					) : (
						<Table size="sm" className="mb-0 align-middle">
							<thead>
								<tr>
									<th>Component</th>
									<th style={{width: "7rem"}}>Score</th>
									<th style={{width: "7rem"}}>Out of</th>
									<th style={{width: "3rem"}} />
								</tr>
							</thead>
							<tbody>
								{draft.criteria.map((criterion) => (
									<tr key={criterion.id}>
										<td>
											<Form.Control
												type="text"
												placeholder="e.g. Hierarchy structure"
												value={criterion.label}
												onChange={(event) =>
													updateCriterion(criterion.id, {
														label: event.target.value,
													})
												}
											/>
										</td>
										<td>
											<Form.Control
												type="number"
												value={criterion.score}
												onChange={(event) =>
													updateCriterion(criterion.id, {
														score: toNumber(event.target.value),
													})
												}
											/>
										</td>
										<td>
											<Form.Control
												type="number"
												value={criterion.outOf}
												onChange={(event) =>
													updateCriterion(criterion.id, {
														outOf: toNumber(event.target.value),
													})
												}
											/>
										</td>
										<td>
											<Button
												size="sm"
												variant="outline-secondary"
												aria-label="Remove component"
												onClick={() =>
													setDraft({
														...draft,
														criteria: draft.criteria.filter(
															(other) => other.id !== criterion.id
														),
													})
												}
											>
												×
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					)}
				</Form.Group>

				<Form.Group>
					<Form.Label className="fw-semibold">Overall feedback</Form.Label>
					<Form.Control
						as="textarea"
						rows={6}
						maxLength={MAX_OVERALL_FEEDBACK_LENGTH}
						placeholder="Comments on the model as a whole"
						value={draft.overallFeedback}
						onChange={(event) =>
							setDraft({...draft, overallFeedback: event.target.value})
						}
					/>
					<div
						className={`small mt-1 ${remaining <= 50 ? "text-danger" : "text-muted"}`}
					>
						{remaining} characters remaining
					</div>
				</Form.Group>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onCancel}>
					Cancel
				</Button>
				<Button variant="primary" onClick={handleSave}>
					Save grade
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default GradeEditModal;
