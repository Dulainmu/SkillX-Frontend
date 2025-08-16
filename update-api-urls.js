#!/usr/bin/env node
//update-api-urls.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to update API URLs in a file
function updateApiUrls(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace hardcoded localhost URLs with getApiUrl calls
    content = content.replace(
      /fetch\('http:\/\/localhost:4000(\/[^']+)'/g,
      "fetch(getApiUrl('$1')"
    );
    
    // Add import if not present
    if (content.includes('getApiUrl') && !content.includes("import { getApiUrl }")) {
      const importStatement = "import { getApiUrl } from '@/config/api';";
      const lastImportIndex = content.lastIndexOf('import');
      const insertIndex = content.indexOf('\n', lastImportIndex) + 1;
      content = content.slice(0, insertIndex) + importStatement + '\n' + content.slice(insertIndex);
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Files that need updating
const filesToUpdate = [
  'src/pages/Login.tsx',
  'src/pages/Signup.tsx',
  'src/pages/Quiz.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/CareerRoadmap.tsx',
  'src/pages/BrowseCareers.tsx',
  'src/pages/MentorDashboard.tsx',
  'src/pages/ResetPassword.tsx',
  'src/components/Header.tsx',
  'src/components/ProjectSubmission.tsx'
];

console.log('🔄 Updating API URLs for production...');

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    updateApiUrls(filePath);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('✅ API URL update complete!');
console.log('📝 Remember to:');
console.log('   1. Set VITE_API_URL in Vercel environment variables');
console.log('   2. Set FRONTEND_URL in Railway environment variables');
console.log('   3. Update any remaining hardcoded URLs manually'); 