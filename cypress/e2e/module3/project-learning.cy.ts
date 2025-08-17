// cypress/e2e/module3/project-learning.cy.ts
// Module 3: Project-Based Learning System - End-to-End Tests

describe('Module 3: Project-Based Learning System', () => {
  beforeEach(() => {
    cy.clearTestData()
    cy.createTestUser()
  })

  describe('TC_AUTO_009: Skill Prerequisite Validation Test', () => {
    beforeEach(() => {
      cy.login()
    })

    it('should allow access to projects when prerequisites are met', () => {
      // Navigate to projects page
      cy.visit('/projects')
      cy.get('[data-cy=projects-page]').should('be.visible')

      // Wait for projects to load
      cy.waitForApi('GET', '/projects/available')

      // Verify available projects are displayed
      cy.get('[data-cy=project-card]').should('have.length.at.least', 1)

      // Verify project details
      cy.get('[data-cy=project-card]').first().within(() => {
        cy.get('[data-cy=project-title]').should('be.visible')
        cy.get('[data-cy=project-description]').should('be.visible')
        cy.get('[data-cy=project-difficulty]').should('be.visible')
        cy.get('[data-cy=project-requirements]').should('be.visible')
      })
    })

    it('should block access to projects when prerequisites are not met', () => {
      // Navigate to projects page
      cy.visit('/projects')
      cy.waitForApi('GET', '/projects/available')

      // Look for advanced projects that require higher skills
      cy.get('[data-cy=project-card]').each(($project) => {
        cy.wrap($project).within(() => {
          cy.get('[data-cy=project-difficulty]').then(($difficulty) => {
            if ($difficulty.text().includes('Advanced')) {
              // Advanced projects should show prerequisite warning
              cy.get('[data-cy=prerequisite-warning]').should('be.visible')
              cy.get('[data-cy=start-project-button]').should('be.disabled')
            }
          })
        })
      })
    })

    it('should grant access after completing required skill modules', () => {
      // Navigate to projects page
      cy.visit('/projects')
      cy.waitForApi('GET', '/projects/available')

      // Find a project that requires specific skills
      cy.get('[data-cy=project-card]').first().within(() => {
        cy.get('[data-cy=project-title]').invoke('text').then((projectTitle) => {
          // Note the project title for later verification
          cy.wrap(projectTitle).as('projectTitle')
        })
      })

      // Navigate to skills assessment to improve skills
      cy.visit('/career-assessment')
      cy.get('[data-cy=skills-tab]').click()

      // Improve JavaScript skills to level 4
      cy.get('[data-cy=skill-javascript]').within(() => {
        cy.get('[data-cy=level-4]').click()
      })

      // Save skills
      cy.get('[data-cy=save-skills-button]').click()
      cy.waitForApi('POST', '/skills/rate')

      // Return to projects page
      cy.visit('/projects')
      cy.waitForApi('GET', '/projects/available')

      // Verify the project is now accessible
      cy.get('[data-cy=project-card]').first().within(() => {
        cy.get('[data-cy=start-project-button]').should('not.be.disabled')
      })
    })

    it('should show prerequisite requirements clearly', () => {
      // Navigate to projects page
      cy.visit('/projects')
      cy.waitForApi('GET', '/projects/available')

      // Click on a project to see details
      cy.get('[data-cy=project-card]').first().click()

      // Verify prerequisite requirements are displayed
      cy.get('[data-cy=prerequisites-section]').should('be.visible')
      cy.get('[data-cy=required-skill]').should('have.length.at.least', 1)

      // Verify skill requirements details
      cy.get('[data-cy=required-skill]').first().within(() => {
        cy.get('[data-cy=skill-name]').should('be.visible')
        cy.get('[data-cy=required-level]').should('be.visible')
        cy.get('[data-cy=current-level]').should('be.visible')
        cy.get('[data-cy=skill-status]').should('be.visible')
      })
    })
  })

  describe('TC_AUTO_010: Project Assignment Logic Test', () => {
    beforeEach(() => {
      cy.login()
    })

    it('should assign projects based on completed skill levels', () => {
      // Navigate to projects page
      cy.visit('/projects')
      cy.waitForApi('GET', '/projects/assigned')

      // Verify assigned projects are displayed
      cy.get('[data-cy=assigned-project]').should('have.length.at.least', 1)

      // Verify project assignment details
      cy.get('[data-cy=assigned-project]').first().within(() => {
        cy.get('[data-cy=project-title]').should('be.visible')
        cy.get('[data-cy=assignment-reason]').should('be.visible')
        cy.get('[data-cy=skill-match]').should('be.visible')
      })
    })

    it('should assign projects with appropriate challenge level', () => {
      // Navigate to projects page
      cy.visit('/projects')
      cy.waitForApi('GET', '/projects/assigned')

      // Verify assigned projects match user's skill level
      cy.get('[data-cy=assigned-project]').each(($project) => {
        cy.wrap($project).within(() => {
          cy.get('[data-cy=project-difficulty]').then(($difficulty) => {
            const difficulty = $difficulty.text().toLowerCase()
            
            // Should not assign advanced projects to beginners
            if (difficulty.includes('advanced')) {
              cy.get('[data-cy=skill-match]').should('contain', 'High')
            }
          })
        })
      })
    })

    it('should verify assigned project matches skill level', () => {
      // Navigate to projects page
      cy.visit('/projects')
      cy.waitForApi('GET', '/projects/assigned')

      // Click on assigned project
      cy.get('[data-cy=assigned-project]').first().click()

      // Verify project details match user skills
      cy.get('[data-cy=project-requirements]').within(() => {
        cy.get('[data-cy=required-skill]').each(($skill) => {
          cy.wrap($skill).within(() => {
            cy.get('[data-cy=skill-status]').should('contain', 'Met')
          })
        })
      })
    })

    it('should suggest skill improvements for better project access', () => {
      // Navigate to projects page
      cy.visit('/projects')
      cy.waitForApi('GET', '/projects/available')

      // Look for projects with unmet prerequisites
      cy.get('[data-cy=project-card]').each(($project) => {
        cy.wrap($project).within(() => {
          cy.get('[data-cy=prerequisite-warning]').then(($warning) => {
            if ($warning.length > 0) {
              // Click on improvement suggestions
              cy.get('[data-cy=improvement-suggestions]').click()
              
              // Verify skill improvement suggestions
              cy.get('[data-cy=skill-suggestion]').should('be.visible')
              cy.get('[data-cy=learning-path-link]').should('be.visible')
            }
          })
        })
      })
    })
  })

  describe('TC_AUTO_011: Project Submission Workflow Test', () => {
    beforeEach(() => {
      cy.login()
      cy.visit('/projects')
      cy.waitForApi('GET', '/projects/available')
    })

    it('should complete project submission and review process', () => {
      // Select an available project
      cy.get('[data-cy=project-card]').first().click()

      // Start the project
      cy.get('[data-cy=start-project-button]').click()

      // Verify project workspace is loaded
      cy.get('[data-cy=project-workspace]').should('be.visible')
      cy.get('[data-cy=project-requirements]').should('be.visible')
      cy.get('[data-cy=submission-form]').should('be.visible')

      // Fill project submission form
      cy.get('[data-cy=project-url-input]').type('https://github.com/user/project')
      cy.get('[data-cy=project-description-input]').type('This is my project submission with all required features implemented.')
      cy.get('[data-cy=project-notes-input]').type('Additional notes about the implementation and challenges faced.')

      // Upload project files (if applicable)
      cy.get('[data-cy=file-upload-input]').attachFile('project-files.zip')

      // Submit project
      cy.get('[data-cy=submit-project-button]').click()

      // Wait for submission API call
      cy.waitForApi('POST', '/projects/submit')

      // Verify submission confirmation
      cy.get('[data-cy=submission-confirmation]').should('be.visible')
      cy.get('[data-cy=submission-id]').should('be.visible')
      cy.get('[data-cy=mentor-assignment]').should('be.visible')
    })

    it('should handle mentor feedback submission', () => {
      // Login as mentor
      cy.loginAsMentor()

      // Navigate to mentor submissions
      cy.visit('/mentor/submissions')
      cy.get('[data-cy=mentor-submissions-page]').should('be.visible')

      // Wait for submissions to load
      cy.waitForApi('GET', '/projects/mentor/submissions')

      // Click on first submission
      cy.get('[data-cy=submission-item]').first().click()

      // Verify submission details
      cy.get('[data-cy=submission-details]').should('be.visible')
      cy.get('[data-cy=project-url]').should('be.visible')
      cy.get('[data-cy=project-description]').should('be.visible')

      // Provide feedback
      cy.get('[data-cy=feedback-score-input]').type('85')
      cy.get('[data-cy=feedback-text-input]').type('Excellent work! The project demonstrates good understanding of the concepts. Consider adding more error handling.')
      cy.get('[data-cy=feedback-status-select]').select('approved')

      // Add suggestions
      cy.get('[data-cy=suggestion-input]').type('Add input validation')
      cy.get('[data-cy=add-suggestion-button]').click()
      cy.get('[data-cy=suggestion-input]').type('Improve UI design')
      cy.get('[data-cy=add-suggestion-button]').click()

      // Submit feedback
      cy.get('[data-cy=submit-feedback-button]').click()

      // Wait for feedback submission
      cy.waitForApi('POST', '/projects/feedback')

      // Verify feedback submission confirmation
      cy.get('[data-cy=feedback-submitted]').should('be.visible')
    })

    it('should test feedback mechanism for learners', () => {
      // Login as learner
      cy.login()

      // Navigate to project submissions
      cy.visit('/projects/submissions')
      cy.get('[data-cy=submissions-page]').should('be.visible')

      // Wait for submissions to load
      cy.waitForApi('GET', '/projects/submissions')

      // Click on submitted project
      cy.get('[data-cy=submission-item]').first().click()

      // Verify feedback is displayed
      cy.get('[data-cy=mentor-feedback]').should('be.visible')
      cy.get('[data-cy=feedback-score]').should('be.visible')
      cy.get('[data-cy=feedback-text]').should('be.visible')
      cy.get('[data-cy=feedback-status]').should('be.visible')
      cy.get('[data-cy=feedback-suggestions]').should('be.visible')

      // Verify feedback details
      cy.get('[data-cy=feedback-score]').should('contain', '85')
      cy.get('[data-cy=feedback-status]').should('contain', 'Approved')
    })

    it('should handle project revision requests', () => {
      // Login as mentor
      cy.loginAsMentor()

      // Navigate to mentor submissions
      cy.visit('/mentor/submissions')
      cy.waitForApi('GET', '/projects/mentor/submissions')

      // Click on a submission
      cy.get('[data-cy=submission-item]').first().click()

      // Request revision
      cy.get('[data-cy=feedback-status-select]').select('revision_requested')
      cy.get('[data-cy=revision-notes-input]').type('Please add the missing features and improve the documentation.')
      cy.get('[data-cy=submit-feedback-button]').click()

      cy.waitForApi('POST', '/projects/feedback')

      // Login as learner to see revision request
      cy.login()

      // Navigate to submissions
      cy.visit('/projects/submissions')
      cy.waitForApi('GET', '/projects/submissions')

      // Verify revision request
      cy.get('[data-cy=submission-item]').first().within(() => {
        cy.get('[data-cy=revision-requested]').should('be.visible')
        cy.get('[data-cy=revision-notes]').should('be.visible')
        cy.get('[data-cy=resubmit-button]').should('be.visible')
      })
    })
  })

  describe('TC_AUTO_012: Mentor Integration Test', () => {
    beforeEach(() => {
      cy.loginAsMentor()
    })

    it('should assign mentor and enable communication system', () => {
      // Navigate to mentor dashboard
      cy.visit('/mentor/dashboard')
      cy.get('[data-cy=mentor-dashboard]').should('be.visible')

      // Verify assigned submissions
      cy.get('[data-cy=assigned-submissions]').should('be.visible')
      cy.get('[data-cy=submission-item]').should('have.length.at.least', 1)

      // Click on assigned submission
      cy.get('[data-cy=submission-item]').first().click()

      // Verify submission details and communication options
      cy.get('[data-cy=submission-details]').should('be.visible')
      cy.get('[data-cy=learner-info]').should('be.visible')
      cy.get('[data-cy=communication-tools]').should('be.visible')
    })

    it('should test mentor feedback submission', () => {
      // Navigate to mentor submissions
      cy.visit('/mentor/submissions')
      cy.waitForApi('GET', '/projects/mentor/submissions')

      // Click on a submission
      cy.get('[data-cy=submission-item]').first().click()

      // Fill comprehensive feedback
      cy.get('[data-cy=feedback-score-input]').type('92')
      cy.get('[data-cy=feedback-text-input]').type('Outstanding work! The project demonstrates excellent technical skills and attention to detail. The code is well-structured and follows best practices.')
      cy.get('[data-cy=feedback-status-select]').select('approved')

      // Add detailed suggestions
      cy.get('[data-cy=suggestion-input]').type('Consider adding unit tests')
      cy.get('[data-cy=add-suggestion-button]').click()
      cy.get('[data-cy=suggestion-input]').type('Implement error handling for edge cases')
      cy.get('[data-cy=add-suggestion-button]').click()

      // Submit feedback
      cy.get('[data-cy=submit-feedback-button]').click()
      cy.waitForApi('POST', '/projects/feedback')

      // Verify feedback is properly stored
      cy.get('[data-cy=feedback-submitted]').should('be.visible')
      cy.get('[data-cy=feedback-id]').should('be.visible')
    })

    it('should enable communication between learners and mentors', () => {
      // Navigate to mentor submissions
      cy.visit('/mentor/submissions')
      cy.waitForApi('GET', '/projects/mentor/submissions')

      // Click on a submission
      cy.get('[data-cy=submission-item]').first().click()

      // Send message to learner
      cy.get('[data-cy=message-input]').type('Great work on the project! I have a few questions about your implementation approach.')
      cy.get('[data-cy=send-message-button]').click()

      cy.waitForApi('POST', '/projects/message')

      // Verify message is sent
      cy.get('[data-cy=message-sent]').should('be.visible')

      // Check message history
      cy.get('[data-cy=message-history]').should('be.visible')
      cy.get('[data-cy=message-item]').should('have.length.at.least', 1)
    })

    it('should handle mentor availability and scheduling', () => {
      // Navigate to mentor dashboard
      cy.visit('/mentor/dashboard')

      // Set availability
      cy.get('[data-cy=availability-settings]').click()
      cy.get('[data-cy=available-days]').check(['Monday', 'Wednesday', 'Friday'])
      cy.get('[data-cy=available-hours]').select('9:00 AM - 5:00 PM')
      cy.get('[data-cy=save-availability-button]').click()

      cy.waitForApi('POST', '/mentor/availability')

      // Verify availability is saved
      cy.get('[data-cy=availability-saved]').should('be.visible')

      // Check mentor profile shows availability
      cy.get('[data-cy=mentor-profile]').within(() => {
        cy.get('[data-cy=availability-status]').should('contain', 'Available')
        cy.get('[data-cy=next-available]').should('be.visible')
      })
    })

    it('should track mentor performance metrics', () => {
      // Navigate to mentor analytics
      cy.visit('/mentor/analytics')
      cy.get('[data-cy=mentor-analytics]').should('be.visible')

      // Wait for analytics data
      cy.waitForApi('GET', '/mentor/analytics')

      // Verify performance metrics
      cy.get('[data-cy=performance-metrics]').within(() => {
        cy.get('[data-cy=total-submissions]').should('be.visible')
        cy.get('[data-cy=average-feedback-time]').should('be.visible')
        cy.get('[data-cy=learner-satisfaction]').should('be.visible')
        cy.get('[data-cy=completion-rate]').should('be.visible')
      })

      // Verify feedback history
      cy.get('[data-cy=feedback-history]').should('be.visible')
      cy.get('[data-cy=feedback-chart]').should('be.visible')
    })
  })

  describe('Cross-Module Integration', () => {
    it('should complete full project-based learning workflow', () => {
      // Login as learner
      cy.login()

      // Complete skill assessment first
      cy.visit('/career-assessment')
      cy.rateSkills()

      // Navigate to projects
      cy.visit('/projects')
      cy.waitForApi('GET', '/projects/available')

      // Select and start a project
      cy.get('[data-cy=project-card]').first().click()
      cy.get('[data-cy=start-project-button]').click()

      // Work on project (simulate project work)
      cy.get('[data-cy=project-workspace]').should('be.visible')

      // Submit project
      cy.submitProject()

      // Login as mentor to review
      cy.loginAsMentor()

      // Review and provide feedback
      cy.provideMentorFeedback()

      // Login as learner to see feedback
      cy.login()

      // Check feedback
      cy.visit('/projects/submissions')
      cy.waitForApi('GET', '/projects/submissions')

      cy.get('[data-cy=submission-item]').first().click()
      cy.get('[data-cy=mentor-feedback]').should('be.visible')
      cy.get('[data-cy=feedback-score]').should('be.visible')
    })

    it('should handle project lifecycle management', () => {
      // Login as learner
      cy.login()

      // Start multiple projects
      cy.visit('/projects')
      cy.waitForApi('GET', '/projects/available')

      // Start first project
      cy.get('[data-cy=project-card]').eq(0).click()
      cy.get('[data-cy=start-project-button]').click()
      cy.get('[data-cy=project-workspace]').should('be.visible')

      // Navigate back to projects
      cy.visit('/projects')

      // Start second project
      cy.get('[data-cy=project-card]').eq(1).click()
      cy.get('[data-cy=start-project-button]').click()
      cy.get('[data-cy=project-workspace]').should('be.visible')

      // Check project dashboard
      cy.visit('/projects/dashboard')
      cy.get('[data-cy=active-projects]').should('be.visible')
      cy.get('[data-cy=project-item]').should('have.length', 2)

      // Submit one project
      cy.get('[data-cy=project-item]').first().click()
      cy.submitProject()

      // Verify project status updates
      cy.visit('/projects/dashboard')
      cy.get('[data-cy=submitted-projects]').should('contain', '1')
      cy.get('[data-cy=active-projects]').should('contain', '1')
    })
  })
})
