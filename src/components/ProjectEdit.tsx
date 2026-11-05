import React, {useState} from "react";

import ProjectEditHeader from "./header/ProjectEditHeader";
import "./ProjectEdit.css";
import SectionPanel from "./SectionPanel";
import ProgressBar from "./ProgressBar";
import {GraphProvider} from "./context/GraphContext";
import {useAutoTour} from "./tour/useAutoTour.ts";

const ProjectEdit: React.FC = () => {
    const [showGoalSection, setShowGoalSection] = useState(true);
    const [showGraphSection, setShowGraphSection] = useState(false);

    // opens the guide once the editor is on screen, Guide button replays it
    useAutoTour();

    return (
        <GraphProvider>
            <ProjectEditHeader showGoalSection={showGoalSection}
                               setShowGoalSection={setShowGoalSection}
                               showGraphSection={showGraphSection}/>
            <ProgressBar showGoalSection={showGoalSection}
                         setShowGoalSection={setShowGoalSection}
                         setShowGraphSection={setShowGraphSection}/>
            <SectionPanel showGoalSection={showGoalSection}
                          showGraphSection={showGraphSection}
                          setShowGoalSection={setShowGoalSection}
                          paddingX={15}/>
        </GraphProvider>
    );
};

export default ProjectEdit;
