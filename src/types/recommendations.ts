export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  skills: string[];
  completed?: boolean;
  xpReward: number;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  skills: string[];
  projects: Project[];
  estimatedTime: string;
  completed?: boolean;
  xpReward: number;
}

export interface CareerRecommendation {
  id: string;
  name: string;
  description: string;
  matchPercentage: number;
  roadmap: string[];
  detailedRoadmap?: RoadmapStep[];
  skills: string[];
  averageSalary?: string;
  jobGrowth?: string;
  totalXp?: number;
  difficulty?: 'Beginner-Friendly' | 'Intermediate' | 'Advanced';
}

export interface RecommendationsResponse {
  recommendations: CareerRecommendation[];
  userId?: string;
  timestamp: string;
}