import { CareerRecommendation } from '@/types/recommendations';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const recommendationsApi = {
  async getRecommendations(): Promise<CareerRecommendation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommendations/careers`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const data = await response.json();
      return data.careers.map((career: any) => ({
        id: career._id || career.id,
        name: career.name,
        description: career.description,
        skills: career.skills || [],
        roadmap: career.roadmap || [],
        averageSalary: career.averageSalary || 'N/A',
        jobGrowth: career.jobGrowth || 'N/A',
        difficulty: career.difficulty || 'Intermediate',
        totalXp: career.totalXp || 0,
        matchPercentage: career.matchPercentage || 80,
      }));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }
};