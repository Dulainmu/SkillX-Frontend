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
  },

  async getCareerById(careerId: string): Promise<CareerRecommendation | null> {
    try {
      const token = getAuthToken();
      
      // Try to fetch specific career details
      if (token) {
        try {
          const response = await fetch(getApiUrl(`/api/careers/${careerId}`), {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            return data;
          }
        } catch (error) {
          console.log('Specific career endpoint not available, falling back to general recommendations');
        }
      }
      
      // Fallback to general recommendations
      const recommendations = await this.getRecommendations();
      return recommendations.find(career => career.id === careerId) || null;
    } catch (error) {
      console.error('Error fetching career by ID:', error);
      throw error;
    }
  }
};