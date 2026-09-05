// src/components/SendModelModal.tsx

import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

export interface SendModelModalProps {
    show: boolean;
    onHide: () => void;
    onConfirm: (modelName: string, description: string, author: string) => void;
}

const SendModelModal: React.FC<SendModelModalProps> = ({ show, onHide, onConfirm }) => {
    const [modelName, setModelName] = useState('');
    const [description, setDescription] = useState('');
    const [author, setAuthor] = useState('');
    const [errors, setErrors] = useState<{ name?: string; author?: string }>({});

    const handleConfirm = () => {
        const newErrors: { name?: string; author?: string } = {};
        if (!modelName.trim()) {
            newErrors.name = 'Please enter a model name';
        }
        if (!author.trim()) {
            newErrors.author = 'Please enter your name';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onConfirm(modelName.trim(), description.trim(), author.trim());
        setModelName('');
        setDescription('');
        setAuthor('');
        setErrors({});
    };

    const handleClose = () => {
        setModelName('');
        setDescription('');
        setAuthor('');
        setErrors({});
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>📤 Submit Model</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert variant="info">
                    After submission, the model will appear on the "View Model" page for review and grading.
                </Alert>

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Model Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            value={modelName}
                            onChange={(e) => {
                                setModelName(e.target.value);
                                if (errors.name) setErrors({ ...errors, name: undefined });
                            }}
                            placeholder="Enter a model name"
                            isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Your Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            value={author}
                            onChange={(e) => {
                                setAuthor(e.target.value);
                                if (errors.author) setErrors({ ...errors, author: undefined });
                            }}
                            placeholder="Enter your name"
                            isInvalid={!!errors.author}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.author}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Model Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your model's content and features..."
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                    Confirm Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SendModelModal;