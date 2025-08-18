// cypress/e2e/module6/admin-project-management.cy.ts
// Module 6: Admin - Project Management - End-to-End Tests

describe('Module 6: Admin - Project Management', () => {
  beforeEach(() => {
    cy.clearTestData()
    cy.loginAsAdmin()
    cy.visit('/admin/projects')
  })

  describe('TC_AUTO_019: Project CRUD Operations Test', () => {
    it('should create a new project successfully', () => {
      // Click create new project button
      cy.get('[data-cy=create-project-button]').click()

      // Fill project form
      cy.get('[data-cy=project-form]').within(() => {
        cy.get('[data-cy=title-input]').type('Build a React Todo App')
        cy.get('[data-cy=description-input]').type('Create a full-stack todo application using React and Node.js')
        cy.get('[data-cy=career-path-select]').select('Full Stack Developer')
        cy.get('[data-cy=difficulty-select]').select('intermediate')
        cy.get('[data-cy=estimated-hours-input]').type('20')
        cy.get('[data-cy=prerequisites-input]').type('JavaScript, React basics')
        cy.get('[data-cy=learning-objectives-input]').type('State management, API integration, CRUD operations')
        cy.get('[data-cy=is-active-checkbox]').check()
      })

      // Add project requirements
      cy.get('[data-cy=add-requirement-button]').click()
      cy.get('[data-cy=requirement-form]').within(() => {
        cy.get('[data-cy=requirement-text-input]').type('Implement user authentication')
        cy.get('[data-cy=requirement-type-select]').select('functional')
        cy.get('[data-cy=save-requirement-button]').click()
      })

      // Add project deliverables
      cy.get('[data-cy=add-deliverable-button]').click()
      cy.get('[data-cy=deliverable-form]').within(() => {
        cy.get('[data-cy=deliverable-text-input]').type('Working todo application with source code')
        cy.get('[data-cy=deliverable-type-select]').select('code')
        cy.get('[data-cy=save-deliverable-button]').click()
      })

      // Submit form
      cy.get('[data-cy=save-project-button]').click()

      // Wait for API call
      cy.waitForApi('POST', '/api/projects')

      // Verify success message
      cy.get('[data-cy=success-message]').should('be.visible')
      cy.get('[data-cy=success-message]').should('contain', 'Project created successfully')

      // Verify project appears in list
      cy.get('[data-cy=projects-list]').should('contain', 'Build a React Todo App')
    })

    it('should read/display project details', () => {
      // Create a test project first
      cy.createTestProject()

      // Navigate to projects list
      cy.visit('/admin/projects')

      // Click on project to view details
      cy.get('[data-cy=projects-list]').contains('Test Project').click()

      // Verify project details are displayed
      cy.get('[data-cy=project-details]').within(() => {
        cy.get('[data-cy=project-title]').should('contain', 'Test Project')
        cy.get('[data-cy=project-description]').should('contain', 'Test Description')
        cy.get('[data-cy=project-career-path]').should('contain', 'Full Stack Developer')
        cy.get('[data-cy=project-difficulty]').should('contain', 'intermediate')
        cy.get('[data-cy=project-estimated-hours]').should('contain', '15')
        cy.get('[data-cy=project-prerequisites]').should('contain', 'JavaScript')
        cy.get('[data-cy=project-learning-objectives]').should('contain', 'React')
      })

      // Verify requirements and deliverables
      cy.get('[data-cy=project-requirements]').should('contain', 'Test Requirement')
      cy.get('[data-cy=project-deliverables]').should('contain', 'Test Deliverable')
    })

    it('should update existing project', () => {
      // Create a test project first
      cy.createTestProject()

      // Navigate to projects list
      cy.visit('/admin/projects')

      // Click edit button for the project
      cy.get('[data-cy=projects-list]').contains('Test Project').parent().find('[data-cy=edit-project-button]').click()

      // Update project information
      cy.get('[data-cy=project-form]').within(() => {
        cy.get('[data-cy=title-input]').clear().type('Updated Test Project')
        cy.get('[data-cy=description-input]').clear().type('Updated description for the test project')
        cy.get('[data-cy=difficulty-select]').select('advanced')
        cy.get('[data-cy=estimated-hours-input]').clear().type('25')
      })

      // Save changes
      cy.get('[data-cy=save-project-button]').click()

      // Wait for API call
      cy.waitForApi('PUT', '/api/projects')

      // Verify success message
      cy.get('[data-cy=success-message]').should('be.visible')
      cy.get('[data-cy=success-message]').should('contain', 'Project updated successfully')

      // Verify updated project appears in list
      cy.get('[data-cy=projects-list]').should('contain', 'Updated Test Project')
    })

    it('should delete project', () => {
      // Create a test project first
      cy.createTestProject()

      // Navigate to projects list
      cy.visit('/admin/projects')

      // Click delete button for the project
      cy.get('[data-cy=projects-list]').contains('Test Project').parent().find('[data-cy=delete-project-button]').click()

      // Confirm deletion
      cy.get('[data-cy=confirm-delete-button]').click()

      // Wait for API call
      cy.waitForApi('DELETE', '/api/projects')

      // Verify success message
      cy.get('[data-cy=success-message]').should('be.visible')
      cy.get('[data-cy=success-message]').should('contain', 'Project deleted successfully')

      // Verify project is removed from list
      cy.get('[data-cy=projects-list]').should('not.contain', 'Test Project')
    })

    it('should list all projects with pagination', () => {
      // Create multiple test projects
      cy.createMultipleTestProjects(5)

      // Navigate to projects list
      cy.visit('/admin/projects')

      // Verify projects are displayed
      cy.get('[data-cy=projects-list]').should('have.length.at.least', 5)

      // Test pagination if more than 10 projects
      cy.get('[data-cy=pagination]').then(($pagination) => {
        if ($pagination.length > 0) {
          cy.get('[data-cy=next-page-button]').click()
          cy.get('[data-cy=projects-list]').should('be.visible')
        }
      })
    })
  })

  describe('TC_AUTO_020: Project Assignment Logic Test', () => {
    it('should assign projects to appropriate skill levels', () => {
      // Create projects with different skill levels
      cy.createProjectWithSkillLevel('beginner')
      cy.createProjectWithSkillLevel('intermediate')
      cy.createProjectWithSkillLevel('advanced')

      // Navigate to project assignments
      cy.visit('/admin/project-assignments')

      // Test beginner project assignment
      cy.get('[data-cy=skill-level-filter]').select('beginner')
      cy.get('[data-cy=apply-filter-button]').click()
      cy.get('[data-cy=projects-list]').should('contain', 'Beginner Project')

      // Test intermediate project assignment
      cy.get('[data-cy=skill-level-filter]').select('intermediate')
      cy.get('[data-cy=apply-filter-button]').click()
      cy.get('[data-cy=projects-list]').should('contain', 'Intermediate Project')

      // Test advanced project assignment
      cy.get('[data-cy=skill-level-filter]').select('advanced')
      cy.get('[data-cy=apply-filter-button]').click()
      cy.get('[data-cy=projects-list]').should('contain', 'Advanced Project')
    })

    it('should assign projects to specific career paths', () => {
      // Create projects for different career paths
      cy.createProjectForCareerPath('Frontend Developer')
      cy.createProjectForCareerPath('Backend Developer')
      cy.createProjectForCareerPath('Full Stack Developer')

      // Navigate to project assignments
      cy.visit('/admin/project-assignments')

      // Test frontend project assignment
      cy.get('[data-cy=career-path-filter]').select('Frontend Developer')
      cy.get('[data-cy=apply-filter-button]').click()
      cy.get('[data-cy=projects-list]').should('contain', 'Frontend Project')

      // Test backend project assignment
      cy.get('[data-cy=career-path-filter]').select('Backend Developer')
      cy.get('[data-cy=apply-filter-button]').click()
      cy.get('[data-cy=projects-list]').should('contain', 'Backend Project')

      // Test full stack project assignment
      cy.get('[data-cy=career-path-filter]').select('Full Stack Developer')
      cy.get('[data-cy=apply-filter-button]').click()
      cy.get('[data-cy=projects-list]').should('contain', 'Full Stack Project')
    })

    it('should verify project assignments are saved correctly', () => {
      // Create a test project
      cy.createTestProject()

      // Navigate to project assignments
      cy.visit('/admin/project-assignments')

      // Assign project to a skill level
      cy.get('[data-cy=assign-project-button]').first().click()
      cy.get('[data-cy=skill-level-select]').select('intermediate')
      cy.get('[data-cy=save-assignment-button]').click()

      // Wait for API call
      cy.waitForApi('POST', '/api/project-assignments')

      // Verify assignment is saved
      cy.get('[data-cy=success-message]').should('contain', 'Project assigned successfully')

      // Verify assignment appears in list
      cy.get('[data-cy=assignments-list]').should('contain', 'intermediate')
    })

    it('should test that learners see appropriate projects', () => {
      // Create projects with different skill levels
      cy.createProjectWithSkillLevel('beginner')
      cy.createProjectWithSkillLevel('intermediate')

      // Login as a learner
      cy.login()

      // Navigate to learner's project dashboard
      cy.visit('/dashboard/projects')

      // Verify learner sees appropriate projects based on their skill level
      cy.get('[data-cy=available-projects]').should('be.visible')
      cy.get('[data-cy=project-card]').should('have.length.at.least', 1)
    })
  })

  describe('TC_AUTO_021: Project Validation Test', () => {
    it('should validate required fields', () => {
      // Click create new project button
      cy.get('[data-cy=create-project-button]').click()

      // Try to submit without filling required fields
      cy.get('[data-cy=save-project-button]').click()

      // Verify validation messages
      cy.get('[data-cy=title-error]').should('be.visible')
      cy.get('[data-cy=title-error]').should('contain', 'Title is required')
      cy.get('[data-cy=description-error]').should('be.visible')
      cy.get('[data-cy=description-error]').should('contain', 'Description is required')
      cy.get('[data-cy=career-path-error]').should('be.visible')
      cy.get('[data-cy=career-path-error]').should('contain', 'Career path is required')
      cy.get('[data-cy=difficulty-error]').should('be.visible')
      cy.get('[data-cy=difficulty-error]').should('contain', 'Difficulty level is required')
    })

    it('should validate field length limits', () => {
      // Click create new project button
      cy.get('[data-cy=create-project-button]').click()

      // Fill with excessively long text
      const longText = 'a'.repeat(1001)
      cy.get('[data-cy=title-input]').type(longText)
      cy.get('[data-cy=description-input]').type(longText)

      // Try to submit
      cy.get('[data-cy=save-project-button]').click()

      // Verify validation messages
      cy.get('[data-cy=title-error]').should('be.visible')
      cy.get('[data-cy=title-error]').should('contain', 'Title must be less than 100 characters')
      cy.get('[data-cy=description-error]').should('be.visible')
      cy.get('[data-cy=description-error]').should('contain', 'Description must be less than 1000 characters')
    })

    it('should validate estimated hours format', () => {
      // Click create new project button
      cy.get('[data-cy=create-project-button]').click()

      // Fill form with invalid estimated hours
      cy.get('[data-cy=project-form]').within(() => {
        cy.get('[data-cy=title-input]').type('Hours Test')
        cy.get('[data-cy=description-input]').type('Testing hours validation')
        cy.get('[data-cy=career-path-select]').select('Full Stack Developer')
        cy.get('[data-cy=difficulty-select]').select('intermediate')
        cy.get('[data-cy=estimated-hours-input]').type('-5')
      })

      // Try to submit
      cy.get('[data-cy=save-project-button]').click()

      // Verify validation message
      cy.get('[data-cy=estimated-hours-error]').should('be.visible')
      cy.get('[data-cy=estimated-hours-error]').should('contain', 'Estimated hours must be a positive number')
    })

    it('should validate prerequisites format', () => {
      // Click create new project button
      cy.get('[data-cy=create-project-button]').click()

      // Fill form with invalid prerequisites
      cy.get('[data-cy=project-form]').within(() => {
        cy.get('[data-cy=title-input]').type('Prerequisites Test')
        cy.get('[data-cy=description-input]').type('Testing prerequisites validation')
        cy.get('[data-cy=career-path-select]').select('Full Stack Developer')
        cy.get('[data-cy=difficulty-select]').select('intermediate')
        cy.get('[data-cy=prerequisites-input]').type('')
      })

      // Try to submit
      cy.get('[data-cy=save-project-button]').click()

      // Verify validation message
      cy.get('[data-cy=prerequisites-error]').should('be.visible')
      cy.get('[data-cy=prerequisites-error]').should('contain', 'Prerequisites are required')
    })

    it('should accept valid project submissions', () => {
      // Click create new project button
      cy.get('[data-cy=create-project-button]').click()

      // Fill form with valid data
      cy.get('[data-cy=project-form]').within(() => {
        cy.get('[data-cy=title-input]').type('Valid Project')
        cy.get('[data-cy=description-input]').type('This is a valid project submission')
        cy.get('[data-cy=career-path-select]').select('Full Stack Developer')
        cy.get('[data-cy=difficulty-select]').select('intermediate')
        cy.get('[data-cy=estimated-hours-input]').type('20')
        cy.get('[data-cy=prerequisites-input]').type('JavaScript, React basics')
        cy.get('[data-cy=learning-objectives-input]').type('Build a complete web application')
      })

      // Submit form
      cy.get('[data-cy=save-project-button]').click()

      // Wait for API call
      cy.waitForApi('POST', '/api/projects')

      // Verify success
      cy.get('[data-cy=success-message]').should('be.visible')
      cy.get('[data-cy=success-message]').should('contain', 'Project created successfully')
    })
  })

  describe('TC_MANUAL_009: Project Management Workflow', () => {
    it('should provide efficient project organization', () => {
      // Test search functionality
      cy.get('[data-cy=search-input]').type('React')
      cy.get('[data-cy=search-button]').click()
      cy.get('[data-cy=projects-list]').should('contain', 'React')

      // Test filtering by difficulty
      cy.get('[data-cy=difficulty-filter]').select('intermediate')
      cy.get('[data-cy=apply-filters-button]').click()
      cy.get('[data-cy=projects-list]').each(($item) => {
        cy.wrap($item).should('contain', 'intermediate')
      })

      // Test filtering by career path
      cy.get('[data-cy=career-path-filter]').select('Full Stack Developer')
      cy.get('[data-cy=apply-filters-button]').click()
      cy.get('[data-cy=projects-list]').each(($item) => {
        cy.wrap($item).should('contain', 'Full Stack')
      })

      // Test sorting
      cy.get('[data-cy=sort-select]').select('title-asc')
      cy.get('[data-cy=projects-list]').should('be.visible')
    })

    it('should support bulk operations', () => {
      // Select multiple projects
      cy.get('[data-cy=select-all-checkbox]').check()
      cy.get('[data-cy=bulk-actions-dropdown]').click()
      cy.get('[data-cy=bulk-delete-option]').click()

      // Confirm bulk deletion
      cy.get('[data-cy=confirm-bulk-delete-button]').click()

      // Verify bulk operation success
      cy.get('[data-cy=success-message]').should('contain', 'Projects deleted successfully')
    })

    it('should monitor learner engagement with projects', () => {
      // Navigate to project analytics
      cy.visit('/admin/project-analytics')

      // Verify analytics dashboard is displayed
      cy.get('[data-cy=analytics-dashboard]').should('be.visible')

      // Check project completion rates
      cy.get('[data-cy=completion-rates]').should('be.visible')

      // Check learner engagement metrics
      cy.get('[data-cy=engagement-metrics]').should('be.visible')

      // Check submission statistics
      cy.get('[data-cy=submission-stats]').should('be.visible')
    })

    it('should review submission and feedback process', () => {
      // Navigate to project submissions
      cy.visit('/admin/project-submissions')

      // Verify submissions list is displayed
      cy.get('[data-cy=submissions-list]').should('be.visible')

      // Test reviewing a submission
      cy.get('[data-cy=review-submission-button]').first().click()

      // Verify review form is displayed
      cy.get('[data-cy=review-form]').should('be.visible')

      // Fill review form
      cy.get('[data-cy=review-form]').within(() => {
        cy.get('[data-cy=score-input]').type('85')
        cy.get('[data-cy=feedback-textarea]').type('Great work! Well done on implementing all requirements.')
        cy.get('[data-cy=submit-review-button]').click()
      })

      // Verify review is submitted
      cy.get('[data-cy=success-message]').should('contain', 'Review submitted successfully')
    })
  })
})

