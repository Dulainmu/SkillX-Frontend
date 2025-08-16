import { authenticatedFetch, getApiUrl } from '@/config/api';

// ===== SKILL INTERFACES =====
export interface SkillProficiencyLevel {
  level: string;
  title: string;
  description: string;
  expectations: string[];
  projects: string[];
  timeToAchieve: number;
  prerequisites: string[];
  resources: {
    type: string;
    title: string;
    url: string;
    description: string;
    difficulty: string;
    estimatedTime: number;
    isRequired: boolean;
  }[];
}

export interface Skill {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  estimatedTimeToLearn: number;
  xpReward: number;
  marketDemand: 'low' | 'medium' | 'high' | 'very-high';
  averageSalary?: number;
  jobGrowth?: number;
  tags: string[];
  keywords: string[];
  status: 'draft' | 'active' | 'deprecated' | 'archived';
  isPublic: boolean;
  totalUsers: number;
  averageCompletionTime?: number;
  successRate?: number;
  rating?: number;
  reviewCount: number;
  proficiencyLevels?: SkillProficiencyLevel[];
  createdAt: string;
  updatedAt: string;
}

export interface SkillCreateData {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  estimatedTimeToLearn: number;
  xpReward: number;
  marketDemand: 'low' | 'medium' | 'high' | 'very-high';
  averageSalary?: number;
  jobGrowth?: number;
  tags: string[];
  keywords: string[];
  status?: 'draft' | 'active' | 'deprecated' | 'archived';
  isPublic?: boolean;
  proficiencyLevels?: SkillProficiencyLevel[];
}

export interface UserSkillProgress {
  skill: string;
  skillName: string;
  skillSlug: string;
  level: 'not-started' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number;
  xpEarned: number;
  startedAt?: string;
  lastPracticedAt?: string;
  timeSpent: number;
  resourcesCompleted: string[];
  selfAssessment?: number;
  mentorAssessment?: number;
  quizScores: Array<{
    quizId: string;
    score: number;
    maxScore: number;
    completedAt: string;
  }>;
  projectsCompleted: Array<{
    projectId: string;
    projectTitle: string;
    score: number;
    completedAt: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issuedAt: string;
    expiresAt?: string;
    certificateUrl?: string;
  }>;
  status: 'learning' | 'practicing' | 'proficient' | 'mastered' | 'maintaining';
  isActive: boolean;
  notes?: string;
  mentorFeedback?: string;
  targetLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  targetDate?: string;
  learningGoals: string[];
}

