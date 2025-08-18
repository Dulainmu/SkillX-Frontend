// cypress/e2e/integration/complete-test-suite.cy.ts
// Complete Test Suite - Runs all modules in sequence

describe('Complete SkillX Platform Test Suite', () => {
  beforeEach(() => {
    cy.clearTestData()
  })

  describe('Module 1: Career Assessment & Quiz System', () => {
    it('should complete full career assessment workflow', () => {
      // Login as test user
      cy.login()

      // Navigate to career assessment
      cy.navigateToCareerAssessment()

      // Complete quiz
      cy.completeQuiz()

      // Rate skills
      cy.rateSkills()

      // Verify results
      cy.get('[data-cy=career-recommendations]').should('be.visible')
      cy.get('[data-cy=recommendation-card]').should('have.length.at.least', 1)
    })
  })

  describe('Module 2: Career Path & Learning Materials', () => {
    it('should test career path selection and learning materials', () => {
      // Login as test user
      cy.login()

      // Browse career paths
      cy.visit('/browse-careers')
      cy.get('[data-cy=career-cards]').should('be.visible')

      // Select a career path
      cy.selectCareerPath('frontend-developer')

      // Access learning materials
      cy.accessLearningMaterials()

      // Verify progress tracking
      cy.get('[data-cy=progress-indicator]').should('be.visible')
    })
  })

  describe('Module 3: Project-Based Learning System', () => {
    it('should test project assignment and submission workflow', () => {
      // Login as test user
      cy.login()

      // Navigate to projects
      cy.visit('/dashboard/projects')
      cy.get('[data-cy=available-projects]').should('be.visible')

      // Submit a project
      cy.submitProject()

      // Verify submission
      cy.get('[data-cy=project-submitted-message]').should('be.visible')
    })
  })

  describe('Module 4: Admin - Career Path Management', () => {
    it('should test admin career path management', () => {
      // Login as admin
      cy.loginAsAdmin()

      // Navigate to career path management
      cy.visit('/admin/career-paths')
      cy.get('[data-cy=admin-career-paths]').should('be.visible')

      // Test CRUD operations
      cy.get('[data-cy=create-career-path-button]').click()
      cy.get('[data-cy=career-path-form]').should('be.visible')

      // Fill form
      cy.get('[data-cy=name-input]').type('Test Career Path')
      cy.get('[data-cy=description-input]').type('Test Description')
      cy.get('[data-cy=category-select]').select('Development')

      // Save
      cy.get('[data-cy=save-career-path-button]').click()
      cy.get('[data-cy=success-message]').should('contain', 'Career path created successfully')
    })
  })

  describe('Module 5: Admin - Learning Materials Management', () => {
    it('should test learning materials management', () => {
      // Login as admin
      cy.loginAsAdmin()

      // Navigate to learning materials management
      cy.visit('/admin/learning-materials')
      cy.get('[data-cy=admin-learning-materials]').should('be.visible')

      // Test CRUD operations
      cy.get('[data-cy=create-material-button]').click()
      cy.get('[data-cy=material-form]').should('be.visible')

      // Fill form
      cy.get('[data-cy=title-input]').type('Test Learning Material')
      cy.get('[data-cy=description-input]').type('Test Description')
      cy.get('[data-cy=type-select]').select('video')
      cy.get('[data-cy=difficulty-select]').select('beginner')

      // Save
      cy.get('[data-cy=save-material-button]').click()
      cy.get('[data-cy=success-message]').should('contain', 'Learning material created successfully')
    })
  })

  describe('Module 6: Admin - Project Management', () => {
    it('should test project management', () => {
      // Login as admin
      cy.loginAsAdmin()

      // Navigate to project management
      cy.visit('/admin/projects')
      cy.get('[data-cy=admin-projects]').should('be.visible')

      // Test CRUD operations
      cy.get('[data-cy=create-project-button]').click()
      cy.get('[data-cy=project-form]').should('be.visible')

      // Fill form
      cy.get('[data-cy=title-input]').type('Test Project')
      cy.get('[data-cy=description-input]').type('Test Description')
      cy.get('[data-cy=career-path-select]').select('Full Stack Developer')
      cy.get('[data-cy=difficulty-select]').select('intermediate')

      // Save
      cy.get('[data-cy=save-project-button]').click()
      cy.get('[data-cy=success-message]').should('contain', 'Project created successfully')
    })
  })

  describe('Integration Tests', () => {
    it('should test complete user journey from registration to project completion', () => {
      // Register new user
      cy.visit('/register')
      cy.get('[data-cy=register-form]').within(() => {
        cy.get('[data-cy=firstName-input]').type('Test')
        cy.get('[data-cy=lastName-input]').type('User')
        cy.get('[data-cy=email-input]').type('testuser@example.com')
        cy.get('[data-cy=password-input]').type('password123')
        cy.get('[data-cy=register-button]').click()
      })

      // Complete career assessment
      cy.navigateToCareerAssessment()
      cy.completeQuiz()
      cy.rateSkills()

      // Select career path
      cy.selectCareerPath('frontend-developer')

      // Access learning materials
      cy.accessLearningMaterials()

      // Submit project
      cy.submitProject()

      // Verify complete journey
      cy.get('[data-cy=user-dashboard]').should('be.visible')
      cy.get('[data-cy=progress-summary]').should('be.visible')
    })

    it('should test data consistency across modules', () => {
      // Login as admin and create test data
      cy.loginAsAdmin()
      cy.createTestLearningMaterial()
      cy.createTestProject()

      // Login as user and verify data is accessible
      cy.login()
      cy.visit('/dashboard')
      cy.get('[data-cy=learning-materials]').should('contain', 'Test Material')
      cy.get('[data-cy=available-projects]').should('contain', 'Test Project')
    })

    it('should test role-based access control', () => {
      // Test regular user cannot access admin features
      cy.login()
      cy.visit('/admin/dashboard')
      cy.url().should('include', '/unauthorized')

      // Test admin can access admin features
      cy.loginAsAdmin()
      cy.visit('/admin/dashboard')
      cy.get('[data-cy=admin-dashboard]').should('be.visible')
    })
  })

  describe('Performance Tests', () => {
    it('should test system performance under load', () => {
      // Create multiple test materials and projects
      cy.loginAsAdmin()
      cy.createMultipleTestMaterials(10)
      cy.createMultipleTestProjects(10)

      // Test loading performance
      cy.visit('/admin/learning-materials')
      cy.get('[data-cy=materials-list]').should('be.visible')
      cy.get('[data-cy=loading-time]').should('be.lessThan', 3000) // 3 seconds

      cy.visit('/admin/projects')
      cy.get('[data-cy=projects-list]').should('be.visible')
      cy.get('[data-cy=loading-time]').should('be.lessThan', 3000) // 3 seconds
    })
  })

  describe('Error Handling Tests', () => {
    it('should handle network errors gracefully', () => {
      // Simulate network error
      cy.intercept('GET', '/api/careers', { forceNetworkError: true })
      
      cy.visit('/browse-careers')
      cy.get('[data-cy=error-message]').should('be.visible')
      cy.get('[data-cy=retry-button]').click()
    })

    it('should handle form validation errors', () => {
      cy.loginAsAdmin()
      cy.visit('/admin/career-paths')
      cy.get('[data-cy=create-career-path-button]').click()
      cy.get('[data-cy=save-career-path-button]').click()
      
      // Verify validation messages
      cy.get('[data-cy=name-error]').should('be.visible')
      cy.get('[data-cy=description-error]').should('be.visible')
    })
  })
})
