import { CareerRecommendation } from '@/types/recommendations';
import { getApiUrl, getAuthToken } from '@/config/api';

export const recommendationsApi = {
  async getRecommendations(): Promise<CareerRecommendation[]> {
    try {
      // Get the authentication token
      const token = getAuthToken();
      
      // Call the personalized recommendations endpoint
      const response = await fetch(getApiUrl('/api/recommendations/personalized'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Fallback to general recommendations if personalized endpoint fails
        const fallbackResponse = await fetch(getApiUrl('/api/recommendations/careers'));
        if (!fallbackResponse.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        const fallbackData = await fallbackResponse.json();
        return fallbackData.careers.map((career: any) => ({
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
      }
      
      const data = await response.json();
      return data.recommendations || data.careers || [];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }
};