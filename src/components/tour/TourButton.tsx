import React from "react";
import Button from "react-bootstrap/Button";
import {useTour} from "./useTour.ts";
import {tourForPage} from "./tourSteps.ts";

// Starts the guided tour.
//
// Placed in the editor header rather than fired automatically on first load:
// an unrequested overlay in front of someone who already knows the tool is an
// irritation, and the paper is explicit that the people using AMMBER most are
// the ones who know it best.

type TourButtonProps = {
	className?: string;
	// true on the render model page - skip the goal list steps there
	showGraphSection?: boolean;
};

const TourButton: React.FC<TourButtonProps> = ({className, showGraphSection}) => {
	const {startTour} = useTour();

	return (
		<Button
			variant="outline-primary"
			className={className}
			onClick={() => startTour(tourForPage(!!showGraphSection))}
			title="Walk through how to build a motivational model"
		>
			Guide
		</Button>
	);
};

export default TourButton;
