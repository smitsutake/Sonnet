import React from "react";
import Button from "react-bootstrap/Button";
import {useTour} from "./useTour.ts";
import {TOUR_STEPS} from "./tourSteps.ts";

// Starts the guided tour.
//
// Placed in the editor header rather than fired automatically on first load:
// an unrequested overlay in front of someone who already knows the tool is an
// irritation, and the paper is explicit that the people using AMMBER most are
// the ones who know it best.

type TourButtonProps = {
	className?: string;
};

const TourButton: React.FC<TourButtonProps> = ({className}) => {
	const {startTour} = useTour();

	return (
		<Button
			variant="outline-primary"
			className={className}
			onClick={() => startTour(TOUR_STEPS)}
			title="Walk through how to build a motivational model"
		>
			Guide
		</Button>
	);
};

export default TourButton;
