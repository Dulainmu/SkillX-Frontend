# Deployment Guide

## Environment Variables

### Required for Vercel Deployment

Set the following environment variable in your Vercel project settings:

```
VITE_API_URL=https://skillx-backend-production.up.railway.app
```

### How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add a new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://skillx-backend-production.up.railway.app`
   - **Environment**: Production (and Preview if needed)

## Deployment Steps

1. **Build the project locally** (optional, to test):
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Set environment variables** in Vercel dashboard

4. **Redeploy** if needed:
   ```bash
   vercel --prod
   ```

## Backend Configuration

Make sure your Railway backend is running and accessible at:
`https://skillx-backend-production.up.railway.app`

### Required Backend Endpoints

Your Railway backend should have these endpoints:

1. **Authentication:**
   - `POST /api/users/login`
   - `POST /api/users/register`
   - `GET /api/users/profile`

2. **Quiz:**
   - `POST /api/quiz/submit`

3. **Recommendations:**
   - `GET /api/recommendations/personalized` (for personalized match scores)
   - `GET /api/recommendations/careers` (fallback for general recommendations)
   - `GET /api/careers/:id` (for specific career details)
   - `GET /api/careers/:id/roadmap` (for detailed career roadmap)
   - `GET /api/careers/:id/skills` (for career skills and learning resources)

4. **Progress Tracking:**
   - `GET /api/progress/:careerId`
   - `POST /api/progress/start`
   - `PUT /api/progress/:careerId/step/:stepIndex`

5. **Project Submissions:**
   - `POST /api/submissions`
   - `GET /api/submissions`
   - `GET /api/submissions/all/mentor`

6. **User Profile & Settings:**
   - `GET /api/users/profile`
   - `PUT /api/users/profile`
   - `POST /api/users/avatar`
   - `POST /api/users/change-password`
   - `GET /api/users/my-achievements`
   - `PUT /api/users/notification-settings`
   - `POST /api/users/reset-account`
   - `DELETE /api/users/delete-account`

7. **Progress Tracking:**
   - `GET /api/progress/all` (for profile stats)

## Testing the Connection

After deployment, test that your frontend can communicate with your Railway backend by:
1. Opening your Vercel app URL
2. Trying to log in or use any feature that makes API calls
3. Checking the browser's Network tab to ensure requests are going to your Railway URL

## Troubleshooting

### CORS Errors
If you see CORS errors like "Access to fetch has been blocked by CORS policy", this means your Railway backend needs to be configured to allow requests from your Vercel domain.

**Backend Fix Required:**
Your Railway backend needs to add CORS configuration to allow requests from:
- `https://skill-x-frontend.vercel.app`
- `https://your-app-name.vercel.app` (replace with your actual Vercel domain)

**Common CORS Configuration:**
```javascript
// In your backend server.js
app.use(cors({
  origin: [
    'https://skill-x-frontend.vercel.app',
    'https://your-app-name.vercel.app',
    'http://localhost:3000' // for local development
  ],
  credentials: true
}));
```

### Double Slash Issues
If you see URLs with double slashes like `https://skillx-backend-production.up.railway.app//api/users/login`, the frontend URL generation has been fixed to handle this automatically.

### Mentor Dashboard
The mentor dashboard now uses a simplified header without user navigation elements, providing a cleaner interface focused on project review functionality. 