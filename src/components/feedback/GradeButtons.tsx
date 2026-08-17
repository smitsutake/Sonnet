import React, {useState} from "react";
import Button from "react-bootstrap/Button";
import {useFeedbackContext} from "./feedbackContext.ts";
import {hasGrade} from "./feedbackTypes.ts";
import GradeEditModal from "./GradeEditModal.tsx";

// ============================================================
// Header entry points for grading
// ============================================================
//
// Two separate buttons, because they serve different people:
//
//   Grade       reviewers only, opens the form. Sits with Save, since both
//               are things a reviewer does to the file.
//   Your Grade  anyone, opens the read-only overlay. Sits next to Export,
//               where a student will be looking.
//
// The read-only button is rendered by GradeViewButton below so it can be
// placed separately in the header.

export const GradeEditButton: React.FC = () => {
	const {reviewerName, grade, setGrade} = useFeedbackContext();
	const [showForm, setShowForm] = useState(false);

	if (reviewerName === null) {
		return null;
	}

	return (
		<>
			<Button
				variant="outline-primary"
				className="ms-2"
				onClick={() => setShowForm(true)}
			>
				{hasGrade(grade) ? "Edit Grade" : "Grade"}
			</Button>
			<GradeEditModal
				show={showForm}
				reviewerName={reviewerName}
				existingGrade={grade}
				onCancel={() => setShowForm(false)}
				onSave={(next) => {
					setGrade(next);
					setShowForm(false);
				}}
			/>
		</>
	);
};

export const GradeViewButton: React.FC = () => {
	const {grade, setGradeVisible} = useFeedbackContext();

	if (!hasGrade(grade)) {
		return null;
	}

	return (
		<Button
			variant="outline-primary"
			className="me-2"
			onClick={() => setGradeVisible(true)}
		>
			Your Grade
		</Button>
	);
};
