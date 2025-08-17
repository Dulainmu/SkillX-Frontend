// cypress/e2e/module1/career-assessment.cy.ts
// Module 1: Career Assessment & Quiz System - End-to-End Tests

describe('Module 1: Career Assessment & Quiz System', () => {
  beforeEach(() => {
    // Clear test data before each test
    cy.clearTestData()
    
    // Create test user if needed
    cy.createTestUser()
  })

  describe('TC_AUTO_001: Login Functionality Test', () => {
    it('should successfully log in with valid credentials', () => {
      // Visit login page
      cy.visit('/login')
      cy.get('[data-cy=login-page]').should('be.visible')

      // Fill in login form
      const { email, password } = Cypress.env('testUser')
      cy.get('[data-cy=email-input]').type(email)
      cy.get('[data-cy=password-input]').type(password)

      // Submit login form
      cy.get('[data-cy=login-button]').click()

      // Wait for API call
      cy.waitForApi('POST', '/auth/login')

      // Verify successful login
      cy.url().should('include', '/dashboard')
      cy.get('[data-cy=user-menu]').should('be.visible')
      cy.get('[data-cy=welcome-message]').should('contain', 'Welcome')
    })

    it('should reject login with invalid credentials', () => {
      cy.visit('/login')

      // Fill in invalid credentials
      cy.get('[data-cy=email-input]').type('invalid@example.com')
      cy.get('[data-cy=password-input]').type('wrongpassword')

      // Submit login form
      cy.get('[data-cy=login-button]').click()

      // Wait for API call
      cy.waitForApi('POST', '/auth/login')

      // Verify error message
      cy.get('[data-cy=error-message]').should('be.visible')
      cy.get('[data-cy=error-message]').should('contain', 'Invalid credentials')

      // Should still be on login page
      cy.url().should('include', '/login')
    })

    it('should reject login with non-existent email', () => {
      cy.visit('/login')

      // Fill in non-existent email
      cy.get('[data-cy=email-input]').type('nonexistent@example.com')
      cy.get('[data-cy=password-input]').type('password123')

      // Submit login form
      cy.get('[data-cy=login-button]').click()

      // Wait for API call
      cy.waitForApi('POST', '/auth/login')

      // Verify error message
      cy.get('[data-cy=error-message]').should('be.visible')
      cy.get('[data-cy=error-message]').should('contain', 'User not found')

      // Should still be on login page
      cy.url().should('include', '/login')
    })

    it('should validate form inputs before submission', () => {
      cy.visit('/login')

      // Try to submit without filling form
      cy.get('[data-cy=login-button]').click()

      // Verify validation messages
      cy.get('[data-cy=email-error]').should('be.visible')
      cy.get('[data-cy=email-error]').should('contain', 'Email is required')
      cy.get('[data-cy=password-error]').should('be.visible')
      cy.get('[data-cy=password-error]').should('contain', 'Password is required')

      // Should still be on login page
      cy.url().should('include', '/login')
    })

    it('should handle logout functionality', () => {
      // Login first
      cy.login()

      // Verify user is logged in
      cy.get('[data-cy=user-menu]').should('be.visible')

      // Logout
      cy.logout()

      // Verify logout
      cy.url().should('include', '/login')
      cy.get('[data-cy=login-page]').should('be.visible')
    })
  })

  describe('TC_AUTO_002: Quiz Questions Loading Test', () => {
    beforeEach(() => {
      cy.login()
      cy.navigateToCareerAssessment()
    })

    it('should load quiz questions successfully', () => {
      // Wait for quiz to load
      cy.get('[data-cy=quiz-container]').should('be.visible')
      cy.get('[data-cy=quiz-title]').should('contain', 'Career Assessment')

      // Verify questions are displayed
      cy.get('[data-cy=question-item]').should('have.length.at.least', 1)
      cy.get('[data-cy=question-text]').should('be.visible')

      // Verify answer options are displayed
      cy.get('[data-cy=answer-option]').should('have.length.at.least', 2)
    })

    it('should handle quiz loading errors gracefully', () => {
      // Intercept API call and return error
      cy.intercept('GET', `${Cypress.env('apiUrl')}/quiz`, {
        statusCode: 500,
        body: { message: 'Internal server error' }
      }).as('quizError')

      // Reload page to trigger error
      cy.reload()

      // Wait for error
      cy.wait('@quizError')

      // Verify error message is displayed
      cy.get('[data-cy=error-message]').should('be.visible')
      cy.get('[data-cy=error-message]').should('contain', 'Failed to load quiz')
    })

    it('should show loading state while fetching quiz', () => {
      // Intercept API call and delay response
      cy.intercept('GET', `${Cypress.env('apiUrl')}/quiz`, (req) => {
        req.reply((res) => {
          setTimeout(() => {
            res.send({
              statusCode: 200,
              body: {
                _id: 'quiz1',
                title: 'Career Assessment Quiz',
                questions: [
                  {
                    question: 'What is your experience with JavaScript?',
                    options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
                    correctAnswer: 1
                  }
                ]
              }
            })
          }, 2000)
        })
      }).as('delayedQuiz')

      // Reload page to trigger delayed response
      cy.reload()

      // Verify loading indicator is shown
      cy.get('[data-cy=loading-spinner]').should('be.visible')

      // Wait for quiz to load
      cy.wait('@delayedQuiz')
      cy.get('[data-cy=quiz-container]').should('be.visible')
    })

    it('should display quiz progress indicator', () => {
      cy.get('[data-cy=quiz-progress]').should('be.visible')
      cy.get('[data-cy=progress-bar]').should('be.visible')
      cy.get('[data-cy=question-counter]').should('contain', '1 of')
    })
  })

  describe('TC_AUTO_003: Answer Validation Test', () => {
    beforeEach(() => {
      cy.login()
      cy.navigateToCareerAssessment()
    })

    it('should validate and submit quiz answers correctly', () => {
      // Wait for quiz to load
      cy.get('[data-cy=quiz-container]').should('be.visible')

      // Answer first question
      cy.get('[data-cy=question-0]').within(() => {
        cy.get('[data-cy=option-1]').click() // Select intermediate level
      })

      // Verify answer is selected
      cy.get('[data-cy=question-0]').within(() => {
        cy.get('[data-cy=option-1]').should('have.class', 'selected')
      })

      // Answer second question
      cy.get('[data-cy=question-1]').within(() => {
        cy.get('[data-cy=option-0]').click() // Select frontend preference
      })

      // Submit quiz
      cy.get('[data-cy=submit-quiz-button]').click()

      // Wait for submission API call
      cy.waitForApi('POST', '/quiz/submit')

      // Verify results are displayed
      cy.get('[data-cy=quiz-results]').should('be.visible')
      cy.get('[data-cy=score-display]').should('be.visible')
      cy.get('[data-cy=total-questions]').should('be.visible')
    })

    it('should calculate correct score for mixed answers', () => {
      // Answer questions with known correct/incorrect answers
      cy.get('[data-cy=question-0]').within(() => {
        cy.get('[data-cy=option-1]').click() // Correct answer
      })

      cy.get('[data-cy=question-1]').within(() => {
        cy.get('[data-cy=option-3]').click() // Incorrect answer
      })

      // Submit quiz
      cy.get('[data-cy=submit-quiz-button]').click()

      // Wait for submission
      cy.waitForApi('POST', '/quiz/submit')

      // Verify score calculation
      cy.get('[data-cy=score-display]').should('contain', '50') // 1 out of 2 correct
      cy.get('[data-cy=correct-answers]').should('contain', '1')
    })

    it('should prevent submission without selecting answers', () => {
      // Try to submit without answering questions
      cy.get('[data-cy=submit-quiz-button]').click()

      // Verify validation message
      cy.get('[data-cy=validation-message]').should('be.visible')
      cy.get('[data-cy=validation-message]').should('contain', 'Please answer all questions')

      // Should still be on quiz page
      cy.get('[data-cy=quiz-container]').should('be.visible')
    })

    it('should allow navigation between questions', () => {
      // Answer first question
      cy.get('[data-cy=question-0]').within(() => {
        cy.get('[data-cy=option-1]').click()
      })

      // Navigate to next question
      cy.get('[data-cy=next-question-button]').click()

      // Verify second question is displayed
      cy.get('[data-cy=question-1]').should('be.visible')
      cy.get('[data-cy=question-0]').should('not.be.visible')

      // Navigate back to first question
      cy.get('[data-cy=previous-question-button]').click()

      // Verify first question is displayed again
      cy.get('[data-cy=question-0]').should('be.visible')
      cy.get('[data-cy=question-1]').should('not.be.visible')

      // Verify answer is still selected
      cy.get('[data-cy=question-0]').within(() => {
        cy.get('[data-cy=option-1]').should('have.class', 'selected')
      })
    })
  })

  describe('TC_AUTO_004: Career Recommendation Engine Test', () => {
    beforeEach(() => {
      cy.login()
      cy.navigateToCareerAssessment()
      cy.completeQuiz()
    })

    it('should generate relevant career recommendations based on quiz results', () => {
      // Wait for recommendations to load
      cy.get('[data-cy=recommendations-container]').should('be.visible')

      // Verify recommendations are displayed
      cy.get('[data-cy=career-recommendation]').should('have.length.at.least', 1)

      // Verify recommendation details
      cy.get('[data-cy=career-recommendation]').first().within(() => {
        cy.get('[data-cy=career-name]').should('be.visible')
        cy.get('[data-cy=career-description]').should('be.visible')
        cy.get('[data-cy=match-percentage]').should('be.visible')
        cy.get('[data-cy=skill-fit]').should('be.visible')
        cy.get('[data-cy=personality-fit]').should('be.visible')
      })
    })

    it('should rank recommendations by relevance score', () => {
      // Get all recommendations
      cy.get('[data-cy=career-recommendation]').then(($recommendations) => {
        const recommendations = $recommendations.toArray()
        
        // Verify recommendations are sorted by score (highest first)
        for (let i = 0; i < recommendations.length - 1; i++) {
          const currentScore = parseInt(recommendations[i].querySelector('[data-cy=match-percentage]').textContent)
          const nextScore = parseInt(recommendations[i + 1].querySelector('[data-cy=match-percentage]').textContent)
          
          expect(currentScore).to.be.at.least(nextScore)
        }
      })
    })

    it('should include missing skills analysis', () => {
      // Click on first recommendation
      cy.get('[data-cy=career-recommendation]').first().click()

      // Verify missing skills are displayed
      cy.get('[data-cy=missing-skills]').should('be.visible')
      cy.get('[data-cy=missing-skill-item]').should('have.length.at.least', 1)

      // Verify skill details
      cy.get('[data-cy=missing-skill-item]').first().within(() => {
        cy.get('[data-cy=skill-name]').should('be.visible')
        cy.get('[data-cy=current-level]').should('be.visible')
        cy.get('[data-cy=required-level]').should('be.visible')
        cy.get('[data-cy=importance]').should('be.visible')
      })
    })

    it('should allow users to explore career details', () => {
      // Click on first recommendation
      cy.get('[data-cy=career-recommendation]').first().click()

      // Verify career details page
      cy.get('[data-cy=career-details]').should('be.visible')
      cy.get('[data-cy=career-roadmap]').should('be.visible')
      cy.get('[data-cy=required-skills]').should('be.visible')
      cy.get('[data-cy=salary-info]').should('be.visible')
      cy.get('[data-cy=job-growth]').should('be.visible')
    })
  })

  describe('TC_AUTO_005: Skills Rating System Test', () => {
    beforeEach(() => {
      cy.login()
      cy.navigateToCareerAssessment()
    })

    it('should allow users to rate technical skills', () => {
      // Navigate to skills assessment
      cy.get('[data-cy=skills-tab]').click()

      // Wait for skills to load
      cy.get('[data-cy=skills-container]').should('be.visible')

      // Rate JavaScript
      cy.get('[data-cy=skill-javascript]').within(() => {
        cy.get('[data-cy=level-3]').click()
      })

      // Rate HTML
      cy.get('[data-cy=skill-html]').within(() => {
        cy.get('[data-cy=level-2]').click()
      })

      // Rate CSS
      cy.get('[data-cy=skill-css]').within(() => {
        cy.get('[data-cy=level-2]').click()
      })

      // Save skills
      cy.get('[data-cy=save-skills-button]').click()

      // Wait for save API call
      cy.waitForApi('POST', '/skills/rate')

      // Verify save confirmation
      cy.get('[data-cy=skills-saved-message]').should('be.visible')
      cy.get('[data-cy=skills-saved-message]').should('contain', 'Skills saved successfully')
    })

    it('should allow users to rate personal qualities', () => {
      // Navigate to personal qualities section
      cy.get('[data-cy=personal-qualities-tab]').click()

      // Wait for qualities to load
      cy.get('[data-cy=qualities-container]').should('be.visible')

      // Rate communication
      cy.get('[data-cy=quality-communication]').within(() => {
        cy.get('[data-cy=level-4]').click()
      })

      // Rate leadership
      cy.get('[data-cy=quality-leadership]').within(() => {
        cy.get('[data-cy=level-3]').click()
      })

      // Rate problem solving
      cy.get('[data-cy=quality-problem-solving]').within(() => {
        cy.get('[data-cy=level-5]').click()
      })

      // Save qualities
      cy.get('[data-cy=save-qualities-button]').click()

      // Wait for save API call
      cy.waitForApi('POST', '/skills/rate')

      // Verify save confirmation
      cy.get('[data-cy=qualities-saved-message]').should('be.visible')
    })

    it('should validate skill level ranges', () => {
      // Navigate to skills assessment
      cy.get('[data-cy=skills-tab]').click()

      // Verify only valid levels (1-5) are available
      cy.get('[data-cy=skill-javascript]').within(() => {
        cy.get('[data-cy=level-1]').should('be.visible')
        cy.get('[data-cy=level-2]').should('be.visible')
        cy.get('[data-cy=level-3]').should('be.visible')
        cy.get('[data-cy=level-4]').should('be.visible')
        cy.get('[data-cy=level-5]').should('be.visible')
        
        // Verify invalid levels don't exist
        cy.get('[data-cy=level-0]').should('not.exist')
        cy.get('[data-cy=level-6]').should('not.exist')
      })
    })

    it('should update existing skills ratings', () => {
      // Navigate to skills assessment
      cy.get('[data-cy=skills-tab]').click()

      // Rate JavaScript initially
      cy.get('[data-cy=skill-javascript]').within(() => {
        cy.get('[data-cy=level-2]').click()
      })

      // Save initial rating
      cy.get('[data-cy=save-skills-button]').click()
      cy.waitForApi('POST', '/skills/rate')

      // Update rating
      cy.get('[data-cy=skill-javascript]').within(() => {
        cy.get('[data-cy=level-4]').click()
      })

      // Save updated rating
      cy.get('[data-cy=save-skills-button]').click()
      cy.waitForApi('POST', '/skills/rate')

      // Verify updated rating is saved
      cy.get('[data-cy=skill-javascript]').within(() => {
        cy.get('[data-cy=level-4]').should('have.class', 'selected')
        cy.get('[data-cy=level-2]').should('not.have.class', 'selected')
      })
    })

    it('should show skill assessment progress', () => {
      // Navigate to skills assessment
      cy.get('[data-cy=skills-tab]').click()

      // Verify progress indicator
      cy.get('[data-cy=skills-progress]').should('be.visible')
      cy.get('[data-cy=progress-bar]').should('be.visible')

      // Rate some skills
      cy.get('[data-cy=skill-javascript]').within(() => {
        cy.get('[data-cy=level-3]').click()
      })

      // Verify progress updates
      cy.get('[data-cy=progress-percentage]').should('contain', '25') // 1 out of 4 skills rated
    })
  })

  describe('Cross-Module Integration', () => {
    it('should complete full career assessment workflow', () => {
      // Login
      cy.login()

      // Navigate to career assessment
      cy.navigateToCareerAssessment()

      // Complete quiz
      cy.completeQuiz()

      // Rate skills
      cy.rateSkills()

      // Verify recommendations are generated
      cy.get('[data-cy=recommendations-container]').should('be.visible')
      cy.get('[data-cy=career-recommendation]').should('have.length.at.least', 1)

      // Select a career path
      cy.get('[data-cy=career-recommendation]').first().click()
      cy.get('[data-cy=career-details]').should('be.visible')

      // Verify user can proceed to learning path
      cy.get('[data-cy=start-learning-button]').should('be.visible')
      cy.get('[data-cy=start-learning-button]').click()

      // Verify navigation to learning path
      cy.url().should('include', '/learning-journey')
    })
  })
})