// Custom commands for projects
Cypress.Commands.add('createTestProject', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/projects`,
    headers: {
      'Authorization': `Bearer ${Cypress.env('adminToken')}`
    },
    body: {
      title: 'Test Project',
      description: 'Test Description',
      careerPath: 'Full Stack Developer',
      difficulty: 'intermediate',
      estimatedHours: 15,
      prerequisites: 'JavaScript, React basics',
      learningObjectives: 'Build a React application',
      requirements: ['Test Requirement'],
      deliverables: ['Test Deliverable'],
      isActive: true
    }
  })
})

Cypress.Commands.add('createMultipleTestProjects', (count: number) => {
  for (let i = 1; i <= count; i++) {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/projects`,
      headers: {
        'Authorization': `Bearer ${Cypress.env('adminToken')}`
      },
      body: {
        title: `Test Project ${i}`,
        description: `Test Description ${i}`,
        careerPath: 'Full Stack Developer',
        difficulty: 'intermediate',
        estimatedHours: 15,
        prerequisites: 'JavaScript, React basics',
        learningObjectives: 'Build a React application',
        requirements: [`Test Requirement ${i}`],
        deliverables: [`Test Deliverable ${i}`],
        isActive: true
      }
    })
  }
})

Cypress.Commands.add('createProjectWithSkillLevel', (skillLevel: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/projects`,
    headers: {
      'Authorization': `Bearer ${Cypress.env('adminToken')}`
    },
    body: {
      title: `${skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)} Project`,
      description: `A ${skillLevel} level project`,
      careerPath: 'Full Stack Developer',
      difficulty: skillLevel,
      estimatedHours: 15,
      prerequisites: 'JavaScript basics',
      learningObjectives: 'Learn project development',
      requirements: ['Basic requirement'],
      deliverables: ['Working application'],
      isActive: true
    }
  })
})

Cypress.Commands.add('createProjectForCareerPath', (careerPath: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/projects`,
    headers: {
      'Authorization': `Bearer ${Cypress.env('adminToken')}`
    },
    body: {
      title: `${careerPath} Project`,
      description: `A project for ${careerPath}`,
      careerPath: careerPath,
      difficulty: 'intermediate',
      estimatedHours: 15,
      prerequisites: 'Basic programming knowledge',
      learningObjectives: 'Learn career-specific skills',
      requirements: ['Career-specific requirement'],
      deliverables: ['Career-specific deliverable'],
      isActive: true
    }
  })
})
