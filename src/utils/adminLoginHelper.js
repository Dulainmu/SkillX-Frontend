// Helper function to log in as admin for testing
export const loginAsAdmin = () => {
  // This is the admin token we generated earlier
  const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OWYyOGRiMDJhYTBlNTIwYTkzMDI1OCIsImVtYWlsIjoiYWRtaW5Ac2tpbGx4LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NTMwMDY5MSwiZXhwIjoxNzU1Mzg3MDkxfQ.n2SDQl5K5hSdkQk6X88kQrHCAUNCSWADwYrb3xlW5uI';
  
  // Store the token in localStorage
  localStorage.setItem('skillx-token', adminToken);
  
  console.log('✅ Logged in as admin successfully!');
  console.log('You can now access admin pages.');
  
  // Reload the page to apply the authentication
  window.location.reload();
};

// Helper function to check if user is admin
export const isAdmin = () => {
  const token = localStorage.getItem('skillx-token');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role === 'admin';
  } catch (error) {
    return false;
  }
};

// Helper function to logout
export const logout = () => {
  localStorage.removeItem('skillx-token');
  sessionStorage.removeItem('skillx-token');
  console.log('✅ Logged out successfully!');
  window.location.reload();
};
