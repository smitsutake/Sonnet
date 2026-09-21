import React, {useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

// ============================================================
// Entry gate for teaching-staff mode
// ============================================================
//
// Two steps: confirm the person is teaching staff, then take their name.
//
// The confirm step is a placeholder for a real credential check. It is NOT a
// security control and is not treated as one anywhere in the code -- the file
// is on the reviewer's own machine and anyone can open it in the normal editor.
// It exists so the flow and the surrounding UI can be built and reviewed now,
// and swapped for a password later without touching the rest of the feature.

type Step = "confirm" | "name";

type TeacherGateModalProps = {
	show: boolean;
	onCancel: () => void;
	onConfirm: (name: string) => void;
};

const TeacherGateModal: React.FC<TeacherGateModalProps> = ({
	show,
	onCancel,
	onConfirm,
}) => {
	const [step, setStep] = useState<Step>("confirm");
	const [name, setName] = useState("");
	const [touched, setTouched] = useState(false);

	// Reset whenever the dialog is reopened so a cancelled attempt does not
	// leave a half-filled form behind.
	useEffect(() => {
		if (show) {
			setStep("confirm");
			setName("");
			setTouched(false);
		}
	}, [show]);

	const trimmedName = name.trim();
	const nameIsValid = trimmedName.length > 0;

	const handleSubmitName = () => {
		setTouched(true);
		if (nameIsValid) {
			onConfirm(trimmedName);
		}
	};

	return (
		<Modal show={show} onHide={onCancel} centered backdrop="static">
			{step === "confirm" ? (
				<>
					<Modal.Header closeButton>
						<Modal.Title>Are you a teacher?</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<p className="mb-0">
							This area is for teaching staff reviewing student models.
						</p>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={onCancel}>
							No
						</Button>
						<Button variant="primary" onClick={() => setStep("name")}>
							Yes
						</Button>
					</Modal.Footer>
				</>
			) : (
				<>
					<Modal.Header closeButton>
						<Modal.Title>Your name?</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form.Group controlId="reviewerName">
							<Form.Label>
								This name is recorded against every comment you leave.
							</Form.Label>
							<Form.Control
								autoFocus
								type="text"
								value={name}
								isInvalid={touched && !nameIsValid}
								placeholder="e.g. Leon Sterling"
								onChange={(event) => setName(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										event.preventDefault();
										handleSubmitName();
									}
								}}
							/>
							<Form.Control.Feedback type="invalid">
								Please enter a name.
							</Form.Control.Feedback>
						</Form.Group>
						<p className="text-muted small mt-3 mb-0">
							Your name is kept only while this tab stays open. Refreshing or
							closing the tab clears it.
						</p>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={onCancel}>
							Cancel
						</Button>
						<Button variant="primary" onClick={handleSubmitName}>
							Continue
						</Button>
					</Modal.Footer>
				</>
			)}
		</Modal>
	);
};

export default TeacherGateModal;
