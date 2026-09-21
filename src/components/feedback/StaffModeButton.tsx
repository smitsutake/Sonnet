import React, {useState} from "react";
import Button from "react-bootstrap/Button";
import {useFeedbackContext} from "./feedbackContext.ts";
import TeacherGateModal from "./TeacherGateModal.tsx";

// ============================================================
// Staff mode switch
// ============================================================
//
// Sits in the top-right of the welcome screen, away from Create and Open,
// because it is a mode switch rather than a third thing to do with a model.
//
// Turning it on does not change what the welcome screen offers: Create and
// Open behave exactly as before. It only adds Mark model, and turns on the
// feedback panel inside the editor.

const StaffModeButton: React.FC = () => {
	const {reviewerName, startReviewSession, endReviewSession} =
		useFeedbackContext();
	const [showGate, setShowGate] = useState(false);

	const isActive = reviewerName !== null;

	return (
		<div className="d-flex align-items-center gap-2">
			{isActive && (
				// Given its own solid chip rather than plain text, which was
				// unreadable over the background image.
				<span
					className="px-3 py-1 rounded-pill small"
					style={{backgroundColor: "#ffffff", border: "1px solid #ced4da"}}
				>
					{reviewerName}
				</span>
			)}
			{/* Solid, and the same size as Create and Open.
			    The outline variant is transparent, so the carousel and the
			    background image showed through and the label was hard to read. */}
			<Button
				variant={isActive ? "secondary" : "primary"}
				size="lg"
				onClick={() => (isActive ? endReviewSession() : setShowGate(true))}
			>
				{isActive ? "Staff mode: on" : "Staff mode"}
			</Button>
			<TeacherGateModal
				show={showGate}
				onCancel={() => setShowGate(false)}
				onConfirm={(name) => {
					startReviewSession(name);
					setShowGate(false);
				}}
			/>
		</div>
	);
};

export default StaffModeButton;
