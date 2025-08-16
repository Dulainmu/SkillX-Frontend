// src/services/assessmentApi.ts
import { authenticatedFetch, getApiUrl, getAuthToken } from '@/config/api';

export interface SubmitQuizPayload {
    answers: Record<number, number>; // 1..32 (Likert 1..5)
    skills?: Record<string, { selected: boolean; level: number }>;
    preferences?: { learningStyle: string[]; timeCommitment: string; budget: string };
}

export const assessmentApi = {
    async submitQuiz(payload: SubmitQuizPayload) {
        try {
            console.log('Submitting quiz payload:', {
                answerCount: Object.keys(payload.answers || {}).length,
                hasSkills: !!payload.skills,
                hasPreferences: !!payload.preferences
            });
            
            const result = await authenticatedFetch('/api/careers/submit-quiz', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            
            console.log('Quiz submission successful:', {
                topMatchesCount: result.topMatches?.length || 0,
                hasProfile: !!result.profile,
                hasPaths: !!result.paths
            });
            
            return result;
        } catch (error) {
            console.error('Quiz submission failed:', error);
            throw error;
        }
    },

    async getProgress() {
        try {
            const token = getAuthToken();
            if (!token) {
                console.log('No auth token found, skipping progress fetch');
                return null;
            }
            
            const res = await fetch(getApiUrl('/api/assessment-progress/me'), {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            
            if (!res.ok) {
                if (res.status === 404) {
                    console.log('No existing progress found');
                    return null;
                }
                throw new Error(`Failed to load assessment progress: ${res.status} ${res.statusText}`);
            }
            
            const data = await res.json();
            console.log('Progress loaded successfully:', {
                currentStep: data.currentStep,
                dataKeys: Object.keys(data.data || {}),
                answerKeys: Object.keys(data.answers || {})
            });
            
            return data as { currentStep: number; data: any; answers: Record<number, number> };
        } catch (error) {
            console.error('Failed to load assessment progress:', error);
            throw error;
        }
    },

    async saveProgress(body: { currentStep: number; data: any; answers: Record<number, number> }) {
        try {
            const token = getAuthToken();
            if (!token) {
                console.log('No auth token found, skipping progress save');
                return null;
            }
            
            console.log('Saving assessment progress:', {
                currentStep: body.currentStep,
                dataKeys: Object.keys(body.data || {}),
                answerKeys: Object.keys(body.answers || {})
            });
            
            const result = await authenticatedFetch('/api/assessment-progress/me', {
                method: 'POST',
                body: JSON.stringify(body),
            });
            
            console.log('Progress saved successfully:', result);
            return result;
        } catch (error) {
            console.error('Failed to save assessment progress:', error);
            throw error;
        }
    },

    async clearProgress() {
        try {
            const token = getAuthToken();
            if (!token) {
                console.log('No auth token found, skipping progress clear');
                return null;
            }
            
            console.log('Clearing assessment progress');
            
            const res = await fetch(getApiUrl('/api/assessment-progress/me'), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            
            if (!res.ok) {
                throw new Error(`Failed to clear assessment progress: ${res.status} ${res.statusText}`);
            }
            
            const result = await res.json();
            console.log('Progress cleared successfully:', result);
            return result;
        } catch (error) {
            console.error('Failed to clear assessment progress:', error);
            throw error;
        }
    },
};
