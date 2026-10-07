import React, {useState} from "react";

import ProjectEditHeader from "./header/ProjectEditHeader";
import "./ProjectEdit.css";
import SectionPanel from "./SectionPanel";
import ProgressBar from "./ProgressBar";
import {GraphProvider} from "./context/GraphContext";
import VersionHistoryProvider from "./model-version-control/VersionHistoryProvider";

const ProjectEdit: React.FC = () => {
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
          </VersionHistoryProvider>
        </GraphProvider>
    );
};

export default ProjectEdit;
