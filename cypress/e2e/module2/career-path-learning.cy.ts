// cypress/e2e/module2/career-path-learning.cy.ts
// Module 2: Career Path & Learning Materials - End-to-End Tests

describe('Module 2: Career Path & Learning Materials', () => {
  beforeEach(() => {
    cy.clearTestData()
    cy.createTestUser()
  })

  describe('TC_AUTO_006: Career Path Selection Test', () => {
    beforeEach(() => {
      cy.login()
    })

    it('should allow users to browse available career paths', () => {
      // Navigate to careers page
      cy.visit('/careers')
      cy.get('[data-cy=careers-page]').should('be.visible')

      // Wait for careers to load
      cy.waitForApi('GET', '/careers')

      // Verify career paths are displayed
      cy.get('[data-cy=career-card]').should('have.length.at.least', 1)

      // Verify career card details
      cy.get('[data-cy=career-card]').first().within(() => {
        cy.get('[data-cy=career-name]').should('be.visible')
        cy.get('[data-cy=career-description]').should('be.visible')
        cy.get('[data-cy=career-salary]').should('be.visible')
        cy.get('[data-cy=career-growth]').should('be.visible')
      })
    })

    it('should allow users to select a specific career path', () => {
      // Navigate to careers page
      cy.visit('/careers')
      cy.waitForApi('GET', '/careers')

      // Click on first career path
      cy.get('[data-cy=career-card]').first().click()

      // Verify career path details page
      cy.url().should('include', '/careers/')
      cy.get('[data-cy=career-details]').should('be.visible')
      cy.get('[data-cy=career-roadmap]').should('be.visible')
      cy.get('[data-cy=required-skills]').should('be.visible')
    })

    it('should load learning roadmap with proper structure', () => {
      // Navigate to specific career path
      cy.selectCareerPath('frontend-developer')

      // Verify roadmap structure
      cy.get('[data-cy=career-roadmap]').should('be.visible')
      cy.get('[data-cy=roadmap-step]').should('have.length.at.least', 1)

      // Verify roadmap step details
      cy.get('[data-cy=roadmap-step]').first().within(() => {
        cy.get('[data-cy=step-title]').should('be.visible')
        cy.get('[data-cy=step-description]').should('be.visible')
        cy.get('[data-cy=step-order]').should('be.visible')
        cy.get('[data-cy=step-materials]').should('be.visible')
      })
    })

    it('should handle non-existent career path gracefully', () => {
      // Try to access non-existent career path
      cy.visit('/careers/non-existent-path')

      // Wait for API call
      cy.waitForApi('GET', '/careers/non-existent-path')

      // Verify error message
      cy.get('[data-cy=error-message]').should('be.visible')
      cy.get('[data-cy=error-message]').should('contain', 'Career path not found')

      // Verify back to careers link
      cy.get('[data-cy=back-to-careers]').should('be.visible')
      cy.get('[data-cy=back-to-careers]').click()
      cy.url().should('include', '/careers')
    })

    it('should filter career paths by category', () => {
      // Navigate to careers page
      cy.visit('/careers')
      cy.waitForApi('GET', '/careers')

      // Click on frontend category filter
      cy.get('[data-cy=category-filter-frontend]').click()

      // Verify filtered results
      cy.get('[data-cy=career-card]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-cy=career-category]').should('contain', 'Frontend')
        })
      })
    })

    it('should search career paths by name', () => {
      // Navigate to careers page
      cy.visit('/careers')
      cy.waitForApi('GET', '/careers')

      // Search for "developer"
      cy.get('[data-cy=career-search-input]').type('developer')

      // Wait for search results
      cy.waitForApi('GET', '/careers?search=developer')

      // Verify search results
      cy.get('[data-cy=career-card]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-cy=career-name]').should('contain', 'Developer')
        })
      })
    })
  })

  describe('TC_AUTO_007: Learning Materials Access Test', () => {
    beforeEach(() => {
      cy.login()
      cy.selectCareerPath('frontend-developer')
    })

    it('should retrieve and display learning materials', () => {
      // Navigate to learning materials
      cy.get('[data-cy=learning-materials-tab]').click()

      // Wait for materials to load
      cy.waitForApi('GET', '/materials')

      // Verify materials are displayed
      cy.get('[data-cy=materials-list]').should('be.visible')
      cy.get('[data-cy=material-item]').should('have.length.at.least', 1)

      // Verify material details
      cy.get('[data-cy=material-item]').first().within(() => {
        cy.get('[data-cy=material-title]').should('be.visible')
        cy.get('[data-cy=material-description]').should('be.visible')
        cy.get('[data-cy=material-type]').should('be.visible')
        cy.get('[data-cy=material-duration]').should('be.visible')
        cy.get('[data-cy=material-difficulty]').should('be.visible')
      })
    })

    it('should filter materials by type', () => {
      // Navigate to learning materials
      cy.get('[data-cy=learning-materials-tab]').click()
      cy.waitForApi('GET', '/materials')

      // Filter by video type
      cy.get('[data-cy=type-filter-video]').click()

      // Wait for filtered results
      cy.waitForApi('GET', '/materials?type=video')

      // Verify all materials are videos
      cy.get('[data-cy=material-item]').each(($material) => {
        cy.wrap($material).within(() => {
          cy.get('[data-cy=material-type]').should('contain', 'video')
        })
      })
    })

    it('should filter materials by difficulty', () => {
      // Navigate to learning materials
      cy.get('[data-cy=learning-materials-tab]').click()
      cy.waitForApi('GET', '/materials')

      // Filter by beginner difficulty
      cy.get('[data-cy=difficulty-filter-beginner]').click()

      // Wait for filtered results
      cy.waitForApi('GET', '/materials?difficulty=beginner')

      // Verify all materials are beginner level
      cy.get('[data-cy=material-item]').each(($material) => {
        cy.wrap($material).within(() => {
          cy.get('[data-cy=material-difficulty]').should('contain', 'beginner')
        })
      })
    })

    it('should get specific material by ID', () => {
      // Navigate to learning materials
      cy.get('[data-cy=learning-materials-tab]').click()
      cy.waitForApi('GET', '/materials')

      // Click on first material
      cy.get('[data-cy=material-item]').first().click()

      // Verify material details page
      cy.url().should('include', '/materials/')
      cy.get('[data-cy=material-details]').should('be.visible')
      cy.get('[data-cy=material-content]').should('be.visible')
    })

    it('should handle different material types correctly', () => {
      // Navigate to learning materials
      cy.get('[data-cy=learning-materials-tab]').click()
      cy.waitForApi('GET', '/materials')

      // Test video material
      cy.get('[data-cy=material-type-video]').first().click()
      cy.get('[data-cy=video-player]').should('be.visible')
      cy.get('[data-cy=video-controls]').should('be.visible')

      // Go back to materials list
      cy.get('[data-cy=back-to-materials]').click()

      // Test document material
      cy.get('[data-cy=material-type-document]').first().click()
      cy.get('[data-cy=document-viewer]').should('be.visible')
      cy.get('[data-cy=document-download]').should('be.visible')

      // Go back to materials list
      cy.get('[data-cy=back-to-materials]').click()

      // Test link material
      cy.get('[data-cy=material-type-link]').first().click()
      cy.get('[data-cy=external-link]').should('be.visible')
      cy.get('[data-cy=link-description]').should('be.visible')
    })

    it('should track material completion', () => {
      // Navigate to learning materials
      cy.get('[data-cy=learning-materials-tab]').click()
      cy.waitForApi('GET', '/materials')

      // Click on first material
      cy.get('[data-cy=material-item]').first().click()

      // Mark material as completed
      cy.get('[data-cy=mark-completed-button]').click()

      // Wait for completion API call
      cy.waitForApi('POST', '/progress/materials')

      // Verify completion status
      cy.get('[data-cy=completion-status]').should('contain', 'Completed')
      cy.get('[data-cy=completion-date]').should('be.visible')
    })
  })

  describe('TC_AUTO_008: Progress Tracking Test', () => {
    beforeEach(() => {
      cy.login()
      cy.selectCareerPath('frontend-developer')
    })

    it('should track learner progress through materials', () => {
      // Navigate to progress tracking
      cy.get('[data-cy=progress-tab]').click()

      // Wait for progress data to load
      cy.waitForApi('GET', '/progress/summary')

      // Verify progress indicators
      cy.get('[data-cy=progress-summary]').should('be.visible')
      cy.get('[data-cy=total-materials]').should('be.visible')
      cy.get('[data-cy=completed-materials]').should('be.visible')
      cy.get('[data-cy=completion-percentage]').should('be.visible')
      cy.get('[data-cy=time-spent]').should('be.visible')
    })

    it('should track progress for career path steps', () => {
      // Navigate to career roadmap
      cy.get('[data-cy=career-roadmap]').should('be.visible')

      // Complete first step
      cy.get('[data-cy=roadmap-step]').first().within(() => {
        cy.get('[data-cy=start-step-button]').click()
      })

      // Navigate to step materials
      cy.get('[data-cy=step-materials]').first().click()

      // Complete step materials
      cy.get('[data-cy=material-item]').each(($material) => {
        cy.wrap($material).within(() => {
          cy.get('[data-cy=mark-completed-button]').click()
        })
      })

      // Mark step as completed
      cy.get('[data-cy=complete-step-button]').click()

      // Wait for step completion API call
      cy.waitForApi('POST', '/progress/career-steps')

      // Verify step completion
      cy.get('[data-cy=roadmap-step]').first().within(() => {
        cy.get('[data-cy=step-status]').should('contain', 'Completed')
        cy.get('[data-cy=step-progress]').should('contain', '100%')
      })
    })

    it('should display progress indicators correctly', () => {
      // Navigate to progress tracking
      cy.get('[data-cy=progress-tab]').click()
      cy.waitForApi('GET', '/progress/summary')

      // Verify progress bar
      cy.get('[data-cy=progress-bar]').should('be.visible')
      cy.get('[data-cy=progress-fill]').should('be.visible')

      // Verify progress statistics
      cy.get('[data-cy=progress-stats]').within(() => {
        cy.get('[data-cy=total-materials]').should('be.visible')
        cy.get('[data-cy=completed-materials]').should('be.visible')
        cy.get('[data-cy=in-progress-materials]').should('be.visible')
        cy.get('[data-cy=not-started-materials]').should('be.visible')
      })
    })

    it('should save progress when returning later', () => {
      // Start a material
      cy.get('[data-cy=learning-materials-tab]').click()
      cy.waitForApi('GET', '/materials')

      cy.get('[data-cy=material-item]').first().click()

      // Mark as in progress
      cy.get('[data-cy=start-material-button]').click()
      cy.waitForApi('POST', '/progress/materials')

      // Navigate away
      cy.visit('/dashboard')

      // Return to material
      cy.visit('/careers/frontend-developer')
      cy.get('[data-cy=learning-materials-tab]').click()

      // Verify progress is saved
      cy.get('[data-cy=material-item]').first().within(() => {
        cy.get('[data-cy=material-status]').should('contain', 'In Progress')
      })
    })

    it('should calculate overall career path progress', () => {
      // Navigate to career progress
      cy.get('[data-cy=career-progress-tab]').click()
      cy.waitForApi('GET', '/progress/career/frontend-developer')

      // Verify career progress details
      cy.get('[data-cy=career-progress]').within(() => {
        cy.get('[data-cy=total-steps]').should('be.visible')
        cy.get('[data-cy=completed-steps]').should('be.visible')
        cy.get('[data-cy=in-progress-steps]').should('be.visible')
        cy.get('[data-cy=completion-percentage]').should('be.visible')
        cy.get('[data-cy=estimated-completion]').should('be.visible')
      })

      // Verify step-by-step progress
      cy.get('[data-cy=step-progress-item]').each(($step) => {
        cy.wrap($step).within(() => {
          cy.get('[data-cy=step-name]').should('be.visible')
          cy.get('[data-cy=step-status]').should('be.visible')
          cy.get('[data-cy=step-progress]').should('be.visible')
        })
      })
    })

    it('should show learning analytics', () => {
      // Navigate to analytics
      cy.get('[data-cy=analytics-tab]').click()
      cy.waitForApi('GET', '/analytics/learning')

      // Verify analytics data
      cy.get('[data-cy=learning-analytics]').within(() => {
        cy.get('[data-cy=total-time-spent]').should('be.visible')
        cy.get('[data-cy=average-completion-time]').should('be.visible')
        cy.get('[data-cy=streak-days]').should('be.visible')
        cy.get('[data-cy=weekly-progress]').should('be.visible')
      })

      // Verify progress chart
      cy.get('[data-cy=progress-chart]').should('be.visible')
      cy.get('[data-cy=chart-container]').should('be.visible')
    })
  })

  describe('Cross-Module Integration', () => {
    it('should complete full learning journey workflow', () => {
      // Login and select career path
      cy.login()
      cy.selectCareerPath('frontend-developer')

      // Start learning journey
      cy.get('[data-cy=start-learning-button]').click()

      // Complete first step
      cy.get('[data-cy=roadmap-step]').first().within(() => {
        cy.get('[data-cy=start-step-button]').click()
      })

      // Access learning materials
      cy.accessLearningMaterials()

      // Complete materials
      cy.get('[data-cy=material-item]').each(($material) => {
        cy.wrap($material).within(() => {
          cy.get('[data-cy=mark-completed-button]').click()
        })
      })

      // Mark step as completed
      cy.get('[data-cy=complete-step-button]').click()

      // Verify progress updates
      cy.get('[data-cy=progress-summary]').should('contain', '25%') // 1 out of 4 steps

      // Continue to next step
      cy.get('[data-cy=next-step-button]').click()

      // Verify navigation to next step
      cy.get('[data-cy=roadmap-step]').eq(1).should('have.class', 'active')
    })

    it('should handle learning path navigation', () => {
      // Login and select career path
      cy.login()
      cy.selectCareerPath('frontend-developer')

      // Navigate through roadmap steps
      cy.get('[data-cy=roadmap-step]').each(($step, index) => {
        cy.wrap($step).within(() => {
          cy.get('[data-cy=step-title]').click()
        })

        // Verify step details are displayed
        cy.get('[data-cy=step-details]').should('be.visible')
        cy.get('[data-cy=step-materials]').should('be.visible')

        // Go back to roadmap
        cy.get('[data-cy=back-to-roadmap]').click()
      })
    })
  })
})
