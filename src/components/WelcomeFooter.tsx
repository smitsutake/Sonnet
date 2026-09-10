import {useState} from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

type WelcomeFooterProps = {
	onPapersClick?: () => void;
};

// Footer section in welcome page including papers and the user manual.
const WelcomeFooter = ({onPapersClick}: WelcomeFooterProps) => {
	const [showModal, setShowModal] = useState(false);

	const handleWebView = () => {
		setShowModal(false);
		window.open("/mm-local-editor/user-manual-web", "_blank");
	};

	const handlePdfView = () => {
		setShowModal(false);
		window.open("/mm-local-editor/papers/AMMBER_User_Manual.pdf", "_blank");
	};

	return (
		<>
			<div className="text-center mt-auto">
				<p>
					<span
						onClick={onPapersClick}
						className="text-decoration-none"
						style={{cursor: "pointer", color: "#0d6efd"}}
					>
						Papers
					</span>
					&nbsp;|&nbsp;
					<span
						onClick={() => setShowModal(true)}
						style={{cursor: "pointer", color: "#0d6efd", textDecoration: "underline"}}
					>
						User Manual
					</span>
				</p>
			</div>

			<Modal show={showModal} onHide={() => setShowModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>View User Manual</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>Please choose how you would like to view the user manual:</p>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-secondary" onClick={handlePdfView}>
						 PDF View
					</Button>
					<Button variant="primary" onClick={handleWebView}>
						 Web View
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default WelcomeFooter;