export interface UserSkills {
  _id: string;
  user: string;
  skills: UserSkillProgress[];
  totalSkills: number;
  skillsInProgress: number;
  skillsCompleted: number;
  totalXpEarned: number;
  totalTimeSpent: number;
  categoryProgress: Array<{
    category: string;
    skillsCount: number;
    completedCount: number;
    averageProgress: number;
  }>;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  learningGoals: Array<{
    skillId: string;
    skillName: string;
    targetLevel: string;
    targetDate: string;
    isCompleted: boolean;
  }>;
  preferredLearningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic' | 'mixed';
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
  notifications: {
    skillReminders: boolean;
    goalDeadlines: boolean;
    achievementAlerts: boolean;
    mentorFeedback: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SkillAnalytics {
  totalSkills: number;
  skillsByCategory: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  skillsByDifficulty: Array<{
    difficulty: string;
    count: number;
    percentage: number;
  }>;
  skillsByMarketDemand: Array<{
    demand: string;
    count: number;
    percentage: number;
  }>;
  topSkills: Array<{
    name: string;
    totalUsers: number;
    averageRating: number;
  }>;
  recentActivity: Array<{
    skillName: string;
    action: string;
    timestamp: string;
  }>;
}

// ===== SKILL LEVEL CONSTANTS =====
export const SKILL_LEVELS = [
  { 
    value: 0, 
    label: 'No Experience', 
    color: 'bg-gray-100 border-gray-300', 
    textColor: 'text-gray-600',
    description: 'No experience with this skill',
    icon: '○'
  },
  { 
    value: 1, 
    label: 'Beginner', 
    color: 'bg-blue-100 border-blue-300', 
    textColor: 'text-blue-700',
    description: 'Basic understanding, can follow tutorials',
    icon: '●'
  },
  { 
    value: 2, 
    label: 'Intermediate', 
    color: 'bg-blue-200 border-blue-400', 
    textColor: 'text-blue-800',
    description: 'Can work on projects independently',
    icon: '●●'
  },
  { 
    value: 3, 
    label: 'Advanced', 
    color: 'bg-blue-300 border-blue-500', 
    textColor: 'text-blue-900',
    description: 'Can handle complex projects and mentor beginners',
    icon: '●●●'
  },
  { 
    value: 4, 
    label: 'Expert', 
    color: 'bg-gradient-to-r from-blue-600 to-indigo-700 border-blue-600', 
    textColor: 'text-white',
    description: 'Expert level, can architect solutions and lead teams',
    icon: '●●●●'
  },
];

// ===== SKILL CATEGORIES =====
export const SKILL_CATEGORIES = {
  'frontend': {
    name: 'Frontend Development',
    icon: 'Code',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'User interface and client-side development'
  },
  'backend': {
    name: 'Backend Development',
    icon: 'Database',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Server-side and API development'
  },
  'data': {
    name: 'Data & Analytics',
    icon: 'BarChart3',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Data analysis and machine learning'
  },
  'design': {
    name: 'Design & UX',
    icon: 'Palette',
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'User experience and visual design'
  },
  'devops': {
    name: 'DevOps & Cloud',
    icon: 'Server',
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    description: 'Infrastructure and deployment'
  },
  'mobile': {
    name: 'Mobile Development',
    icon: 'Smartphone',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    description: 'Mobile app development'
  },
  'cybersecurity': {
    name: 'Cybersecurity',
    icon: 'Shield',
    color: 'from-red-500 to-orange-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Security and threat protection'
  },
  'product': {
    name: 'Product Management',
    icon: 'Target',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Product strategy and management'
  },
  'soft-skills': {
    name: 'Soft Skills',
    icon: 'Users',
    color: 'from-yellow-500 to-amber-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Communication and leadership'
  }
};

// ===== SKILL DIFFICULTIES =====
export const SKILL_DIFFICULTIES = [
  { value: 'Beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { value: 'Intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
  { value: 'Advanced', label: 'Advanced', color: 'bg-purple-100 text-purple-800' },
  { value: 'Expert', label: 'Expert', color: 'bg-red-100 text-red-800' }
];

// ===== MARKET DEMAND LEVELS =====
export const MARKET_DEMAND_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'very-high', label: 'Very High', color: 'bg-red-100 text-red-800' }
];

// ===== ADMIN SKILL FUNCTIONS =====

// Get all skills (admin)
export const getAllSkills = (params?: Record<string, string>) => {
  const queryString = params && Object.keys(params).length > 0 ? `?${new URLSearchParams(params).toString()}` : '';
  return authenticatedFetch(`/api/skills${queryString}`);
};

// Get a specific skill
export const getSkill = (id: string) => authenticatedFetch(`/api/skills/${id}`);

// Create a new skill
export const createSkill = (skillData: SkillCreateData) => {
  return authenticatedFetch('/api/skills', {
    method: 'POST',
    body: JSON.stringify(skillData),
  });
};

// Update a skill
export const updateSkill = (id: string, skillData: Partial<SkillCreateData>) => {
  return authenticatedFetch(`/api/skills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(skillData),
  });
};

// Delete a skill
export const deleteSkill = (id: string) => {
  return authenticatedFetch(`/api/skills/${id}`, {
    method: 'DELETE',
  });
};

// Get skill analytics
export const getSkillAnalytics = (skillId: string) => {
  return authenticatedFetch(`/api/skills/${skillId}/analytics`);
};

// ===== USER SKILL FUNCTIONS =====

// Get user skills
export const getUserSkills = (userId: string) => {
  return authenticatedFetch(`/api/skills/user/${userId}`);
};

// Update user skill progress
export const updateUserSkill = (userId: string, skillId: string, progressData: Partial<UserSkillProgress>) => {
  return authenticatedFetch(`/api/skills/user/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ skillId, ...progressData }),
  });
};

