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

## Testing the Connection

After deployment, test that your frontend can communicate with your Railway backend by:
1. Opening your Vercel app URL
2. Trying to log in or use any feature that makes API calls
3. Checking the browser's Network tab to ensure requests are going to your Railway URL 