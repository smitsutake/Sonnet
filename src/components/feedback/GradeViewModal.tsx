import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import {
	formatFeedbackDate,
	GradeData,
	gradePercentage,
} from "./feedbackTypes.ts";

// ============================================================
// Grade overlay
// ============================================================
//
// Read-only view of the grade, shown over a dimmed editor. It opens by itself
// when a graded model is loaded, so a student cannot miss it, and can be
// reopened from the "Your Grade" button.
//
// Deliberately identical for students and reviewers: a reviewer checking what
// they left should see exactly what the student sees.

type GradeViewModalProps = {
	show: boolean;
	grade: GradeData | null;
	onClose: () => void;
};

const GradeViewModal: React.FC<GradeViewModalProps> = ({show, grade, onClose}) => {
	if (!grade) {
		return null;
	}

	const percentage = gradePercentage(grade);

	return (
		<Modal show={show} onHide={onClose} centered size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Your Grade</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="d-flex align-items-baseline gap-3 mb-4">
					<span style={{fontSize: "2.5rem", fontWeight: 600, color: "#1c5a92"}}>
						{grade.totalScore}
						{grade.totalOutOf > 0 && (
							<span className="text-muted" style={{fontSize: "1.5rem"}}>
								{" / "}
								{grade.totalOutOf}
							</span>
						)}
					</span>
					{percentage !== null && (
						<span className="text-muted">{percentage}%</span>
					)}
				</div>

				{grade.criteria.length > 0 && (
					<Table size="sm" className="mb-4">
						<thead>
							<tr>
								<th>Component</th>
								<th style={{width: "8rem"}} className="text-end">
									Score
								</th>
							</tr>
						</thead>
						<tbody>
							{grade.criteria.map((criterion) => (
								<tr key={criterion.id}>
									<td>{criterion.label || "Unnamed"}</td>
									<td className="text-end">
										{criterion.score}
										{criterion.outOf > 0 && ` / ${criterion.outOf}`}
									</td>
								</tr>
							))}
						</tbody>
					</Table>
				)}

				{grade.overallFeedback.trim() !== "" && (
					<>
						<h6 className="fw-semibold">Overall feedback</h6>
						<p style={{whiteSpace: "pre-wrap"}}>{grade.overallFeedback}</p>
					</>
				)}

				<p className="text-muted small mb-0">
					Graded by {grade.gradedBy} on {formatFeedbackDate(grade.gradedAt)}
				</p>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="primary" onClick={onClose}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default GradeViewModal;
