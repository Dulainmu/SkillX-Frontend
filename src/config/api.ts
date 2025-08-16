//src/config/api.ts
// API Configuration
const isProduction = import.meta.env.MODE === 'production';
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (isProduction ? 'https://skillx-backend-production.up.railway.app' : 'http://localhost:4000');

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  // Remove leading slash from endpoint if it exists
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Ensure API_BASE_URL doesn't end with a slash
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  return `${baseUrl}/${cleanEndpoint}`;
};

// Helper function to get token from both storage locations
export const getAuthToken = () => {
  return localStorage.getItem('skillx-token') || sessionStorage.getItem('skillx-token');
};

// Helper function for authenticated requests
export const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  // Use absolute URL for production, relative for development
  const url = endpoint.startsWith('http') ? endpoint : getApiUrl(endpoint);
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    // Try to parse as JSON, but handle non-JSON responses gracefully
    let errorData = {};
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        // If it's not JSON, get the text content
        const textContent = await response.text();
        errorData = { message: `Server error: ${response.status}`, details: textContent.substring(0, 200) };
      }
    } catch (parseError) {
      errorData = { message: `HTTP error! status: ${response.status}` };
    }
    throw new Error((errorData as any).message || `HTTP error! status: ${response.status}`);
  }
  
  // Try to parse as JSON, but handle non-JSON responses gracefully
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      // If it's not JSON, return the text content
      const textContent = await response.text();
      throw new Error(`Expected JSON response but got: ${textContent.substring(0, 200)}`);
    }
  } catch (parseError) {
    throw new Error(`Failed to parse response: ${parseError.message}`);
  }
}; 