import React, {useState,useEffect} from "react";

import ProjectEditHeader from "./header/ProjectEditHeader";
import "./ProjectEdit.css";
import SectionPanel from "./SectionPanel";
import GradeViewModal from "./feedback/GradeViewModal";
import {useFeedbackContext} from "./feedback/feedbackContext";
import ProgressBar from "./ProgressBar";
import {GraphProvider} from "./context/GraphContext";

// new add
import SendModel from "./SendModel";
import { useFileContext } from "./context/FileProvider";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { saveSubmittedModel, updateModelWithFeedback } from "./utils/StoreModel";


const ProjectEdit: React.FC = () => {
    const {grade, isGradeVisible, setGradeVisible} = useFeedbackContext();
    const [showGoalSection, setShowGoalSection] = useState(true);
    const [showGraphSection, setShowGraphSection] = useState(false);


    // new add
    const [showSendModal, setShowSendModal] = useState(false);
    const {  treeData, tabData, dispatch, tree, goals, tabs } = useFileContext();
    const navigate = useNavigate();
    const {  reviewerName} = useFeedbackContext();


    // chechk if is in teachermode
    const isTeacher = reviewerName !== null;

    useEffect(() => {
        console.log(' ProjectEdit loading:');
        console.log('  treeData:', treeData);
        console.log('  tabData:', tabData);
        console.log('  tree:', tree);
        console.log('  goals:', goals);
        console.log('  tabs:', tabs);
        console.log('  treeData length:', treeData?.length || 0);
        console.log('  tree length:', tree?.length || 0);
    }, [treeData, tabData, tree, goals, tabs]);

    // student submitted model
    const handleSendModel = async (modelName: string, description: string, author: string) => {
        try {
            const tabDataForSave = Array.from(tabs.values()).map((tab) => ({
                label: tab.label,
                icon: tab.icon,
                rows: tab.goalIds
                    .map((goalId) => goals[goalId])
                    .filter(Boolean),
            }));

            const modelData = {
                treeData: tree,
                tabData: tabDataForSave,
            };

            console.log('Saving model data:', modelData);

            await saveSubmittedModel({
                id: `model-${Date.now()}`,
                name: modelName,
                description: description || 'No description',
                author: author,
                submittedAt: new Date().toISOString(),
                status: 'sent',
                modelData: modelData,
            });

            setShowSendModal(false);
            alert('Model submitted successfully!');
            navigate('/viewModel');

        } catch (error) {
            console.error('Failed to submit model:', error);
            alert('Submission failed, please try again');
        }
    };

    // teacher  Send Back model
    const handleSendBack = async () => {
        if (!isTeacher) {
            alert('Only teachers can perform this action');
            return;
        }

        try {
            const modelId = sessionStorage.getItem('editingModelId');

            if (!modelId) {
                alert('Cannot find the current model. Please open it from View Model page');
                return;
            }

            const feedbackText = grade?.overallFeedback || '';
            const score = grade?.totalScore || 0;
            const outOf = grade?.totalOutOf || 0;

            await updateModelWithFeedback(
                modelId,
                feedbackText,
                { score, outOf }
            );

            sessionStorage.removeItem('editingModelId');

            alert('Model reviewed and sent back successfully!');
            navigate('/viewModel');

        } catch (error) {
            console.error('Send back failed:', error);
            alert(' Send back failed, please try again');
        }
    };


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
            {/* Sits over the editor with the usual dimmed backdrop. Opens by
                itself when a graded model is loaded. */}
            <GradeViewModal show={isGradeVisible}
                            grade={grade}
                            onClose={() => setGradeVisible(false)}/>
            {/* new add:buttom area */}
            <div className="d-flex justify-content-between align-items-center p-2"
                 style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                <div>
                    {!isTeacher && (
                        /* Student: Send Model button */
                        <Button
                            variant="success"
                            onClick={() => setShowSendModal(true)}
                        >
                            📤 Send Model
                        </Button>
                    )}

                    {/* Teacher: Send Back button */}
                    {isTeacher && (
                        <Button
                            variant="warning"
                            className="ms-2"
                            onClick={handleSendBack}
                        >
                            📤 Send Back
                        </Button>
                    )}
                </div>
                {isTeacher && (
                    <span className="text-muted small">
                        👨‍🏫 reviewing: {reviewerName}
                    </span>
                )}
            </div>
            <SendModel
                show={showSendModal}
                onHide={() => setShowSendModal(false)}
                onConfirm={handleSendModel}
            />
        </GraphProvider>
    );
};

export default ProjectEdit;
