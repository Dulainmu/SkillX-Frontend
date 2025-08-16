// src/api/adminApi.ts

import { getApiUrl, authenticatedFetch } from '@/config/api';

// Career Roles (Updated for unified system)
export const getAllCareerPaths = () => authenticatedFetch('/api/careers');
export const createCareerPath = (data: unknown) => authenticatedFetch('/api/careers', { method: 'POST', body: JSON.stringify(data) });
export const updateCareerPath = (id: string, data: unknown) => {
  if (!id) return Promise.reject(new Error('Career ID is required for update.'));
  // Check if id is a slug (contains hyphens) or ObjectId
  if (id.includes('-')) {
    // Update by slug
    return authenticatedFetch(`/api/careers/slug/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  } else {
    // Update by ObjectId
    return authenticatedFetch(`/api/careers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
};
export const deleteCareerPath = (id: string) => {
  if (!id) return Promise.reject(new Error('Career ID is required for delete.'));
  return authenticatedFetch(`/api/careers/${id}`, { method: 'DELETE' });
};

// Get career by slug (for learning journey management)
export const getCareerBySlug = (slug: string) => authenticatedFetch(`/api/careers/slug/${slug}`);

// Skills
export const getAllSkills = () => authenticatedFetch('/api/skills');
export const createSkill = (data: unknown) => authenticatedFetch('/api/skills', { method: 'POST', body: JSON.stringify(data) });
export const updateSkill = (id: string, data: unknown) => {
  if (!id) return Promise.reject(new Error('Skill ID is required for update.'));
  return authenticatedFetch(`/api/skills/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};
export const deleteSkill = (id: string) => {
  if (!id) return Promise.reject(new Error('Skill ID is required for delete.'));
  return authenticatedFetch(`/api/skills/${id}`, { method: 'DELETE' });
};

// Learning Materials
export const getAllMaterials = () => authenticatedFetch('/api/learning-materials');
export const createMaterial = (data: unknown) => authenticatedFetch('/api/learning-materials', { method: 'POST', body: JSON.stringify(data) });
export const updateMaterial = (id: string, data: unknown) => authenticatedFetch(`/api/learning-materials/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMaterial = (id: string) => authenticatedFetch(`/api/learning-materials/${id}`, { method: 'DELETE' });

// Quizzes
export const getAllQuizzes = () => authenticatedFetch('/api/quiz');
export const createQuiz = (data: unknown) => authenticatedFetch('/api/quiz', { method: 'POST', body: JSON.stringify(data) });
export const updateQuiz = (id: string, data: unknown) => {
  if (!id) return Promise.reject(new Error('Quiz ID is required for update.'));
  return authenticatedFetch(`/api/quiz/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};
export const deleteQuiz = (id: string) => {
  if (!id) return Promise.reject(new Error('Quiz ID is required for delete.'));
  return authenticatedFetch(`/api/quiz/${id}`, { method: 'DELETE' });
};

// Projects (assuming /api/projects exists, otherwise adjust to /api/submissions)
export const getAllProjects = () => authenticatedFetch('/api/projects');
export const createProject = (data: unknown) => authenticatedFetch('/api/projects', { method: 'POST', body: JSON.stringify(data) });
export const updateProject = (id: string, data: unknown) => {
  if (!id) return Promise.reject(new Error('Project ID is required for update.'));
  return authenticatedFetch(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};
export const deleteProject = (id: string) => {
  if (!id) return Promise.reject(new Error('Project ID is required for delete.'));
  return authenticatedFetch(`/api/projects/${id}`, { method: 'DELETE' });
};

// Users
export const getAllUsers = () => authenticatedFetch('/api/users');
export const updateUser = (id: string, data: unknown) => {
  if (!id) return Promise.reject(new Error('User ID is required for update.'));
  return authenticatedFetch(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};
export const deleteUser = (id: string) => {
  if (!id) return Promise.reject(new Error('User ID is required for delete.'));
  return authenticatedFetch(`/api/users/${id}`, { method: 'DELETE' });
};

// Learning Journey Management (Updated for CareerRole structure)
export const getAllLearningJourneys = () => authenticatedFetch('/api/admin/learning-journeys');
export const getLearningJourney = (careerId: string) => authenticatedFetch(`/api/admin/learning-journeys/${careerId}`);
export const updateLearningJourney = (careerId: string, data: unknown) => authenticatedFetch(`/api/admin/learning-journeys/${careerId}`, { method: 'PUT', body: JSON.stringify(data) });

// Step Management (Updated for CareerRole structure)
export const addStep = (careerId: string, step: unknown) => authenticatedFetch(`/api/admin/learning-journeys/${careerId}/steps`, { method: 'POST', body: JSON.stringify({ step }) });
export const updateStep = (careerId: string, stepId: string, step: unknown) => authenticatedFetch(`/api/admin/learning-journeys/${careerId}/steps/${stepId}`, { method: 'PUT', body: JSON.stringify({ step }) });
export const deleteStep = (careerId: string, stepId: string) => authenticatedFetch(`/api/admin/learning-journeys/${careerId}/steps/${stepId}`, { method: 'DELETE' });

// Learning Journey User Progress Management
export const getLearningJourneyUserProgress = (careerId: string, userId: string) => authenticatedFetch(`/api/admin/learning-journeys/${careerId}/users/${userId}/progress`);
export const resetLearningJourneyUserProgress = (careerId: string, userId: string) => authenticatedFetch(`/api/admin/learning-journeys/${careerId}/users/${userId}/progress`, { method: 'DELETE' });

// Project Submissions Management
export const getAllSubmissions = (params?: Record<string, string>) => {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
  return authenticatedFetch(`/api/admin/project-submissions${queryString}`);
};
export const getSubmission = (id: string) => authenticatedFetch(`/api/admin/project-submissions/${id}`);
export const reviewSubmission = (id: string, data: unknown) => authenticatedFetch(`/api/admin/project-submissions/${id}/review`, { method: 'PUT', body: JSON.stringify(data) });
export const bulkReviewSubmissions = (data: unknown) => authenticatedFetch('/api/admin/project-submissions/bulk-review', { method: 'POST', body: JSON.stringify(data) });
export const assignMentor = (id: string, mentorId: string) => authenticatedFetch(`/api/admin/project-submissions/${id}/assign-mentor`, { method: 'PUT', body: JSON.stringify({ mentorId }) });
export const deleteSubmission = (id: string) => authenticatedFetch(`/api/admin/project-submissions/${id}`, { method: 'DELETE' });

// Analytics and Reports
export const getMentorWorkload = () => authenticatedFetch('/api/admin/project-submissions/mentor-workload');
export const getSubmissionsByCareer = (careerId: string, status?: string) => {
  const params = status ? `?status=${status}` : '';
  return authenticatedFetch(`/api/admin/careers/${careerId}/submissions${params}`);
};
export const getSubmissionsByUser = (userId: string, status?: string) => {
  const params = status ? `?status=${status}` : '';
  return authenticatedFetch(`/api/admin/users/${userId}/submissions${params}`);
};

// Achievements Management
export const getAllAchievements = (params?: Record<string, string>) => {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
  return authenticatedFetch(`/api/admin/achievements${queryString}`);
};
export const getAchievement = (id: string) => authenticatedFetch(`/api/admin/achievements/${id}`);
export const createAchievement = (data: unknown) => authenticatedFetch('/api/admin/achievements', { method: 'POST', body: JSON.stringify(data) });
export const updateAchievement = (id: string, data: unknown) => authenticatedFetch(`/api/admin/achievements/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAchievement = (id: string) => authenticatedFetch(`/api/admin/achievements/${id}`, { method: 'DELETE' });
export const assignAchievementToUsers = (id: string, userIds: string[]) => authenticatedFetch(`/api/admin/achievements/${id}/assign`, { method: 'POST', body: JSON.stringify({ userIds }) });
export const getAchievementStats = (id: string) => authenticatedFetch(`/api/admin/achievements/${id}/stats`);
export const bulkAssignAchievements = (data: unknown) => authenticatedFetch('/api/admin/achievements/bulk-assign', { method: 'POST', body: JSON.stringify(data) });

// User Progress Management
export const getAllUserProgress = (params?: Record<string, string>) => {
  const queryString = params && Object.keys(params).length > 0 ? `?${new URLSearchParams(params).toString()}` : '';
  return authenticatedFetch(`/api/admin/user-progress${queryString}`);
};
export const getUserProgress = (userId: string, careerId: string) => authenticatedFetch(`/api/admin/user-progress/${userId}/${careerId}`);
export const resetUserProgress = (userId: string, careerId: string) => authenticatedFetch(`/api/admin/user-progress/${userId}/${careerId}`, { method: 'DELETE' });
export const getUserProgressAnalytics = (careerId: string) => authenticatedFetch(`/api/admin/user-progress/analytics/${careerId}`);
export const getUserAchievements = (userId: string) => authenticatedFetch(`/api/admin/user-progress/${userId}/achievements`);
export const exportUserProgress = (format?: string) => {
  const params = format ? `?format=${format}` : '';
  return authenticatedFetch(`/api/admin/user-progress/export${params}`);
};

// Reset Progress Management
export const getResetStatistics = () => authenticatedFetch('/api/admin/user-progress/reset-statistics');
export const resetAllMemberProgress = () => authenticatedFetch('/api/admin/user-progress/reset-all', { method: 'POST' });
export const resetIndividualMemberProgress = (userId: string) => authenticatedFetch(`/api/admin/user-progress/reset-user/${userId}`, { method: 'POST' });
