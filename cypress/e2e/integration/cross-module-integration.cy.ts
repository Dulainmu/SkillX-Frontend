// cypress/e2e/integration/cross-module-integration.cy.ts
// Cross-Module Integration - End-to-End Tests

describe('Cross-Module Integration Tests', () => {
  beforeEach(() => {
    cy.clearTestData()
    cy.createTestUser()
  })

  describe('TC_INT_001: Complete User Journey Test', () => {
    it('should complete entire user experience from registration to project completion', () => {
      // Step 1: User Registration
      cy.visit('/signup')
      cy.get('[data-cy=signup-page]').should('be.visible')

      const testEmail = `test${Date.now()}@example.com`
      cy.get('[data-cy=signup-form]').within(() => {
        cy.get('[data-cy=email-input]').type(testEmail)
        cy.get('[data-cy=password-input]').type('password123')
        cy.get('[data-cy=firstName-input]').type('Test')
        cy.get('[data-cy=lastName-input]').type('User')
        cy.get('[data-cy=role-select]').select('learner')
        cy.get('[data-cy=signup-button]').click()
      })

      cy.waitForApi('POST', '/auth/register')

      // Step 2: Complete Career Assessment
      cy.visit('/career-assessment')
      cy.get('[data-cy=career-assessment-page]').should('be.visible')

      // Complete quiz
      cy.completeQuiz()

      // Rate skills
      cy.rateSkills()

      // Step 3: Get Career Recommendations
      cy.get('[data-cy=recommendations-container]').should('be.visible')
      cy.get('[data-cy=career-recommendation]').should('have.length.at.least', 1)

      // Select a career path
      cy.get('[data-cy=career-recommendation]').first().click()
      cy.get('[data-cy=career-details]').should('be.visible')

      // Step 4: Start Learning Journey
      cy.get('[data-cy=start-learning-button]').click()
      cy.url().should('include', '/learning-journey')

      // Complete first learning step
      cy.get('[data-cy=roadmap-step]').first().within(() => {
        cy.get('[data-cy=start-step-button]').click()
      })

      // Access and complete learning materials
      cy.accessLearningMaterials()
      cy.get('[data-cy=material-item]').each(($material) => {
        cy.wrap($material).within(() => {
          cy.get('[data-cy=mark-completed-button]').click()
        })
      })

      // Mark step as completed
      cy.get('[data-cy=complete-step-button]').click()
      cy.waitForApi('POST', '/progress/career-steps')

      // Step 5: Access Projects
      cy.visit('/projects')
      cy.get('[data-cy=projects-page]').should('be.visible')
      cy.waitForApi('GET', '/projects/available')

      // Select and start a project
      cy.get('[data-cy=project-card]').first().click()
      cy.get('[data-cy=start-project-button]').click()

      // Step 6: Submit Project
      cy.submitProject()

      // Step 7: Mentor Review (as mentor)
      cy.loginAsMentor()
      cy.visit('/mentor/submissions')
      cy.waitForApi('GET', '/projects/mentor/submissions')

      cy.get('[data-cy=submission-item]').first().click()
      cy.provideMentorFeedback()

      // Step 8: Learner Receives Feedback
      cy.login()
      cy.visit('/projects/submissions')
      cy.waitForApi('GET', '/projects/submissions')

      cy.get('[data-cy=submission-item]').first().click()
      cy.get('[data-cy=mentor-feedback]').should('be.visible')
      cy.get('[data-cy=feedback-score]').should('be.visible')

      // Step 9: Verify Progress Tracking
      cy.visit('/dashboard')
      cy.get('[data-cy=progress-summary]').should('be.visible')
      cy.get('[data-cy=completed-projects]').should('contain', '1')
      cy.get('[data-cy=learning-progress]').should('contain', '25%') // 1 out of 4 steps
    })
  })

  describe('TC_INT_002: Data Consistency Test', () => {
    it('should maintain consistent data across all modules', () => {
      // Login and set up initial data
      cy.login()
      cy.visit('/career-assessment')
      cy.rateSkills()

      // Verify skills are saved
      cy.get('[data-cy=skills-saved-message]').should('be.visible')

      // Navigate to different modules and verify data consistency
      cy.visit('/dashboard')
      cy.get('[data-cy=user-skills]').should('contain', 'JavaScript')

      cy.visit('/careers')
      cy.get('[data-cy=career-card]').first().click()
      cy.get('[data-cy=skill-match]').should('contain', 'JavaScript')

      cy.visit('/projects')
      cy.waitForApi('GET', '/projects/available')
      cy.get('[data-cy=project-card]').first().click()
      cy.get('[data-cy=prerequisites-section]').should('contain', 'JavaScript')

      // Update skills in one module
      cy.visit('/career-assessment')
      cy.get('[data-cy=skills-tab]').click()
      cy.get('[data-cy=skill-javascript]').within(() => {
        cy.get('[data-cy=level-4]').click()
      })
      cy.get('[data-cy=save-skills-button]').click()
      cy.waitForApi('POST', '/skills/rate')

      // Verify update is reflected across modules
      cy.visit('/dashboard')
      cy.get('[data-cy=user-skills]').should('contain', 'Level 4')

      cy.visit('/projects')
      cy.waitForApi('GET', '/projects/available')
      cy.get('[data-cy=project-card]').each(($project) => {
        cy.wrap($project).within(() => {
          cy.get('[data-cy=skill-match]').should('contain', 'Level 4')
        })
      })
    })

    it('should handle user profile updates across modules', () => {
      // Login and update profile
      cy.login()
      cy.visit('/profile')
      cy.get('[data-cy=profile-page]').should('be.visible')

      // Update profile information
      cy.get('[data-cy=edit-profile-button]').click()
      cy.get('[data-cy=profile-form]').within(() => {
        cy.get('[data-cy=firstName-input]').clear().type('Updated')
        cy.get('[data-cy=lastName-input]').clear().type('Name')
        cy.get('[data-cy=save-profile-button]').click()
      })

      cy.waitForApi('PUT', '/users/profile')

      // Verify profile update is reflected across modules
      cy.visit('/dashboard')
      cy.get('[data-cy=welcome-message]').should('contain', 'Updated Name')

      cy.visit('/projects/submissions')
      cy.waitForApi('GET', '/projects/submissions')
      cy.get('[data-cy=user-info]').should('contain', 'Updated Name')

      // Login as mentor and verify learner info is updated
      cy.loginAsMentor()
      cy.visit('/mentor/submissions')
      cy.waitForApi('GET', '/projects/mentor/submissions')
      cy.get('[data-cy=learner-info]').should('contain', 'Updated Name')
    })
  })

  describe('TC_INT_003: Role-Based Access Test', () => {
    it('should enforce proper role-based access control across modules', () => {
      // Test learner access limitations
      cy.login()
      
      // Try to access admin features
      cy.visit('/admin/dashboard')
      cy.url().should('include', '/unauthorized')

      cy.visit('/admin/career-paths')
      cy.url().should('include', '/unauthorized')

      cy.visit('/admin/users')
      cy.url().should('include', '/unauthorized')

      // Try to access mentor features
      cy.visit('/mentor/dashboard')
      cy.url().should('include', '/unauthorized')

      cy.visit('/mentor/submissions')
      cy.url().should('include', '/unauthorized')

      // Verify learner can access appropriate features
      cy.visit('/dashboard')
      cy.get('[data-cy=learner-dashboard]').should('be.visible')

      cy.visit('/careers')
      cy.get('[data-cy=careers-page]').should('be.visible')

      cy.visit('/projects')
      cy.get('[data-cy=projects-page]').should('be.visible')
    })

    it('should verify admin privileges work correctly', () => {
      // Test admin access
      cy.loginAsAdmin()

      // Verify admin can access all admin features
      cy.visit('/admin/dashboard')
      cy.get('[data-cy=admin-dashboard]').should('be.visible')

      cy.visit('/admin/career-paths')
      cy.get('[data-cy=admin-career-paths]').should('be.visible')

      cy.visit('/admin/users')
      cy.get('[data-cy=admin-users]').should('be.visible')

      cy.visit('/admin/analytics')
      cy.get('[data-cy=admin-analytics]').should('be.visible')

      // Verify admin can also access learner features
      cy.visit('/dashboard')
      cy.get('[data-cy=dashboard]').should('be.visible')

      cy.visit('/careers')
      cy.get('[data-cy=careers-page]').should('be.visible')
    })

    it('should verify mentor permissions and restrictions', () => {
      // Test mentor access
      cy.loginAsMentor()

      // Verify mentor can access mentor features
      cy.visit('/mentor/dashboard')
      cy.get('[data-cy=mentor-dashboard]').should('be.visible')

      cy.visit('/mentor/submissions')
      cy.get('[data-cy=mentor-submissions]').should('be.visible')

      // Verify mentor cannot access admin features
      cy.visit('/admin/dashboard')
      cy.url().should('include', '/unauthorized')

      cy.visit('/admin/career-paths')
      cy.url().should('include', '/unauthorized')

      // Verify mentor can access learner features
      cy.visit('/dashboard')
      cy.get('[data-cy=dashboard]').should('be.visible')

      cy.visit('/careers')
      cy.get('[data-cy=careers-page]').should('be.visible')
    })

    it('should handle role transitions properly', () => {
      // Login as admin
      cy.loginAsAdmin()

      // Change user role
      cy.visit('/admin/users')
      cy.waitForApi('GET', '/admin/users')

      cy.get('[data-cy=user-item]').first().click()
      cy.get('[data-cy=edit-user-button]').click()
      cy.get('[data-cy=role-select]').select('mentor')
      cy.get('[data-cy=save-user-button]').click()

      cy.waitForApi('PUT', '/admin/users')

      // Login as the user with changed role
      cy.login()

      // Verify new role permissions
      cy.visit('/mentor/dashboard')
      cy.get('[data-cy=mentor-dashboard]').should('be.visible')

      cy.visit('/mentor/submissions')
      cy.get('[data-cy=mentor-submissions]').should('be.visible')

      // Verify admin features are still restricted
      cy.visit('/admin/dashboard')
      cy.url().should('include', '/unauthorized')
    })
  })

  describe('TC_INT_004: End-to-End Workflow Test', () => {
    it('should handle complete workflow with multiple users', () => {
      // Admin creates career path
      cy.loginAsAdmin()
      cy.visit('/admin/career-paths')

      cy.get('[data-cy=create-career-path-button]').click()
      cy.get('[data-cy=career-path-form]').within(() => {
        cy.get('[data-cy=name-input]').type('Integration Test Career')
        cy.get('[data-cy=description-input]').type('Career path for integration testing')
        cy.get('[data-cy=category-select]').select('Development')
        cy.get('[data-cy=is-active-checkbox]').check()
      })

      // Add skill and step
      cy.get('[data-cy=add-skill-button]').click()
      cy.get('[data-cy=skill-form]').within(() => {
        cy.get('[data-cy=skill-name-input]').type('Testing')
        cy.get('[data-cy=required-level-input]').type('3')
        cy.get('[data-cy=importance-select]').select('essential')
        cy.get('[data-cy=save-skill-button]').click()
      })

      cy.get('[data-cy=add-step-button]').click()
      cy.get('[data-cy=step-form]').within(() => {
        cy.get('[data-cy=step-title-input]').type('Learn Testing')
        cy.get('[data-cy=step-description-input]').type('Master testing fundamentals')
        cy.get('[data-cy=step-order-input]').type('1')
        cy.get('[data-cy=save-step-button]').click()
      })

      cy.get('[data-cy=submit-career-path-button]').click()
      cy.waitForApi('POST', '/admin/career-paths')

      // Learner discovers and follows career path
      cy.login()
      cy.visit('/careers')
      cy.get('[data-cy=career-card]').contains('Integration Test Career').click()

      // Complete assessment
      cy.visit('/career-assessment')
      cy.rateSkills()

      // Start learning journey
      cy.get('[data-cy=start-learning-button]').click()
      cy.get('[data-cy=roadmap-step]').first().within(() => {
        cy.get('[data-cy=start-step-button]').click()
      })

      // Complete materials
      cy.accessLearningMaterials()
      cy.get('[data-cy=material-item]').each(($material) => {
        cy.wrap($material).within(() => {
          cy.get('[data-cy=mark-completed-button]').click()
        })
      })

      cy.get('[data-cy=complete-step-button]').click()
      cy.waitForApi('POST', '/progress/career-steps')

      // Submit project
      cy.visit('/projects')
      cy.waitForApi('GET', '/projects/available')
      cy.get('[data-cy=project-card]').first().click()
      cy.submitProject()

      // Mentor reviews submission
      cy.loginAsMentor()
      cy.visit('/mentor/submissions')
      cy.waitForApi('GET', '/projects/mentor/submissions')
      cy.get('[data-cy=submission-item]').first().click()
      cy.provideMentorFeedback()

      // Learner receives feedback
      cy.login()
      cy.visit('/projects/submissions')
      cy.waitForApi('GET', '/projects/submissions')
      cy.get('[data-cy=submission-item]').first().click()
      cy.get('[data-cy=mentor-feedback]').should('be.visible')

      // Admin reviews analytics
      cy.loginAsAdmin()
      cy.visit('/admin/analytics')
      cy.get('[data-cy=admin-analytics]').should('be.visible')
      cy.get('[data-cy=user-engagement]').should('be.visible')
      cy.get('[data-cy=career-path-popularity]').should('contain', 'Integration Test Career')
    })

    it('should handle error scenarios gracefully', () => {
      // Test network error handling
      cy.intercept('GET', `${Cypress.env('apiUrl')}/careers`, {
        statusCode: 500,
        body: { message: 'Internal server error' }
      }).as('careersError')

      cy.login()
      cy.visit('/careers')
      cy.wait('@careersError')

      cy.get('[data-cy=error-message]').should('be.visible')
      cy.get('[data-cy=retry-button]').should('be.visible')

      // Test validation error handling
      cy.visit('/career-assessment')
      cy.get('[data-cy=skills-tab]').click()
      cy.get('[data-cy=save-skills-button]').click()

      cy.get('[data-cy=validation-message]').should('be.visible')

      // Test unauthorized access handling
      cy.visit('/admin/dashboard')
      cy.get('[data-cy=unauthorized-message]').should('be.visible')
      cy.get('[data-cy=back-to-home]').should('be.visible')
    })

    it('should maintain data integrity during concurrent operations', () => {
      // Login as multiple users
      cy.login()
      cy.visit('/career-assessment')
      cy.rateSkills()

      // Simulate concurrent access
      cy.window().then((win) => {
        // Store original fetch
        const originalFetch = win.fetch

        // Mock concurrent requests
        win.fetch = cy.stub().callsFake((url, options) => {
          if (url.includes('/skills/rate')) {
            // Simulate race condition
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(new Response(JSON.stringify({ success: true }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                }))
              }, Math.random() * 1000)
            })
          }
          return originalFetch(url, options)
        })
      })

      // Perform multiple skill updates
      cy.get('[data-cy=skill-javascript]').within(() => {
        cy.get('[data-cy=level-3]').click()
      })
      cy.get('[data-cy=save-skills-button]').click()

      cy.get('[data-cy=skill-javascript]').within(() => {
        cy.get('[data-cy=level-4]').click()
      })
      cy.get('[data-cy=save-skills-button]').click()

      // Verify final state is consistent
      cy.visit('/dashboard')
      cy.get('[data-cy=user-skills]').should('contain', 'Level 4')
    })
  })
})
