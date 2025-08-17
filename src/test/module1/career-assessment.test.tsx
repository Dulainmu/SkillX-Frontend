// src/test/module1/career-assessment.test.tsx
// Module 1: Career Assessment & Quiz System - Frontend Test Cases

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { CareerProvider } from '@/contexts/CareerContext'
import { QuizProvider } from '@/contexts/QuizContext'
import Login from '@/pages/Login'
import CareerAssessment from '@/pages/CareerAssessment'
import Dashboard from '@/pages/Dashboard'

// Mock API calls
vi.mock('@/config/api', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

vi.mock('@/api/adminApi', () => ({
  adminApi: {
    login: vi.fn(),
  },
}))

const mockApiClient = vi.mocked(await import('@/config/api')).apiClient
const mockAdminApi = vi.mocked(await import('@/api/adminApi')).adminApi

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      <CareerProvider>
        <QuizProvider>
          {children}
        </QuizProvider>
      </CareerProvider>
    </AuthProvider>
  </BrowserRouter>
)

describe('Module 1: Career Assessment & Quiz System - Frontend Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('TC_AUTO_001: Login Functionality Test', () => {
    it('should render login page with form elements', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should handle successful login and redirect to dashboard', async () => {
      const user = userEvent.setup()
      
      // Mock successful login response
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          token: 'mock-jwt-token',
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'learner'
          }
        }
      })

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      // Fill in login form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Verify API call was made
      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
          email: 'test@example.com',
          password: 'password123'
        })
      })

      // Verify token was stored
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token')
    })

    it('should display error message for invalid credentials', async () => {
      const user = userEvent.setup()
      
      // Mock failed login response
      mockApiClient.post.mockRejectedValueOnce({
        response: {
          data: { message: 'Invalid credentials' }
        }
      })

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      // Fill in login form
      await user.type(screen.getByLabelText(/email/i), 'invalid@example.com')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })

    it('should validate form inputs before submission', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      // Try to submit without filling form
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Verify validation messages
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })

      // Verify API was not called
      expect(mockApiClient.post).not.toHaveBeenCalled()
    })
  })

  describe('TC_AUTO_002: Quiz Questions Loading Test', () => {
    it('should load and display quiz questions correctly', async () => {
      // Mock quiz data
      const mockQuizData = {
        _id: 'quiz1',
        title: 'Frontend Development Assessment',
        description: 'Test your frontend development knowledge',
        questions: [
          {
            question: 'What is your experience with JavaScript?',
            type: 'multiple-choice',
            options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
            correctAnswer: 1
          },
          {
            question: 'Do you prefer working with frontend or backend?',
            type: 'multiple-choice',
            options: ['Frontend', 'Backend', 'Both', 'Neither'],
            correctAnswer: 0
          }
        ]
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockQuizData })

      render(
        <TestWrapper>
          <CareerAssessment />
        </TestWrapper>
      )

      // Wait for quiz to load
      await waitFor(() => {
        expect(screen.getByText('Frontend Development Assessment')).toBeInTheDocument()
      })

      // Verify questions are displayed
      expect(screen.getByText('What is your experience with JavaScript?')).toBeInTheDocument()
      expect(screen.getByText('Do you prefer working with frontend or backend?')).toBeInTheDocument()

      // Verify options are displayed
      expect(screen.getByText('Beginner')).toBeInTheDocument()
      expect(screen.getByText('Intermediate')).toBeInTheDocument()
      expect(screen.getByText('Advanced')).toBeInTheDocument()
      expect(screen.getByText('Expert')).toBeInTheDocument()
    })

    it('should handle quiz loading errors gracefully', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Failed to load quiz'))

      render(
        <TestWrapper>
          <CareerAssessment />
        </TestWrapper>
      )

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/failed to load quiz/i)).toBeInTheDocument()
      })
    })

    it('should show loading state while fetching quiz', async () => {
      // Mock delayed response
      mockApiClient.get.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
      )

      render(
        <TestWrapper>
          <CareerAssessment />
        </TestWrapper>
      )

      // Verify loading indicator is shown
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })
  })

  describe('TC_AUTO_003: Answer Validation Test', () => {
    it('should validate and submit quiz answers correctly', async () => {
      const user = userEvent.setup()

      const mockQuizData = {
        _id: 'quiz1',
        title: 'Test Quiz',
        questions: [
          {
            question: 'What is your experience with JavaScript?',
            type: 'multiple-choice',
            options: ['Beginner', 'Intermediate', 'Advanced'],
            correctAnswer: 1
          }
        ]
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockQuizData })
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          resultId: 'result1',
          score: 100,
          totalQuestions: 1,
          correctAnswers: 1
        }
      })

      render(
        <TestWrapper>
          <CareerAssessment />
        </TestWrapper>
      )

      // Wait for quiz to load
      await waitFor(() => {
        expect(screen.getByText('Test Quiz')).toBeInTheDocument()
      })

      // Select an answer
      const intermediateOption = screen.getByText('Intermediate')
      await user.click(intermediateOption)

      // Submit quiz
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      // Verify submission was made
      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/quiz/submit', {
          quizId: 'quiz1',
          answers: [
            {
              questionIndex: 0,
              selectedAnswer: 1,
              timeSpent: expect.any(Number)
            }
          ],
          totalTime: expect.any(Number)
        })
      })
    })

    it('should prevent submission without selecting answers', async () => {
      const user = userEvent.setup()

      const mockQuizData = {
        _id: 'quiz1',
        title: 'Test Quiz',
        questions: [
          {
            question: 'What is your experience with JavaScript?',
            type: 'multiple-choice',
            options: ['Beginner', 'Intermediate', 'Advanced'],
            correctAnswer: 1
          }
        ]
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockQuizData })

      render(
        <TestWrapper>
          <CareerAssessment />
        </TestWrapper>
      )

      // Wait for quiz to load
      await waitFor(() => {
        expect(screen.getByText('Test Quiz')).toBeInTheDocument()
      })

      // Try to submit without selecting answers
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      // Verify validation message
      expect(screen.getByText(/please answer all questions/i)).toBeInTheDocument()

      // Verify API was not called
      expect(mockApiClient.post).not.toHaveBeenCalled()
    })
  })

  describe('TC_AUTO_004: Career Recommendation Engine Test', () => {
    it('should display career recommendations based on quiz results', async () => {
      const mockRecommendations = [
        {
          id: 'career1',
          name: 'Frontend Developer',
          description: 'Build user interfaces and web applications',
          weightedScore: 85,
          skillFit: 0.8,
          personalityFit: 0.9,
          missingSkills: [
            { skill: 'React', have: 0, need: 3, importance: 'important' }
          ]
        },
        {
          id: 'career2',
          name: 'Backend Developer',
          description: 'Develop server-side applications',
          weightedScore: 75,
          skillFit: 0.7,
          personalityFit: 0.8,
          missingSkills: [
            { skill: 'Node.js', have: 0, need: 3, importance: 'essential' }
          ]
        }
      ]

      mockApiClient.get.mockResolvedValueOnce({ data: mockRecommendations })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Wait for recommendations to load
      await waitFor(() => {
        expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
        expect(screen.getByText('Backend Developer')).toBeInTheDocument()
      })

      // Verify recommendation details
      expect(screen.getByText(/build user interfaces/i)).toBeInTheDocument()
      expect(screen.getByText(/85%/i)).toBeInTheDocument()
      expect(screen.getByText(/75%/i)).toBeInTheDocument()
    })

    it('should rank recommendations by relevance score', async () => {
      const mockRecommendations = [
        { id: 'career1', name: 'Career 1', weightedScore: 75 },
        { id: 'career2', name: 'Career 2', weightedScore: 85 },
        { id: 'career3', name: 'Career 3', weightedScore: 65 }
      ]

      mockApiClient.get.mockResolvedValueOnce({ data: mockRecommendations })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Wait for recommendations to load
      await waitFor(() => {
        expect(screen.getByText('Career 2')).toBeInTheDocument()
      })

      // Get all career names in order
      const careerElements = screen.getAllByText(/career \d/i)
      const careerNames = careerElements.map(el => el.textContent)

      // Verify they are in descending order by score
      expect(careerNames).toEqual(['Career 2', 'Career 1', 'Career 3'])
    })

    it('should display missing skills analysis', async () => {
      const mockRecommendations = [
        {
          id: 'career1',
          name: 'Frontend Developer',
          weightedScore: 85,
          missingSkills: [
            { skill: 'React', have: 0, need: 3, importance: 'essential' },
            { skill: 'TypeScript', have: 1, need: 3, importance: 'important' }
          ]
        }
      ]

      mockApiClient.get.mockResolvedValueOnce({ data: mockRecommendations })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Wait for recommendations to load
      await waitFor(() => {
        expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
      })

      // Verify missing skills are displayed
      expect(screen.getByText(/react/i)).toBeInTheDocument()
      expect(screen.getByText(/typescript/i)).toBeInTheDocument()
      expect(screen.getByText(/essential/i)).toBeInTheDocument()
      expect(screen.getByText(/important/i)).toBeInTheDocument()
    })
  })

  describe('TC_AUTO_005: Skills Rating System Test', () => {
    it('should allow users to rate technical skills', async () => {
      const user = userEvent.setup()

      mockApiClient.post.mockResolvedValueOnce({
        data: { message: 'Skills rated successfully' }
      })

      render(
        <TestWrapper>
          <CareerAssessment />
        </TestWrapper>
      )

      // Navigate to skills assessment
      const skillsTab = screen.getByRole('tab', { name: /skills/i })
      await user.click(skillsTab)

      // Find and rate a skill
      const javascriptSkill = screen.getByText(/javascript/i)
      expect(javascriptSkill).toBeInTheDocument()

      // Select skill level
      const level3Button = screen.getByRole('button', { name: /level 3/i })
      await user.click(level3Button)

      // Submit skills assessment
      const submitButton = screen.getByRole('button', { name: /save skills/i })
      await user.click(submitButton)

      // Verify API call was made
      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/skills/rate', {
          skills: expect.objectContaining({
            JavaScript: { level: 3, selected: true }
          })
        })
      })
    })

    it('should allow users to rate personal qualities', async () => {
      const user = userEvent.setup()

      mockApiClient.post.mockResolvedValueOnce({
        data: { message: 'Skills rated successfully' }
      })

      render(
        <TestWrapper>
          <CareerAssessment />
        </TestWrapper>
      )

      // Navigate to personal qualities section
      const qualitiesTab = screen.getByRole('tab', { name: /personal qualities/i })
      await user.click(qualitiesTab)

      // Rate communication skills
      const communicationSkill = screen.getByText(/communication/i)
      expect(communicationSkill).toBeInTheDocument()

      const level4Button = screen.getByRole('button', { name: /level 4/i })
      await user.click(level4Button)

      // Submit assessment
      const submitButton = screen.getByRole('button', { name: /save assessment/i })
      await user.click(submitButton)

      // Verify submission
      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/skills/rate', {
          skills: expect.objectContaining({
            Communication: { level: 4, selected: true }
          })
        })
      })
    })

    it('should validate skill level ranges', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <CareerAssessment />
        </TestWrapper>
      )

      // Navigate to skills assessment
      const skillsTab = screen.getByRole('tab', { name: /skills/i })
      await user.click(skillsTab)

      // Try to select invalid level (should not be possible with proper UI)
      const levelButtons = screen.getAllByRole('button', { name: /level \d/i })
      
      // Verify only valid levels (1-5) are available
      levelButtons.forEach(button => {
        const levelText = button.textContent
        const level = parseInt(levelText?.match(/\d+/)?.[0] || '0')
        expect(level).toBeGreaterThanOrEqual(1)
        expect(level).toBeLessThanOrEqual(5)
      })
    })

    it('should update existing skills ratings', async () => {
      const user = userEvent.setup()

      // Mock initial skills data
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          skills: {
            JavaScript: { level: 2, selected: true }
          }
        }
      })

      mockApiClient.post.mockResolvedValueOnce({
        data: { message: 'Skills updated successfully' }
      })

      render(
        <TestWrapper>
          <CareerAssessment />
        </TestWrapper>
      )

      // Wait for skills to load
      await waitFor(() => {
        expect(screen.getByText(/javascript/i)).toBeInTheDocument()
      })

      // Update skill level
      const level4Button = screen.getByRole('button', { name: /level 4/i })
      await user.click(level4Button)

      // Submit update
      const submitButton = screen.getByRole('button', { name: /update skills/i })
      await user.click(submitButton)

      // Verify update was sent
      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/skills/rate', {
          skills: expect.objectContaining({
            JavaScript: { level: 4, selected: true }
          })
        })
      })
    })
  })
})
