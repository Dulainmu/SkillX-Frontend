# Authentication Flow for Career Assessment

## Overview

The career assessment system now supports both authenticated and unauthenticated users, providing a seamless experience while encouraging users to create accounts to save their results.

## Key Features

### ✅ **Guest Mode Support**
- Users can take the complete career assessment without logging in
- All progress is saved locally in localStorage
- No authentication required to start or complete the assessment

### ✅ **Authentication Prompt**
- When users try to submit results, they're prompted to sign in or create an account
- Assessment data is preserved during the authentication process
- Users can continue without saving if they prefer

### ✅ **Seamless Data Restoration**
- Assessment progress is automatically restored after authentication
- Users return to exactly where they left off
- No data loss during the authentication flow

## User Flow

### **Unauthenticated User Journey**

1. **Start Assessment**: User navigates to `/career-assessment`
2. **Complete Steps**: User goes through all 5 assessment steps
   - Goal Setting
   - Skills Assessment  
   - Personality Quiz
   - Learning Preferences
   - Results (local only)
3. **Authentication Prompt**: When reaching Results, user sees auth modal
4. **Choose Option**:
   - **Sign In**: Redirects to login with assessment data preserved
   - **Create Account**: Redirects to signup with assessment data preserved
   - **Continue Without Saving**: Proceeds to results without backend submission

### **Authenticated User Journey**

1. **Start Assessment**: User navigates to `/career-assessment`
2. **Complete Steps**: User goes through all 5 assessment steps
3. **Automatic Submission**: Results are automatically submitted to backend
4. **Full Results**: User gets personalized recommendations and can save progress

## Technical Implementation

### **Frontend Changes**

#### **AssessmentFlow.tsx**
- Removed mandatory authentication requirement
- Added authentication prompt modal
- Implemented data preservation during auth redirects
- Added pending assessment data restoration

#### **Login.tsx**
- Added redirect parameter handling (`?redirect=/career-assessment`)
- Added assessment data restoration after successful login
- Shows toast notification when assessment is restored

#### **Signup.tsx**
- Added redirect parameter handling
- Passes redirect to login page after successful signup

### **Data Flow**

#### **Local Storage Keys**
```javascript
// Assessment progress (local)
'skillx-assessment-state-v1'

// Quiz answers (local)
'skillx-quiz-answers'

// Pending assessment (during auth redirect)
'skillx-pending-assessment'
```

#### **Assessment Data Structure**
```javascript
{
  currentStep: number,
  data: {
    goals: string | null,
    skills: Record<string, { selected: boolean; level: number }>,
    personality: Record<string, any>,
    personalityType: string,
    personalityData: any,
    preferences: {
      learningStyle: string[],
      timeCommitment: string,
      budget: string
    },
    portfolio: File | null,
    backend?: BackendRecommendationsResponse
  },
  answers: Record<number, number>
}
```

### **Authentication Modal**

The authentication prompt modal appears when:
- User reaches the Results step
- User is not authenticated
- User tries to submit results to backend

**Modal Options:**
1. **Sign In**: Redirects to `/login?redirect=/career-assessment`
2. **Create Account**: Redirects to `/signup?redirect=/career-assessment`
3. **Continue Without Saving**: Closes modal, shows local results

## API Integration

### **Backend Endpoints**

#### **Requires Authentication**
- `POST /api/careers/submit-quiz` - Submit assessment results
- `GET /api/assessment-progress/me` - Get user's assessment progress
- `POST /api/assessment-progress/me` - Save assessment progress
- `DELETE /api/assessment-progress/me` - Clear assessment progress

#### **Public Endpoints**
- `GET /api/careers/` - List all careers (for fallback results)
- `GET /api/careers/:id` - Get specific career details

### **Error Handling**

#### **401 Unauthorized**
- Triggers authentication prompt
- Preserves assessment data
- Allows user to continue without saving

#### **Network Errors**
- Falls back to local storage
- Shows appropriate error messages
- Maintains user experience

## Benefits

### ✅ **Improved User Experience**
- No barriers to starting assessment
- Seamless authentication flow
- No data loss during auth process

### ✅ **Higher Conversion Rates**
- Users can experience value before signing up
- Natural progression to account creation
- Reduced friction in user journey

