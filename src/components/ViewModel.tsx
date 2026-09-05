// src/components/ViewModel.tsx
// src/components/ViewModel.tsx
// src/components/ViewModel.tsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import {
    getSubmittedModels,
    SubmittedModel,
    deleteSubmittedModel,
    updateModelStatusToViewing
} from './utils/StoreModel';
import { useNavigate } from 'react-router-dom';
import { useFileContext } from './context/FileProvider';
import { reset } from './context/treeDataSlice';
import { initialTabs } from '../data/initialTabs';
import HomeButton from './header/HomeButton';
import { useFeedbackContext } from './feedback/feedbackContext';
import { FeedbackItem, FEEDBACK_STATUS, FeedbackData } from './feedback/feedbackTypes';

const ViewModel = () => {
    const [models, setModels] = useState<SubmittedModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [selectedModel, setSelectedModel] = useState<SubmittedModel | null>(null);
    const navigate = useNavigate();
    const { dispatch } = useFileContext();
    const { reviewerName, loadItems, setGrade, setGradeVisible } = useFeedbackContext(); // 👈 添加 loadItems, setGrade, setGradeVisible

    const isTeacher = reviewerName !== null;

    const loadModels = async () => {
        try {
            setLoading(true);
            setError(null);
            const loaded = await getSubmittedModels();
            console.log('loading model:', loaded);
            setModels(loaded);
        } catch (err) {
            setError('fail load');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadModels();
    }, []);

    const handleDelete = async (modelId: string) => {
        if (window.confirm('ensure to delete?')) {
            await deleteSubmittedModel(modelId);
            await loadModels();
        }
    };

    // change feedback data into FeedbackData
    const convertToFeedbackData = (model: SubmittedModel): FeedbackData | null => {
        // use feedbackItems if include
        if (model.feedbackItems && model.feedbackItems.length > 0) {
            const feedbackItems: FeedbackItem[] = model.feedbackItems.map(item => ({
                id: item.id,
                content: item.content,
                author: item.author || model.author || 'Teacher',
                createdAt: item.createdAt || model.submittedAt,
                targets: item.targets || [],
            }));

            // if set grade,add it to feedback data
            const hasGrade = model.grade && model.grade.score > 0;

            return {
                status: FEEDBACK_STATUS.FEEDBACKED,
                items: feedbackItems,
                grade: hasGrade ? {
                    totalScore: model.grade!.score || 0,
                    totalOutOf: model.grade!.outOf || 0,
                    criteria: [],
                    overallFeedback: feedbackItems.map(f => f.content).join('\n'),
                    gradedBy: model.author || 'Teacher',
                    gradedAt: model.submittedAt,
                } : undefined,
                updatedAt: model.submittedAt,
            };
        }

        // 2. Compatible with older formats: Only a single feedback string.
        if (model.status === 'reviewed' && model.feedback) {
            const feedbackItems: FeedbackItem[] = [{
                id: `fb-${Date.now()}`,
                content: model.feedback,
                author: model.author || 'Teacher',
                createdAt: model.submittedAt,
                targets: [],
            }];

            return {
                status: FEEDBACK_STATUS.FEEDBACKED,
                items: feedbackItems,
                grade: model.grade ? {
                    totalScore: model.grade.score || 0,
                    totalOutOf: model.grade.outOf || 0,
                    criteria: [],
                    overallFeedback: model.feedback || '',
                    gradedBy: model.author || 'Teacher',
                    gradedAt: model.submittedAt,
                } : undefined,
                updatedAt: model.submittedAt,
            };
        }

        return null;
    };


    // View the model
    const handleViewModel = async (model: SubmittedModel) => {
        try {
            if (!dispatch) {
                console.error('❌ dispatch undefined');
                alert('system error：cannot load');
                return;
            }

            //If the current mode is teacher mode and the model status is "Submitted", update to "Grading".
            if (isTeacher && model.status === 'sent') {
                await updateModelStatusToViewing(model.id);
                await loadModels();
                console.log('👀 model status update: viewing');
            }

            sessionStorage.setItem('editingModelId', model.id);

            let { treeData, tabData } = model.modelData;

            if (!treeData) {
                treeData = [];
            }

            if (!tabData || tabData.length === 0) {
                tabData = initialTabs.map(tab => ({
                    label: tab.label,
                    icon: tab.icon,
                    goalIds: tab.rows.map(row => row.id),
                }));
            }

            // Load model data into the editor
            dispatch(reset({
                treeData: treeData,
                tabData: tabData,
            }));

            //  Loading feedback data into FeedbackContext
            const feedbackData = convertToFeedbackData(model);
            if (feedbackData) {
                loadItems(feedbackData);
                //If a grade exists, set the grade and display it.
                if (feedbackData.grade) {
                    setGrade(feedbackData.grade);
                    setGradeVisible(true);
                }
                console.log('✅ feedback has load:', feedbackData);
            } else {
                // clean if no feedback
                loadItems(null);
                setGrade(null);
            }

            navigate('/projectEdit');
        } catch (error) {
            console.error('❌ error load model:', error);
            alert('❌ error load model,retry!');
        }
    };

    // detaoled feedback
    const handleViewFeedback = (model: SubmittedModel) => {
        setSelectedModel(model);
        setShowGradeModal(true);
    };

    const getStatusInfo = (status: SubmittedModel['status']) => {
        const map = {
            sent: { variant: 'primary', label: '📤 sended,processing review' },
            viewing: { variant: 'warning', label: '👀 reviewing' },
            reviewed: { variant: 'success', label: '✅ reviewed' },
        };
        return map[status] || map.sent;
    };

    const getPercentage = (grade: { score: number; outOf: number } | undefined) => {
        if (!grade || grade.outOf <= 0) return null;
        return Math.round((grade.score / grade.outOf) * 1000) / 10;
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-3">加载模型中...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    <Alert.Heading>error loading</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={loadModels}>
                        reloading
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <div className="d-flex p-3 flex-column" id="bg" style={{ minHeight: '100vh' }}>
            <Container>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>📋 submittied model</h2>
                    <div>
                        <HomeButton />
                        <Button variant="outline-secondary" size="sm" onClick={loadModels} className="me-2">
                            🔄 refresh
                        </Button>
                        <Badge bg="info" className="p-2">
                             {models.length} models
                        </Badge>
                        {isTeacher && (
                            <Badge bg="warning" className="ms-2 p-2">
                                👨‍🏫 {reviewerName}
                            </Badge>
                        )}
                    </div>
                </div>

                {models.length === 0 ? (
                    <Card className="text-center p-5">
                        <Card.Body>
                            <h4>📭 no submitted model</h4>
                            <p className="text-muted">After creating the model in the editor, click the "Send Model" button to submit.</p>
                            <Button variant="primary" onClick={() => navigate('/projectEdit')}>
                                create model
                            </Button>
                        </Card.Body>
                    </Card>
                ) : (
                    <Row>
                        {models.map((model) => {
                            const statusInfo = getStatusInfo(model.status);
                            const isReviewed = model.status === 'reviewed';
                            const hasFeedback = model.feedback && model.feedback.trim() !== '';
                            const percentage = getPercentage(model.grade);

                            return (
                                <Col md={6} lg={4} key={model.id} className="mb-4">
                                    <Card className="h-100 shadow-sm">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-start">
                                                <Card.Title className="h5">{model.name}</Card.Title>
                                                <Badge bg={statusInfo.variant}>
                                                    {statusInfo.label}
                                                </Badge>
                                            </div>
                                            <Card.Text className="text-muted small">
                                                <div>👤 author: {model.author}</div>
                                                <div>📅 submitted time: {new Date(model.submittedAt).toLocaleString()}</div>
                                            </Card.Text>
                                            {model.description && (
                                                <Card.Text className="mt-2">
                                                    <strong>decription:</strong>
                                                    <p className="mb-0 text-muted">{model.description}</p>
                                                </Card.Text>
                                            )}

                                            {isReviewed && (
                                                <div className="mt-2">
                                                    {hasFeedback ? (
                                                        <>
                                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                                <Badge bg="success">✅ reviewed</Badge>
                                                                {model.grade && (
                                                                    <span className="text-muted small">
                                                                        grade: {model.grade.score} / {model.grade.outOf}
                                                                        {percentage !== null && ` (${percentage}%)`}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => handleViewFeedback(model)}
                                                            >
                                                                📋 View full feedback
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <div className="text-success">
                                                            <small>✅ reviewed(no feedback）</small>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {model.status === 'sent' && (
                                                <div className="mt-2 text-primary">
                                                    <small>⏳ waiting for review...</small>
                                                </div>
                                            )}

                                            {model.status === 'viewing' && (
                                                <div className="mt-2 text-warning">
                                                    <small>👀 viewng...</small>
                                                </div>
                                            )}
                                        </Card.Body>
                                        <Card.Footer className="bg-transparent d-flex gap-2 flex-wrap">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleViewModel(model)}
                                            >
                                                👁️ open model
                                            </Button>

                                            {isTeacher && (
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(model.id)}
                                                >
                                                    🗑️ 删除
                                                </Button>
                                            )}
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </Container>

            {/* Feedback details pop-up window */}
            <Modal show={showGradeModal} onHide={() => setShowGradeModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>📋 detailed review</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedModel && (
                        <>
                            <div className="d-flex align-items-baseline gap-3 mb-4">
                                <span style={{ fontSize: '2.5rem', fontWeight: 600, color: '#1c5a92' }}>
                                    {selectedModel.grade?.score || 0}
                                    {selectedModel.grade && selectedModel.grade.outOf > 0 && (
                                        <span className="text-muted" style={{ fontSize: '1.5rem' }}>
                                            {" / "}{selectedModel.grade.outOf}
                                        </span>
                                    )}
                                </span>co
                                {selectedModel.grade && selectedModel.grade.outOf > 0 && (
                                    <span className="text-muted">
                                        {Math.round((selectedModel.grade.score / selectedModel.grade.outOf) * 1000) / 10}%
                                    </span>
                                )}
                            </div>

                            <h6 className="fw-semibold">model information</h6>
                            <div className="mb-3 text-muted small">
                                <div>📝 model name: {selectedModel.name}</div>
                                <div>👤 author: {selectedModel.author}</div>
                                <div>📅 review time: {new Date(selectedModel.submittedAt).toLocaleString()}</div>
                            </div>

                            {selectedModel.feedback && (
                                <>
                                    <h6 className="fw-semibold">📋 teacher feedback</h6>
                                    <p style={{ whiteSpace: 'pre-wrap' }} className="p-3 bg-light rounded">
                                        {selectedModel.feedback}
                                    </p>
                                </>
                            )}

                            <p className="text-muted small mt-3">
                                ✅ reviewed
                            </p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowGradeModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ViewModel;