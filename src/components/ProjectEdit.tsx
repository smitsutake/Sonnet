import React, {useState} from "react";

import ProjectEditHeader from "./header/ProjectEditHeader";
import "./ProjectEdit.css";
import SectionPanel from "./SectionPanel";
import GradeViewModal from "./feedback/GradeViewModal";
import {useFeedbackContext} from "./feedback/feedbackContext";
import ProgressBar from "./ProgressBar";
import {GraphProvider} from "./context/GraphContext";
import VersionHistoryProvider from "./model-version-control/VersionHistoryProvider";

const ProjectEdit: React.FC = () => {
    const {grade, isGradeVisible, setGradeVisible} = useFeedbackContext();
    const [showGoalSection, setShowGoalSection] = useState(true);
    const [showGraphSection, setShowGraphSection] = useState(false);

    return (
        <GraphProvider>
          <VersionHistoryProvider>
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
            {/* Sits over the editor with the usual dimmed backdrop. Opens by
                itself when a graded model is loaded. */}
            <GradeViewModal show={isGradeVisible}
                            grade={grade}
                            onClose={() => setGradeVisible(false)}/>
          </VersionHistoryProvider>
        </GraphProvider>
    );
};

export default ProjectEdit;
