// cypress/e2e/module4/admin-career-management.cy.ts
// Module 4: Admin - Career Path Management - End-to-End Tests

describe('Module 4: Admin - Career Path Management', () => {
  beforeEach(() => {
    cy.clearTestData()
  })

  describe('TC_AUTO_013: Admin Access Control Test', () => {
    it('should prevent regular users from accessing admin features', () => {
      // Login as regular user
      cy.login()

      // Try to access admin dashboard
      cy.visit('/admin/dashboard')

      // Should be redirected to unauthorized page
      cy.url().should('include', '/unauthorized')
      cy.get('[data-cy=unauthorized-message]').should('be.visible')
      cy.get('[data-cy=unauthorized-message]').should('contain', 'Access denied')
    })

    it('should allow admin users to access management features', () => {
      // Login as admin
      cy.loginAsAdmin()

      // Navigate to admin dashboard
      cy.visit('/admin/dashboard')
      cy.get('[data-cy=admin-dashboard]').should('be.visible')

      // Verify admin features are accessible
      cy.get('[data-cy=admin-nav]').within(() => {
        cy.get('[data-cy=career-paths-link]').should('be.visible')
        cy.get('[data-cy=learning-materials-link]').should('be.visible')
        cy.get('[data-cy=projects-link]').should('be.visible')
        cy.get('[data-cy=users-link]').should('be.visible')
        cy.get('[data-cy=analytics-link]').should('be.visible')
      })
    })

    it('should verify admin role permissions', () => {
      // Login as admin
      cy.loginAsAdmin()

      // Navigate to admin dashboard
      cy.visit('/admin/dashboard')

      // Check admin permissions
      cy.get('[data-cy=admin-permissions]').within(() => {
        cy.get('[data-cy=permission-create]').should('be.visible')
        cy.get('[data-cy=permission-edit]').should('be.visible')
        cy.get('[data-cy=permission-delete]').should('be.visible')
        cy.get('[data-cy=permission-manage-users]').should('be.visible')
      })
    })

    it('should handle session expiration for admin users', () => {
      // Login as admin
      cy.loginAsAdmin()

      // Navigate to admin dashboard
      cy.visit('/admin/dashboard')
      cy.get('[data-cy=admin-dashboard]').should('be.visible')

      // Simulate session expiration by clearing token
      cy.clearLocalStorage()

      // Try to access admin feature
      cy.visit('/admin/career-paths')

      // Should be redirected to login
      cy.url().should('include', '/login')
      cy.get('[data-cy=login-page]').should('be.visible')
    })
  })

  describe('TC_AUTO_014: Career Path CRUD Operations Test', () => {
    beforeEach(() => {
      cy.loginAsAdmin()
      cy.visit('/admin/career-paths')
    })

    it('should create a new career path successfully', () => {
      // Click create new career path button
      cy.get('[data-cy=create-career-path-button]').click()

      // Fill career path form
      cy.get('[data-cy=career-path-form]').within(() => {
        cy.get('[data-cy=name-input]').type('Full Stack Developer')
        cy.get('[data-cy=description-input]').type('A comprehensive career path for becoming a full stack developer')
        cy.get('[data-cy=category-select]').select('Development')
        cy.get('[data-cy=salary-range-input]').type('$60,000 - $120,000')
        cy.get('[data-cy=job-growth-input]').type('15%')
        cy.get('[data-cy=is-active-checkbox]').check()
      })

      // Add required skills
      cy.get('[data-cy=add-skill-button]').click()
      cy.get('[data-cy=skill-form]').within(() => {
        cy.get('[data-cy=skill-name-input]').type('JavaScript')
        cy.get('[data-cy=required-level-input]').type('3')
        cy.get('[data-cy=importance-select]').select('essential')
        cy.get('[data-cy=save-skill-button]').click()
      })

      // Add roadmap steps
      cy.get('[data-cy=add-step-button]').click()
      cy.get('[data-cy=step-form]').within(() => {
        cy.get('[data-cy=step-title-input]').type('Learn HTML & CSS')
        cy.get('[data-cy=step-description-input]').type('Master the fundamentals of web development')
        cy.get('[data-cy=step-order-input]').type('1')
        cy.get('[data-cy=save-step-button]').click()
      })

      // Submit career path
      cy.get('[data-cy=submit-career-path-button]').click()

      // Wait for creation API call
      cy.waitForApi('POST', '/admin/career-paths')

      // Verify success message
      cy.get('[data-cy=success-message]').should('be.visible')
      cy.get('[data-cy=success-message]').should('contain', 'Career path created successfully')

      // Verify career path appears in list
      cy.get('[data-cy=career-paths-list]').should('contain', 'Full Stack Developer')
    })

    it('should read and display career path details', () => {
      // Wait for career paths to load
      cy.waitForApi('GET', '/admin/career-paths')

      // Click on first career path
      cy.get('[data-cy=career-path-item]').first().click()

      // Verify career path details are displayed
      cy.get('[data-cy=career-path-details]').should('be.visible')
      cy.get('[data-cy=career-path-name]').should('be.visible')
      cy.get('[data-cy=career-path-description]').should('be.visible')
      cy.get('[data-cy=career-path-category]').should('be.visible')
      cy.get('[data-cy=career-path-salary]').should('be.visible')
      cy.get('[data-cy=career-path-growth]').should('be.visible')
      cy.get('[data-cy=career-path-status]').should('be.visible')

      // Verify required skills are displayed
      cy.get('[data-cy=required-skills-section]').should('be.visible')
      cy.get('[data-cy=skill-item]').should('have.length.at.least', 1)

      // Verify roadmap steps are displayed
      cy.get('[data-cy=roadmap-steps-section]').should('be.visible')
      cy.get('[data-cy=roadmap-step]').should('have.length.at.least', 1)
    })

    it('should update existing career path information', () => {
      // Wait for career paths to load
      cy.waitForApi('GET', '/admin/career-paths')

      // Click on first career path
      cy.get('[data-cy=career-path-item]').first().click()

      // Click edit button
      cy.get('[data-cy=edit-career-path-button]').click()

      // Update career path information
      cy.get('[data-cy=career-path-form]').within(() => {
        cy.get('[data-cy=name-input]').clear().type('Updated Career Path Name')
        cy.get('[data-cy=description-input]').clear().type('Updated description for the career path')
        cy.get('[data-cy=salary-range-input]').clear().type('$70,000 - $130,000')
      })

      // Save changes
      cy.get('[data-cy=save-career-path-button]').click()

      // Wait for update API call
      cy.waitForApi('PUT', '/admin/career-paths')

      // Verify success message
      cy.get('[data-cy=success-message]').should('be.visible')
      cy.get('[data-cy=success-message]').should('contain', 'Career path updated successfully')

      // Verify changes are reflected
      cy.get('[data-cy=career-path-name]').should('contain', 'Updated Career Path Name')
      cy.get('[data-cy=career-path-description]').should('contain', 'Updated description')
    })

    it('should delete a career path', () => {
      // Wait for career paths to load
      cy.waitForApi('GET', '/admin/career-paths')

      // Get the name of the first career path
      cy.get('[data-cy=career-path-item]').first().within(() => {
        cy.get('[data-cy=career-path-name]').invoke('text').then((careerPathName) => {
          cy.wrap(careerPathName).as('careerPathName')
        })
      })

      // Click on first career path
      cy.get('[data-cy=career-path-item]').first().click()

      // Click delete button
      cy.get('[data-cy=delete-career-path-button]').click()

      // Confirm deletion
      cy.get('[data-cy=confirm-delete-button]').click()

      // Wait for delete API call
      cy.waitForApi('DELETE', '/admin/career-paths')

      // Verify success message
      cy.get('[data-cy=success-message]').should('be.visible')
      cy.get('[data-cy=success-message]').should('contain', 'Career path deleted successfully')

      // Verify career path is removed from list
      cy.get('@careerPathName').then((careerPathName) => {
        cy.get('[data-cy=career-paths-list]').should('not.contain', careerPathName)
      })
    })

    it('should handle bulk operations on career paths', () => {
      // Wait for career paths to load
      cy.waitForApi('GET', '/admin/career-paths')

      // Select multiple career paths
      cy.get('[data-cy=career-path-checkbox]').first().check()
      cy.get('[data-cy=career-path-checkbox]').eq(1).check()

      // Verify bulk actions are available
      cy.get('[data-cy=bulk-actions]').should('be.visible')
      cy.get('[data-cy=bulk-activate-button]').should('be.visible')
      cy.get('[data-cy=bulk-deactivate-button]').should('be.visible')
      cy.get('[data-cy=bulk-delete-button]').should('be.visible')

      // Perform bulk activation
      cy.get('[data-cy=bulk-activate-button]').click()

      // Wait for bulk update API call
      cy.waitForApi('PUT', '/admin/career-paths/bulk')

      // Verify success message
      cy.get('[data-cy=success-message]').should('be.visible')
      cy.get('[data-cy=success-message]').should('contain', 'Career paths activated successfully')
    })
  })

  describe('TC_AUTO_015: Form Validation Test', () => {
    beforeEach(() => {
      cy.loginAsAdmin()
      cy.visit('/admin/career-paths')
    })

    it('should validate required fields in career path creation', () => {
      // Click create new career path button
      cy.get('[data-cy=create-career-path-button]').click()

      // Try to submit without filling required fields
      cy.get('[data-cy=submit-career-path-button]').click()

      // Verify validation messages
      cy.get('[data-cy=name-error]').should('be.visible')
      cy.get('[data-cy=name-error]').should('contain', 'Name is required')
      cy.get('[data-cy=description-error]').should('be.visible')
      cy.get('[data-cy=description-error]').should('contain', 'Description is required')
      cy.get('[data-cy=category-error]').should('be.visible')
      cy.get('[data-cy=category-error]').should('contain', 'Category is required')
    })

    it('should validate field length limits', () => {
      // Click create new career path button
      cy.get('[data-cy=create-career-path-button]').click()

      // Enter text exceeding length limits
      const longText = 'a'.repeat(256)
      cy.get('[data-cy=name-input]').type(longText)
      cy.get('[data-cy=description-input]').type(longText)

      // Try to submit
      cy.get('[data-cy=submit-career-path-button]').click()

      // Verify length validation messages
      cy.get('[data-cy=name-error]').should('contain', 'Name must be less than 100 characters')
      cy.get('[data-cy=description-error]').should('contain', 'Description must be less than 500 characters')
    })

    it('should validate skill requirements', () => {
      // Click create new career path button
      cy.get('[data-cy=create-career-path-button]').click()

      // Fill basic career path info
      cy.get('[data-cy=name-input]').type('Test Career Path')
      cy.get('[data-cy=description-input]').type('Test description')
      cy.get('[data-cy=category-select]').select('Development')

      // Try to submit without adding required skills
      cy.get('[data-cy=submit-career-path-button]').click()

      // Verify skill validation message
      cy.get('[data-cy=skills-error]').should('be.visible')
      cy.get('[data-cy=skills-error]').should('contain', 'At least one required skill is needed')

      // Add skill with invalid data
      cy.get('[data-cy=add-skill-button]').click()
      cy.get('[data-cy=skill-form]').within(() => {
        cy.get('[data-cy=skill-name-input]').type('') // Empty skill name
        cy.get('[data-cy=required-level-input]').type('6') // Invalid level
        cy.get('[data-cy=save-skill-button]').click()
      })

      // Verify skill validation messages
      cy.get('[data-cy=skill-name-error]').should('contain', 'Skill name is required')
      cy.get('[data-cy=required-level-error]').should('contain', 'Level must be between 1 and 5')
    })

    it('should validate roadmap steps', () => {
      // Click create new career path button
      cy.get('[data-cy=create-career-path-button]').click()

      // Fill basic career path info
      cy.get('[data-cy=name-input]').type('Test Career Path')
      cy.get('[data-cy=description-input]').type('Test description')
      cy.get('[data-cy=category-select]').select('Development')

      // Add required skill
      cy.get('[data-cy=add-skill-button]').click()
      cy.get('[data-cy=skill-form]').within(() => {
        cy.get('[data-cy=skill-name-input]').type('JavaScript')
        cy.get('[data-cy=required-level-input]').type('3')
        cy.get('[data-cy=importance-select]').select('essential')
        cy.get('[data-cy=save-skill-button]').click()
      })

      // Try to submit without adding roadmap steps
      cy.get('[data-cy=submit-career-path-button]').click()

      // Verify roadmap validation message
      cy.get('[data-cy=roadmap-error]').should('be.visible')
      cy.get('[data-cy=roadmap-error]').should('contain', 'At least one roadmap step is required')

      // Add step with invalid data
      cy.get('[data-cy=add-step-button]').click()
      cy.get('[data-cy=step-form]').within(() => {
        cy.get('[data-cy=step-title-input]').type('') // Empty title
        cy.get('[data-cy=step-order-input]').type('0') // Invalid order
        cy.get('[data-cy=save-step-button]').click()
      })

      // Verify step validation messages
      cy.get('[data-cy=step-title-error]').should('contain', 'Step title is required')
      cy.get('[data-cy=step-order-error]').should('contain', 'Order must be greater than 0')
    })

    it('should validate data formats', () => {
      // Click create new career path button
      cy.get('[data-cy=create-career-path-button]').click()

      // Test invalid salary format
      cy.get('[data-cy=salary-range-input]').type('invalid-salary')
      cy.get('[data-cy=submit-career-path-button]').click()
      cy.get('[data-cy=salary-error]').should('contain', 'Invalid salary format')

      // Test invalid job growth format
      cy.get('[data-cy=job-growth-input]').type('invalid-growth')
      cy.get('[data-cy=submit-career-path-button]').click()
      cy.get('[data-cy=job-growth-error]').should('contain', 'Invalid growth format')

      // Test valid formats
      cy.get('[data-cy=salary-range-input]').clear().type('$60,000 - $120,000')
      cy.get('[data-cy=job-growth-input]').clear().type('15%')
      cy.get('[data-cy=submit-career-path-button]').click()

      // Verify no validation errors for valid formats
      cy.get('[data-cy=salary-error]').should('not.exist')
      cy.get('[data-cy=job-growth-error]').should('not.exist')
    })

    it('should handle form submission with valid data', () => {
      // Click create new career path button
      cy.get('[data-cy=create-career-path-button]').click()

      // Fill form with valid data
      cy.get('[data-cy=career-path-form]').within(() => {
        cy.get('[data-cy=name-input]').type('Valid Career Path')
        cy.get('[data-cy=description-input]').type('A valid career path description')
        cy.get('[data-cy=category-select]').select('Development')
        cy.get('[data-cy=salary-range-input]').type('$60,000 - $120,000')
        cy.get('[data-cy=job-growth-input]').type('15%')
        cy.get('[data-cy=is-active-checkbox]').check()
      })

      // Add valid skill
      cy.get('[data-cy=add-skill-button]').click()
      cy.get('[data-cy=skill-form]').within(() => {
        cy.get('[data-cy=skill-name-input]').type('JavaScript')
        cy.get('[data-cy=required-level-input]').type('3')
        cy.get('[data-cy=importance-select]').select('essential')
        cy.get('[data-cy=save-skill-button]').click()
      })

      // Add valid roadmap step
      cy.get('[data-cy=add-step-button]').click()
      cy.get('[data-cy=step-form]').within(() => {
        cy.get('[data-cy=step-title-input]').type('Learn Fundamentals')
        cy.get('[data-cy=step-description-input]').type('Learn the basics of web development')
        cy.get('[data-cy=step-order-input]').type('1')
        cy.get('[data-cy=save-step-button]').click()
      })

      // Submit form
      cy.get('[data-cy=submit-career-path-button]').click()

      // Wait for creation API call
      cy.waitForApi('POST', '/admin/career-paths')

      // Verify success
      cy.get('[data-cy=success-message]').should('be.visible')
      cy.get('[data-cy=success-message]').should('contain', 'Career path created successfully')
    })
  })

  describe('Cross-Module Integration', () => {
    it('should manage career paths and verify learner access', () => {
      // Login as admin and create career path
      cy.loginAsAdmin()
      cy.visit('/admin/career-paths')

      // Create a new career path
      cy.get('[data-cy=create-career-path-button]').click()
      cy.get('[data-cy=career-path-form]').within(() => {
        cy.get('[data-cy=name-input]').type('Test Career Path')
        cy.get('[data-cy=description-input]').type('Test description')
        cy.get('[data-cy=category-select]').select('Development')
        cy.get('[data-cy=is-active-checkbox]').check()
      })

      // Add skill and step
      cy.get('[data-cy=add-skill-button]').click()
      cy.get('[data-cy=skill-form]').within(() => {
        cy.get('[data-cy=skill-name-input]').type('JavaScript')
        cy.get('[data-cy=required-level-input]').type('3')
        cy.get('[data-cy=importance-select]').select('essential')
        cy.get('[data-cy=save-skill-button]').click()
      })

      cy.get('[data-cy=add-step-button]').click()
      cy.get('[data-cy=step-form]').within(() => {
        cy.get('[data-cy=step-title-input]').type('Learn JavaScript')
        cy.get('[data-cy=step-description-input]').type('Master JavaScript fundamentals')
        cy.get('[data-cy=step-order-input]').type('1')
        cy.get('[data-cy=save-step-button]').click()
      })

      cy.get('[data-cy=submit-career-path-button]').click()
      cy.waitForApi('POST', '/admin/career-paths')

      // Login as learner and verify career path is accessible
      cy.login()
      cy.visit('/careers')

      // Verify new career path appears
      cy.get('[data-cy=career-card]').should('contain', 'Test Career Path')

      // Click on career path
      cy.get('[data-cy=career-card]').contains('Test Career Path').click()

      // Verify career path details are displayed
      cy.get('[data-cy=career-details]').should('be.visible')
      cy.get('[data-cy=career-roadmap]').should('be.visible')
    })

    it('should handle career path deactivation', () => {
      // Login as admin
      cy.loginAsAdmin()
      cy.visit('/admin/career-paths')
      cy.waitForApi('GET', '/admin/career-paths')

      // Deactivate first career path
      cy.get('[data-cy=career-path-item]').first().click()
      cy.get('[data-cy=edit-career-path-button]').click()
      cy.get('[data-cy=is-active-checkbox]').uncheck()
      cy.get('[data-cy=save-career-path-button]').click()
      cy.waitForApi('PUT', '/admin/career-paths')

      // Login as learner and verify career path is not accessible
      cy.login()
      cy.visit('/careers')

      // Verify deactivated career path is not shown
      cy.get('[data-cy=career-card]').should('not.contain', 'Deactivated Career Path')
    })
  })
})
