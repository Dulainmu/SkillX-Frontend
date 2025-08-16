// src/services/recommendationApi.ts
import type { CareerRecommendation } from '@/types/recommendations';
import type { BackendRecommendationsResponse, BackendTopMatch } from '@/types/backendRecommendations';
import { getApiUrl, getAuthToken } from '@/config/api';

/**
 * Adapter: map a BackendTopMatch to the legacy CareerRecommendation type
 * so existing UI can keep rendering without changes.
 */
function mapTopMatchToLegacy(match: BackendTopMatch): CareerRecommendation {
  return {
    id: match.pathId,
    name: match.name,
    description: match.description,
    matchPercentage: typeof match.currentRole?.score === 'number' ? match.currentRole.score : 0,
    difficulty: 'Intermediate',
    pathId: match.pathId,
  };
}

export const recommendationsApi = {
  /**
   * Fetch the full backend shape (topMatches, profile, paths).
   */
  async getBackendRecommendations(): Promise<BackendRecommendationsResponse> {
    const token = getAuthToken();

    const res = await fetch(getApiUrl('/api/recommendations/personalized'), {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`GET /api/recommendations/personalized failed: ${res.status} ${text}`);
    }

    const raw = await res.json();
    // The endpoint may return either { topMatches, profile, paths } (new)
    // or { recommendations: CareerRecommendation[] } (legacy cosine API).
    // Normalize into BackendRecommendationsResponse expected by the UI.
    const data = raw as Partial<BackendRecommendationsResponse> & { recommendations?: any[] };

    // If only legacy recommendations are present, adapt minimally
    if (!data.topMatches && Array.isArray(data.recommendations)) {
      return {
        topMatches: data.recommendations.map((r: any) => ({
          pathId: String(r.id || r._id || r.slug || r.name || 'unknown'),
          name: r.name,
          description: r.description,
          currentRole: {
            title: r.name || 'Role',
            level: 'entry',
            score: typeof r.matchPercentage === 'number' ? r.matchPercentage : 0,
          },
          averageSalary: r.averageSalary,
          jobGrowth: r.jobGrowth,
        })),
        profile: undefined as unknown as any,
        paths: [],
        timestamp: (raw as any).timestamp,
      } as BackendRecommendationsResponse;
    }

    return {
      topMatches: Array.isArray(data.topMatches) ? data.topMatches : [],
      profile: data.profile as any,
      paths: Array.isArray(data.paths) ? (data.paths as any) : [],
      timestamp: (data as any).timestamp,
    } as BackendRecommendationsResponse;
  },

  /**
   * Legacy helper: return an array compatible with your existing CareerRecommendation[] UI.
   * This maps backend topMatches → CareerRecommendation.
   */
  async getRecommendations(): Promise<CareerRecommendation[]> {
    const payload = await this.getBackendRecommendations();
    return (payload.topMatches || []).map(mapTopMatchToLegacy);
  },

  /**
   * Keep existing helpers below (unchanged APIs).
   */
  async getCareerById(careerId: string): Promise<CareerRecommendation | null> {
    const token = getAuthToken();

    // Map short slugs to full slugs - updated to match actual database career roles
    const slugMap: Record<string, string> = {
      'frontend-dev': 'frontend-developer',
      'backend-dev': 'backend-developer',
      'full-stack-dev': 'full-stack-developer',
      // Remove mappings for non-existent career paths
      // 'data-analyst': 'data-analyst',
      // 'ux-designer': 'ux-designer',
      // 'product-manager': 'product-manager',
    };
    const mappedId = slugMap[careerId] || careerId;

    // Helper to check if string is a valid MongoDB ObjectId
    const isObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

    if (token) {
      try {
        let url = '';
        if (isObjectId(mappedId)) {
          url = getApiUrl(`/api/careers/${mappedId}`);
        } else {
          url = getApiUrl(`/api/careers/slug/${mappedId}`);
        }
        // Debug log
        console.log('Requesting career by URL:', url);
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = (await res.json()) as CareerRecommendation;
          return data;
        }
      } catch {
        // ignore and fall back
      }
    }

    // Fallback: search within mapped recommendations
    const recs = await this.getRecommendations();
    return recs.find((c) => c.id === mappedId) || null;
  },

  async getCareerSkills(
      careerId: string
  ): Promise<{ career: CareerRecommendation; skills: any[] } | null> {
    const token = getAuthToken();

    if (token) {
      try {
        const res = await fetch(getApiUrl(`/api/careers/${careerId}/skills`), {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch {
        // ignore; return null below
      }
    }

    return null;
  },

  async getBriefRoadmap(careerId: string) {
    const token = getAuthToken();
    
    // Map short slugs to full slugs - updated to match actual database career roles
    const slugMap: Record<string, string> = {
      'frontend-dev': 'frontend-developer',
      'backend-dev': 'backend-developer',
      'full-stack-dev': 'full-stack-developer',
      // Remove mappings for non-existent career paths
      // 'data-analyst': 'data-analyst',
      // 'ux-designer': 'ux-designer',
      // 'product-manager': 'product-manager',
    };
    const mappedId = slugMap[careerId] || careerId;
    
    console.log('Requesting brief roadmap for:', careerId, 'mapped to:', mappedId);
    
    const res = await fetch(getApiUrl(`/api/careers/${mappedId}/brief-roadmap`), {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Failed to load brief roadmap');
    return res.json();
  },
};
