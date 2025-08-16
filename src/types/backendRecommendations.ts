// src/types/backendRecommendations.ts
export interface BackendRoleSnapshot {
    title: string;
    level: 'entry' | 'mid' | 'advanced' | string;
    score?: number;
    skillFit?: number;
    personalityFit?: number;
    learningFit?: number;
    weightedScore?: number;
    qualifies?: boolean;
    missingSkills?: Array<{ skill: string; have: number; need: number }>;
}

export interface BackendTopMatch {
    pathId: string;
    name: string;
    description: string;
    industry?: string;
    averageSalary?: string;
    jobGrowth?: string;
    currentRole: {
        title: string;
        level: string;
        score: number;
    };
    nextRole?: {
        title: string;
        level: string;
        missingSkills: Array<{ skill: string; have: number; need: number }>;
    };
}

export interface BackendPath {
    id: string;
    name: string;
    description: string;
    industry?: string;
    averageSalary?: string;
    jobGrowth?: string;
    currentRole: BackendRoleSnapshot;
    nextRole?: BackendRoleSnapshot;
    roles?: BackendRoleSnapshot[];
}

export interface BackendProfile {
    RIASEC: Record<
        'Realistic' | 'Investigative' | 'Artistic' | 'Social' | 'Enterprising' | 'Conventional',
        number
    >;
    BigFive: Record<'Openness' | 'Conscientiousness' | 'Extraversion' | 'Agreeableness' | 'Neuroticism', number>;
    WorkValues: Record<'Achievement' | 'Independence' | 'Recognition' | 'Relationships' | 'Support' | 'WorkingConditions', number>;
    learningStyle: string[];
}

export interface BackendRecommendationsResponse {
    topMatches: BackendTopMatch[];
    profile: BackendProfile;
    paths: BackendPath[];
    timestamp?: string;
}
