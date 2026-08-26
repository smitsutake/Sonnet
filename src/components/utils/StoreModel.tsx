// src/utils/StoreModel.tsx
// src/utils/StoreModel.tsx
import { get, set, del, keys } from 'idb-keyval';

const STORAGE_KEY = 'submitted-models';

export interface FeedbackItemData {
    id: string;
    content: string;
    author: string;
    createdAt: string;
    targets: string[];
}

export interface SubmittedModel {
    id: string;
    name: string;
    description: string;
    author: string;
    submittedAt: string;
    status: 'sent' | 'viewing' | 'reviewed';
    feedback?: string;
    feedbackItems?: FeedbackItemData[];
    grade?: {
        score: number;
        outOf: number;
    };
    modelData: any;
}

// Save submitted model
export const saveSubmittedModel = async (model: SubmittedModel): Promise<void> => {
    try {
        const existing = await get(STORAGE_KEY) || [];
        const updated = [...existing, model];
        await set(STORAGE_KEY, updated);
        console.log('✅ Model saved:', model.name);
    } catch (error) {
        console.error('❌ Failed to save model:', error);
    }
};

export const updateModelWithFeedbackItems = async (
    modelId: string,
    feedbackItems: FeedbackItemData[]
): Promise<void> => {
    try {
        const models = await get(STORAGE_KEY) || [];
        const updated = models.map((m: SubmittedModel) => {
            if (m.id === modelId) {
                const hasFeedback = feedbackItems.some(item => item.content.trim() !== '');
                return {
                    ...m,
                    status: hasFeedback ? 'reviewed' as const : m.status,
                    feedbackItems: feedbackItems,
                };
            }
            return m;
        });
        await set(STORAGE_KEY, updated);
        console.log('✅ Model feedback updated:', modelId);
    } catch (error) {
        console.error('❌ Failed to update model feedback:', error);
    }
};

// Get all submitted models
export const getSubmittedModels = async (): Promise<SubmittedModel[]> => {
    try {
        const models = await get(STORAGE_KEY) || [];
        console.log('✅ Loaded models:', models.length);
        return models;
    } catch (error) {
        console.error('❌ Failed to load models:', error);
        return [];
    }
};

// Update model status
export const updateModelStatus = async (modelId: string, status: SubmittedModel['status'], feedback?: string): Promise<void> => {
    try {
        const models = await get(STORAGE_KEY) || [];
        const updated = models.map((m: SubmittedModel) => {
            if (m.id === modelId) {
                return { ...m, status, feedback };
            }
            return m;
        });
        await set(STORAGE_KEY, updated);
        console.log('✅ Model status updated:', modelId, status);
    } catch (error) {
        console.error('❌ Failed to update model status:', error);
    }
};

// Update model status to "viewing"
export const updateModelStatusToViewing = async (modelId: string): Promise<void> => {
    try {
        const models = await get(STORAGE_KEY) || [];
        const updated = models.map((m: SubmittedModel) => {
            if (m.id === modelId) {
                return { ...m, status: 'viewing' as const };
            }
            return m;
        });
        await set(STORAGE_KEY, updated);
        console.log('👀 Model status updated to viewing:', modelId);
    } catch (error) {
        console.error('❌ Failed to update model status:', error);
    }
};

// Update model to "reviewed" and save feedback
export const updateModelWithFeedback = async (
    modelId: string,
    feedback: string,
    grade?: { score: number; outOf: number }
): Promise<void> => {
    try {
        const models = await get(STORAGE_KEY) || [];
        const updated = models.map((m: SubmittedModel) => {
            if (m.id === modelId) {
                return {
                    ...m,
                    status: 'reviewed' as const,
                    feedback: feedback,
                    grade: grade,
                };
            }
            return m;
        });
        await set(STORAGE_KEY, updated);
        console.log('✅ Model reviewed and returned:', modelId);
    } catch (error) {
        console.error('❌ Failed to update model feedback:', error);
    }
};

// Delete model
export const deleteSubmittedModel = async (modelId: string): Promise<void> => {
    try {
        const models = await get(STORAGE_KEY) || [];
        const updated = models.filter((m: SubmittedModel) => m.id !== modelId);
        await set(STORAGE_KEY, updated);
        console.log('🗑️ Model deleted:', modelId);
    } catch (error) {
        console.error('❌ Failed to delete model:', error);
    }
};

// Clear all models
export const clearAllModels = async (): Promise<void> => {
    try {
        await del(STORAGE_KEY);
        console.log('🧹 All models cleared');
    } catch (error) {
        console.error('❌ Failed to clear models:', error);
    }
};