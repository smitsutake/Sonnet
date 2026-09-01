import {Link} from "react-router-dom";
//new add
import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
//
type WelcomeFooterProps = {
	name: string;
	destination: string;
};

// Footer section in welcome page including copyrights, papers, user manual...
const WelcomeFooter = ({name, destination}: WelcomeFooterProps) => {
	// new add
	const [showModal, setShowModal] = useState(false);

	const handleWebView = () => {
		setShowModal(false);
		window.open("/mm-local-editor/user-manual-web", "_blank");
	};

	const handlePdfView = () => {
		setShowModal(false);
		window.open("/mm-local-editor/AMMBER_User_Manual.pdf", "_blank");
	};

	//
	return (
		<>
			<div className="text-center mt-auto">
				<p>
					<Link to={`/${destination}`} className="text-decoration-none">
						{name}
					</Link>
					&nbsp;|&nbsp;
					{/* new add: change Link to span  */}
					<span
						onClick={() => setShowModal(true)}
						style={{cursor: "pointer", color: "#0d6efd", textDecoration: "underline"}}
					>
					User Manual
				</span>
				</p>
			</div>

			{/* new add: Added pop-up modal  */}
			<Modal show={showModal} onHide={() => setShowModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>View User Manual</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>Please choose how you would like to view the user manual:</p>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-secondary" onClick={handlePdfView}>
						📄 PDF View
					</Button>
					<Button variant="primary" onClick={handleWebView}>
						🌐 Web View
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};


export default WelcomeFooter;