### ✅ **Data Preservation**
- Assessment progress is never lost
- Automatic restoration after authentication
- Local backup for offline scenarios

### ✅ **Flexible Options**
- Users can choose to save or continue without account
- No forced authentication
- Respects user preferences

## Usage Examples

### **Starting Assessment (Unauthenticated)**
```javascript
// User navigates to /career-assessment
// No authentication required
// Progress saved locally
```

### **Authentication Prompt**
```javascript
// When user reaches Results step
if (!user) {
  setShowAuthPrompt(true);
  // Modal appears with options
}
```

### **Data Restoration After Login**
```javascript
// After successful login
const pendingAssessment = localStorage.getItem('skillx-pending-assessment');
if (pendingAssessment) {
  // Restore assessment data
  // Navigate back to assessment
  // Show success toast
}
```

### **Backend Submission**
```javascript
// Only for authenticated users
if (user) {
  const result = await assessmentApi.submitQuiz(payload);
  // Get personalized recommendations
  // Save to user profile
}
```

## Configuration

### **Environment Variables**
```javascript
// API configuration
VITE_API_URL=http://localhost:4000

// Storage keys
STORAGE_KEY='skillx-assessment-state-v1'
PENDING_ASSESSMENT_KEY='skillx-pending-assessment'
```

### **Authentication Settings**
```javascript
// Token storage
localStorage.setItem('skillx-token', token);
sessionStorage.setItem('skillx-token', token);

// User data
localStorage.setItem('user', JSON.stringify(userData));
```

## Testing

### **Test Scenarios**

1. **Unauthenticated Assessment**
   - Complete full assessment without login
   - Verify local storage saves
   - Test authentication prompt

2. **Authentication Flow**
   - Start assessment as guest
   - Trigger auth prompt
   - Complete login/signup
   - Verify data restoration

3. **Authenticated Assessment**
   - Login first, then take assessment
   - Verify backend submission
   - Test progress saving

4. **Error Handling**
   - Test network failures
   - Verify fallback behavior
   - Check error messages

### **Manual Testing Steps**

1. Navigate to `/career-assessment` without logging in
2. Complete the assessment steps
3. When reaching Results, verify auth modal appears
4. Choose "Sign In" and complete login
5. Verify assessment data is restored
6. Verify backend submission works

## Future Enhancements

### **Planned Improvements**

1. **Social Login Integration**
   - Google, GitHub, LinkedIn login
   - Faster authentication flow

2. **Progressive Enhancement**
   - Save partial results to backend
   - Real-time sync for authenticated users

3. **Offline Support**
   - Service worker for offline assessment
   - Sync when connection restored

4. **Analytics Integration**
   - Track conversion rates
   - Monitor user journey
   - A/B test authentication prompts

### **Performance Optimizations**

1. **Lazy Loading**
   - Load assessment components on demand
   - Reduce initial bundle size

2. **Caching**
   - Cache career data locally
   - Optimize API calls

3. **Progressive Web App**
   - Installable assessment app
   - Offline functionality

## Troubleshooting

### **Common Issues**

1. **Assessment Data Not Restored**
   - Check localStorage for pending assessment data
   - Verify authentication was successful
   - Check browser console for errors

2. **Authentication Modal Not Appearing**
   - Verify user is not authenticated
   - Check currentStep is 4 (Preferences)
   - Ensure showAuthPrompt state is set

3. **Backend Submission Fails**
   - Check user authentication status
   - Verify API endpoint is accessible
   - Check network connectivity

4. **Progress Not Saving**
   - Verify user is authenticated
   - Check localStorage permissions
   - Monitor API response status

### **Debug Tools**

```javascript
// Check assessment data
console.log(localStorage.getItem('skillx-assessment-state-v1'));

// Check pending assessment
console.log(localStorage.getItem('skillx-pending-assessment'));

// Check authentication
console.log(localStorage.getItem('skillx-token'));
```

## Conclusion

The new authentication flow provides a seamless experience for both authenticated and unauthenticated users, encouraging account creation while maintaining a smooth user journey. The system preserves assessment data throughout the authentication process and provides multiple options for users to save their results.
