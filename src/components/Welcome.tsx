import React, {useState} from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import WelcomeHeader from "./WelcomeHeader";
import WelcomeFooter from "./WelcomeFooter";
import WelcomeButtons from "./WelcomeButtons";
import {DetailCarousel} from "./DetailCarousel";
import PaperReferenceList from "./PaperReferenceList";
import {papers} from "../data/papers";
import StaffModeButton from "./feedback/StaffModeButton";

const Welcome = () => {
	const [isDragging, setIsDragging] = useState(false);
	const [showPapers, setShowPapers] = useState(false);

	// Handle dragging files to upload
	const handleDragOver = (evt: React.DragEvent<HTMLDivElement>) => {
		evt.preventDefault();
		setIsDragging(true);
	};

	return (
		<div
			className="d-flex p-3 flex-column text-center"
			onDragOver={handleDragOver}
			id="bg"
			style={{minHeight: "inherit"}}
		>
			{/* Top-right, clear of the main actions: it switches mode rather
			    than doing anything to a model. */}
			<div className="position-absolute top-0 end-0 p-3" style={{zIndex: 10}}>
				<StaffModeButton />
			</div>
			<WelcomeHeader />
			<div>
				<DetailCarousel/>
				<WelcomeButtons isDragging={isDragging} setIsDragging={setIsDragging}/>
			</div>
			<WelcomeFooter onPapersClick={() => setShowPapers(true)}/>

			{/* Papers Modal */}
			<Modal
				show={showPapers}
				onHide={() => setShowPapers(false)}
				size="lg"
				centered
				scrollable
			>
				<Modal.Header closeButton>
					<Modal.Title>Research Report Series</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<PaperReferenceList references={papers}/>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowPapers(false)}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default Welcome;