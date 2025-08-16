export interface CareerRecommendation {
  id: string;
  name: string;
  description: string;
  matchPercentage: number;
  difficulty: string;
  pathId: string;
  detailedRoadmap?: RoadmapStep[];
  learningContent?: LearningMaterial[];
}

export interface Resource {
  title: string;
  type: string;
  url?: string;
  description?: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  skills: string[];
  estimatedTime: string;
  xpReward: number;
  projects: Project[];
  resources?: Resource[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  skills: string[];
  xpReward: number;
  requirements?: string[];
  deliverables?: string[];
  resources?: Resource[];
}

export interface LearningMaterial {
  _id: string;
  title: string;
  description: string;
  type: string;
  url?: string;
  skill: string;
  provider?: string;
}

// New types for brief roadmap
export interface BriefRoadmapStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  xpReward: number;
  projectCount: number;
  skills: string[];
  difficulty: string;
  resources?: Resource[];
  projects?: Project[];
}

export interface BriefRoadmapOverview {
  totalSteps: number;
  totalProjects: number;
  estimatedDuration: number;
  totalXp: number;
}

export interface BriefRoadmap {
  id: string;
  name: string;
  slug: string;
  description: string;
  averageSalary?: string;
  jobGrowth?: string;
  skills: string[];
  overview: BriefRoadmapOverview;
  steps: BriefRoadmapStep[];
}

export interface RecommendationsResponse {
  recommendations: CareerRecommendation[];
  userId?: string;
  timestamp: string;
}