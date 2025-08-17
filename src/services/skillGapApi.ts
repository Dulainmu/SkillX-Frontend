import { apiClient } from '../config/api';

export interface SkillDetail {
  skillName: string;
  requiredLevel: number;
  currentLevel: number;
  levelsNeeded: number;
  status: 'met' | 'needs_improvement' | 'missing';
  importance: 'high' | 'medium' | 'low';
  priority: number;
  recommendation: string;
}

export interface Recommendation {
  type: 'success' | 'focus' | 'improve' | 'priority' | 'quick_win';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TimeEstimate {
  totalWeeks: number;
  months: number;
  weeks: number;
  description: string;
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  description: string;
  skills: SkillDetail[];
  estimatedWeeks: number;
}

export interface SkillGapAnalysis {
  careerName: string;
  totalSkills: number;
  skillsAnalyzed: number;
  skillsMet: number;
  skillsNeedingImprovement: number;
  skillsMissing: number;
  overallProgress: number;
  skillDetails: SkillDetail[];
  recommendations: Recommendation[];
  estimatedTimeToComplete: TimeEstimate;
  roadmap: RoadmapPhase[];
}

export interface CareerGapAnalysis extends SkillGapAnalysis {
  careerId: string;
  careerSlug: string;
}

export interface AllCareerGapAnalysis {
  totalCareers: number;
  userSkills: Record<string, { selected: boolean; level: number }>;
  careerGaps: CareerGapAnalysis[];
}

export interface SkillGapSummary {
  totalCareers: number;
  totalSkillsNeeded: number;
  totalSkillsMissing: number;
  totalSkillsNeedingImprovement: number;
  bestCareerMatch: CareerGapAnalysis | null;
  topCareers: CareerGapAnalysis[];
  skillDistribution: {
    mastered: number;
    needsImprovement: number;
    missing: number;
  };
}

class SkillGapApi {
  /**
   * Get skill gap analysis for all career roles
   */
  async getAllCareerGapAnalysis(): Promise<AllCareerGapAnalysis> {
    const response = await apiClient.get('/skill-gap');
    return response.data.data;
  }

  /**
   * Get skill gap analysis for a specific career role
   */
  async getCareerGapAnalysis(careerSlug: string): Promise<SkillGapAnalysis> {
    const response = await apiClient.get(`/skill-gap/${careerSlug}`);
    return response.data.data;
  }

  /**
   * Get detailed skill roadmap for a career
   */
  async getSkillRoadmap(careerSlug: string): Promise<{
    careerName: string;
    careerSlug: string;
    gapAnalysis: SkillGapAnalysis;
    roadmap: RoadmapPhase[];
    estimatedTimeToComplete: TimeEstimate;
  }> {
    const response = await apiClient.get(`/skill-gap/${careerSlug}/roadmap`);
    return response.data.data;
  }

  /**
   * Get skill gap summary for dashboard
   */
  async getSkillGapSummary(): Promise<SkillGapSummary> {
    const response = await apiClient.get('/skill-gap/summary');
    return response.data.data;
  }
}

export const skillGapApi = new SkillGapApi();
