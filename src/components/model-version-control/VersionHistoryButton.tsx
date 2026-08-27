import React, {useState} from "react";
import Button from "react-bootstrap/Button";

import VersionHistoryModal from "./VersionHistoryModal.tsx";

// Header entry point for the Version History feature. Must be rendered inside a
// VersionHistoryProvider.
const VersionHistoryButton: React.FC = () => {
	const [show, setShow] = useState(false);

	return (
		<>
			<Button variant="outline-primary" onClick={() => setShow(true)}>
				Version History
			</Button>
			<VersionHistoryModal show={show} onHide={() => setShow(false)} />
		</>
	);
};

export default VersionHistoryButton;