// Add skill to user
export const addSkillToUser = (userId: string, skillData: { skillId: string; level?: string; targetLevel?: string }) => {
  return authenticatedFetch(`/api/skills/user/${userId}`, {
    method: 'POST',
    body: JSON.stringify(skillData),
  });
};

// Get skill recommendations for user
export const getSkillRecommendations = (userId: string, params?: Record<string, string>) => {
  const queryString = params && Object.keys(params).length > 0 ? `?${new URLSearchParams(params).toString()}` : '';
  return authenticatedFetch(`/api/skills/user/${userId}/recommendations${queryString}`);
};

// ===== PUBLIC SKILL ROUTES =====

// Get skill categories
export const getSkillCategories = async () => {
  const response = await fetch('/api/skills/categories');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Search skills
export const searchSkills = async (params?: Record<string, string>) => {
  const queryString = params && Object.keys(params).length > 0 ? `?${new URLSearchParams(params).toString()}` : '';
  const response = await fetch(`/api/skills/search${queryString}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Get skills by category
export const getSkillsByCategory = async (category: string) => {
  const response = await fetch(`/api/skills/category/${category}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Get a specific skill (public)
export const getPublicSkill = async (id: string) => {
  const response = await fetch(`/api/skills/${id}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// ===== HELPER FUNCTIONS =====

// Get skill level by value
export const getSkillLevelByValue = (value: number) => {
  return SKILL_LEVELS.find(level => level.value === value) || SKILL_LEVELS[0];
};

// Get skill level by label
export const getSkillLevelByLabel = (label: string) => {
  return SKILL_LEVELS.find(level => level.label === label) || SKILL_LEVELS[0];
};

// Get category info
export const getCategoryInfo = (category: string) => {
  return SKILL_CATEGORIES[category as keyof typeof SKILL_CATEGORIES] || {
    name: category,
    icon: 'Code',
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    description: 'General skill category'
  };
};

// Get difficulty info
export const getDifficultyInfo = (difficulty: string) => {
  return SKILL_DIFFICULTIES.find(d => d.value === difficulty) || SKILL_DIFFICULTIES[0];
};

// Get market demand info
export const getMarketDemandInfo = (demand: string) => {
  return MARKET_DEMAND_LEVELS.find(d => d.value === demand) || MARKET_DEMAND_LEVELS[0];
};

// Calculate skill progress percentage
export const calculateSkillProgress = (skill: UserSkillProgress) => {
  const levelValues = { 'not-started': 0, 'beginner': 25, 'intermediate': 50, 'advanced': 75, 'expert': 100 };
  const baseProgress = levelValues[skill.level] || 0;
  const additionalProgress = skill.progress * 0.25; // Additional 25% based on progress
  return Math.min(100, baseProgress + additionalProgress);
};

// Get skill status color
export const getSkillStatusColor = (status: string) => {
  const colors = {
    'learning': 'bg-blue-100 text-blue-800',
    'practicing': 'bg-yellow-100 text-yellow-800',
    'proficient': 'bg-green-100 text-green-800',
    'mastered': 'bg-purple-100 text-purple-800',
    'maintaining': 'bg-gray-100 text-gray-800'
  };
  return colors[status as keyof typeof colors] || colors.learning;
};

// Format time spent
export const formatTimeSpent = (hours: number) => {
  if (hours < 1) return '< 1 hour';
  if (hours < 24) return `${Math.round(hours)} hours`;
  const days = Math.round(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''}`;
};

// Format XP earned
export const formatXPEarned = (xp: number) => {
  if (xp < 1000) return `${xp} XP`;
  if (xp < 1000000) return `${(xp / 1000).toFixed(1)}K XP`;
  return `${(xp / 1000000).toFixed(1)}M XP`;
};
