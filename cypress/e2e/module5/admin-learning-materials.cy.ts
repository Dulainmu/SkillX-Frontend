// cypress/e2e/module5/admin-learning-materials.cy.ts
// Module 5: Admin - Learning Materials Management - End-to-End Tests

describe('Module 5: Admin - Learning Materials Management', () => {
  beforeEach(() => {
    cy.clearTestData()
    cy.loginAsAdmin()
    cy.visit('/admin/learning-materials')
  })

  describe('TC_AUTO_016: Learning Material CRUD Test', () => {
    it('should create a new learning material successfully', () => {
      // Click create new material button
      cy.get('[data-cy=create-material-button]').click()

      // Fill material form
      cy.get('[data-cy=material-form]').within(() => {
        cy.get('[data-cy=title-input]').type('Introduction to React Hooks')
        cy.get('[data-cy=description-input]').type('Learn the basics of React Hooks including useState and useEffect')
        cy.get('[data-cy=type-select]').select('video')
        cy.get('[data-cy=difficulty-select]').select('beginner')
        cy.get('[data-cy=career-path-select]').select('Frontend Developer')
        cy.get('[data-cy=url-input]').type('https://example.com/react-hooks-tutorial')
        cy.get('[data-cy=duration-input]').type('45')
        cy.get('[data-cy=is-active-checkbox]').check()
      })

      // Submit form
      cy.get('[data-cy=save-material-button]').click()

      // Wait for API call
      cy.waitForApi('POST', '/api/learning-materials')

      // Verify success message
      cy.get('[data-cy=success-message]').should('be.visible')
      cy.get('[data-cy=success-message]').should('contain', 'Learning material created successfully')

      // Verify material appears in list
      cy.get('[data-cy=materials-list]').should('contain', 'Introduction to React Hooks')
    })

    it('should read/display learning material details', () => {
      // Create a test material first
      cy.createTestLearningMaterial()

      // Navigate to materials list
      cy.visit('/admin/learning-materials')

      // Click on material to view details
      cy.get('[data-cy=materials-list]').contains('Test Material').click()

      // Verify material details are displayed
      cy.get('[data-cy=material-details]').within(() => {
        cy.get('[data-cy=material-title]').should('contain', 'Test Material')
        cy.get('[data-cy=material-description]').should('contain', 'Test Description')
        cy.get('[data-cy=material-type]').should('contain', 'video')
        cy.get('[data-cy=material-difficulty]').should('contain', 'beginner')
        cy.get('[data-cy=material-career-path]').should('contain', 'Frontend Developer')
        cy.get('[data-cy=material-url]').should('contain', 'https://example.com')
        cy.get('[data-cy=material-duration]').should('contain', '30')
      })
    })

    it('should update existing learning material', () => {
      // Create a test material first
      cy.createTestLearningMaterial()

      // Navigate to materials list
      cy.visit('/admin/learning-materials')

      // Click edit button for the material
      cy.get('[data-cy=materials-list]').contains('Test Material').parent().find('[data-cy=edit-material-button]').click()

      // Update material information
      cy.get('[data-cy=material-form]').within(() => {
        cy.get('[data-cy=title-input]').clear().type('Updated Test Material')
        cy.get('[data-cy=description-input]').clear().type('Updated description for the test material')
        cy.get('[data-cy=difficulty-select]').select('intermediate')
      })

      // Save changes
      cy.get('[data-cy=save-material-button]').click()

      // Wait for API call
      cy.waitForApi('PUT', '/api/learning-materials')

      // Verify success message
      cy.get('[data-cy=success-message]').should('be.visible')
      cy.get('[data-cy=success-message]').should('contain', 'Learning material updated successfully')

      // Verify updated material appears in list
      cy.get('[data-cy=materials-list]').should('contain', 'Updated Test Material')
    })

    it('should delete learning material', () => {
      // Create a test material first
      cy.createTestLearningMaterial()

      // Navigate to materials list
      cy.visit('/admin/learning-materials')

      // Click delete button for the material
      cy.get('[data-cy=materials-list]').contains('Test Material').parent().find('[data-cy=delete-material-button]').click()

      // Confirm deletion
      cy.get('[data-cy=confirm-delete-button]').click()

      // Wait for API call
      cy.waitForApi('DELETE', '/api/learning-materials')

      // Verify success message
      cy.get('[data-cy=success-message]').should('be.visible')
      cy.get('[data-cy=success-message]').should('contain', 'Learning material deleted successfully')

      // Verify material is removed from list
      cy.get('[data-cy=materials-list]').should('not.contain', 'Test Material')
    })

    it('should list all learning materials with pagination', () => {
      // Create multiple test materials
      cy.createMultipleTestMaterials(5)

      // Navigate to materials list
      cy.visit('/admin/learning-materials')

      // Verify materials are displayed
      cy.get('[data-cy=materials-list]').should('have.length.at.least', 5)

      // Test pagination if more than 10 materials
      cy.get('[data-cy=pagination]').then(($pagination) => {
        if ($pagination.length > 0) {
          cy.get('[data-cy=next-page-button]').click()
          cy.get('[data-cy=materials-list]').should('be.visible')
        }
      })
    })
  })

  describe('TC_AUTO_017: File Upload Functionality Test', () => {
    it('should upload PDF file successfully', () => {
      // Click create new material button
      cy.get('[data-cy=create-material-button]').click()

      // Fill basic material information
      cy.get('[data-cy=material-form]').within(() => {
        cy.get('[data-cy=title-input]').type('PDF Tutorial')
        cy.get('[data-cy=description-input]').type('A comprehensive PDF tutorial')
        cy.get('[data-cy=type-select]').select('document')
        cy.get('[data-cy=difficulty-select]').select('beginner')
      })

      // Upload PDF file
      cy.get('[data-cy=file-upload-input]').attachFile('test-document.pdf')

      // Verify file is uploaded
      cy.get('[data-cy=uploaded-file-name]').should('contain', 'test-document.pdf')
      cy.get('[data-cy=file-size]').should('be.visible')

      // Submit form
      cy.get('[data-cy=save-material-button]').click()

      // Wait for API call
      cy.waitForApi('POST', '/api/learning-materials')

      // Verify success
      cy.get('[data-cy=success-message]').should('be.visible')
    })

    it('should upload video file successfully', () => {
      // Click create new material button
      cy.get('[data-cy=create-material-button]').click()

      // Fill basic material information
      cy.get('[data-cy=material-form]').within(() => {
        cy.get('[data-cy=title-input]').type('Video Tutorial')
        cy.get('[data-cy=description-input]').type('A comprehensive video tutorial')
        cy.get('[data-cy=type-select]').select('video')
        cy.get('[data-cy=difficulty-select]').select('intermediate')
      })

      // Upload video file
      cy.get('[data-cy=file-upload-input]').attachFile('test-video.mp4')

      // Verify file is uploaded
      cy.get('[data-cy=uploaded-file-name]').should('contain', 'test-video.mp4')
      cy.get('[data-cy=file-size]').should('be.visible')

      // Submit form
      cy.get('[data-cy=save-material-button]').click()

      // Wait for API call
      cy.waitForApi('POST', '/api/learning-materials')

      // Verify success
      cy.get('[data-cy=success-message]').should('be.visible')
    })

    it('should reject files exceeding size limit', () => {
      // Click create new material button
      cy.get('[data-cy=create-material-button]').click()

      // Fill basic material information
      cy.get('[data-cy=material-form]').within(() => {
        cy.get('[data-cy=title-input]').type('Large File Test')
        cy.get('[data-cy=description-input]').type('Testing large file upload')
        cy.get('[data-cy=type-select]').select('document')
      })

      // Try to upload large file
      cy.get('[data-cy=file-upload-input]').attachFile('large-file.pdf')

      // Verify error message
      cy.get('[data-cy=file-error-message]').should('be.visible')
      cy.get('[data-cy=file-error-message]').should('contain', 'File size exceeds limit')
    })

    it('should reject unsupported file types', () => {
      // Click create new material button
      cy.get('[data-cy=create-material-button]').click()

      // Fill basic material information
      cy.get('[data-cy=material-form]').within(() => {
        cy.get('[data-cy=title-input]').type('Unsupported File Test')
        cy.get('[data-cy=description-input]').type('Testing unsupported file type')
        cy.get('[data-cy=type-select]').select('document')
      })

      // Try to upload unsupported file
      cy.get('[data-cy=file-upload-input]').attachFile('test-file.exe')

      // Verify error message
      cy.get('[data-cy=file-error-message]').should('be.visible')
      cy.get('[data-cy=file-error-message]').should('contain', 'File type not supported')
    })

    it('should handle upload progress indication', () => {
      // Click create new material button
      cy.get('[data-cy=create-material-button]').click()

      // Fill basic material information
      cy.get('[data-cy=material-form]').within(() => {
        cy.get('[data-cy=title-input]').type('Progress Test')
        cy.get('[data-cy=description-input]').type('Testing upload progress')
        cy.get('[data-cy=type-select]').select('document')
      })

      // Upload file
      cy.get('[data-cy=file-upload-input]').attachFile('test-document.pdf')

      // Verify progress bar appears
      cy.get('[data-cy=upload-progress]').should('be.visible')

      // Wait for upload to complete
      cy.get('[data-cy=upload-complete]').should('be.visible')
    })
  })

  describe('TC_AUTO_018: Material Validation Test', () => {
    it('should validate required fields', () => {
      // Click create new material button
      cy.get('[data-cy=create-material-button]').click()

      // Try to submit without filling required fields
      cy.get('[data-cy=save-material-button]').click()

      // Verify validation messages
      cy.get('[data-cy=title-error]').should('be.visible')
      cy.get('[data-cy=title-error]').should('contain', 'Title is required')
      cy.get('[data-cy=description-error]').should('be.visible')
      cy.get('[data-cy=description-error]').should('contain', 'Description is required')
      cy.get('[data-cy=type-error]').should('be.visible')
      cy.get('[data-cy=type-error]').should('contain', 'Type is required')
    })

    it('should validate field length limits', () => {
      // Click create new material button
      cy.get('[data-cy=create-material-button]').click()

      // Fill with excessively long text
      const longText = 'a'.repeat(1001)
      cy.get('[data-cy=title-input]').type(longText)
      cy.get('[data-cy=description-input]').type(longText)

      // Try to submit
      cy.get('[data-cy=save-material-button]').click()

      // Verify validation messages
      cy.get('[data-cy=title-error]').should('be.visible')
      cy.get('[data-cy=title-error]').should('contain', 'Title must be less than 100 characters')
      cy.get('[data-cy=description-error]').should('be.visible')
      cy.get('[data-cy=description-error]').should('contain', 'Description must be less than 1000 characters')
    })

    it('should validate URL format', () => {
      // Click create new material button
      cy.get('[data-cy=create-material-button]').click()

      // Fill form with invalid URL
      cy.get('[data-cy=material-form]').within(() => {
        cy.get('[data-cy=title-input]').type('URL Test')
        cy.get('[data-cy=description-input]').type('Testing URL validation')
        cy.get('[data-cy=type-select]').select('link')
        cy.get('[data-cy=url-input]').type('invalid-url')
      })

      // Try to submit
      cy.get('[data-cy=save-material-button]').click()

      // Verify validation message
      cy.get('[data-cy=url-error]').should('be.visible')
      cy.get('[data-cy=url-error]').should('contain', 'Please enter a valid URL')
    })

    it('should validate duration format', () => {
      // Click create new material button
      cy.get('[data-cy=create-material-button]').click()

      // Fill form with invalid duration
      cy.get('[data-cy=material-form]').within(() => {
        cy.get('[data-cy=title-input]').type('Duration Test')
        cy.get('[data-cy=description-input]').type('Testing duration validation')
        cy.get('[data-cy=type-select]').select('video')
        cy.get('[data-cy=duration-input]').type('-5')
      })

      // Try to submit
      cy.get('[data-cy=save-material-button]').click()

      // Verify validation message
      cy.get('[data-cy=duration-error]').should('be.visible')
      cy.get('[data-cy=duration-error]').should('contain', 'Duration must be a positive number')
    })

    it('should accept valid material submissions', () => {
      // Click create new material button
      cy.get('[data-cy=create-material-button]').click()

      // Fill form with valid data
      cy.get('[data-cy=material-form]').within(() => {
        cy.get('[data-cy=title-input]').type('Valid Material')
        cy.get('[data-cy=description-input]').type('This is a valid learning material')
        cy.get('[data-cy=type-select]').select('video')
        cy.get('[data-cy=difficulty-select]').select('beginner')
        cy.get('[data-cy=career-path-select]').select('Frontend Developer')
        cy.get('[data-cy=url-input]').type('https://example.com/valid-material')
        cy.get('[data-cy=duration-input]').type('30')
      })

      // Submit form
      cy.get('[data-cy=save-material-button]').click()

      // Wait for API call
      cy.waitForApi('POST', '/api/learning-materials')

      // Verify success
      cy.get('[data-cy=success-message]').should('be.visible')
      cy.get('[data-cy=success-message]').should('contain', 'Learning material created successfully')
    })
  })

  describe('TC_MANUAL_008: Content Management Workflow', () => {
    it('should provide efficient material organization', () => {
      // Test search functionality
      cy.get('[data-cy=search-input]').type('React')
      cy.get('[data-cy=search-button]').click()
      cy.get('[data-cy=materials-list]').should('contain', 'React')

      // Test filtering by type
      cy.get('[data-cy=type-filter]').select('video')
      cy.get('[data-cy=apply-filters-button]').click()
      cy.get('[data-cy=materials-list]').each(($item) => {
        cy.wrap($item).should('contain', 'video')
      })

      // Test filtering by difficulty
      cy.get('[data-cy=difficulty-filter]').select('beginner')
      cy.get('[data-cy=apply-filters-button]').click()
      cy.get('[data-cy=materials-list]').each(($item) => {
        cy.wrap($item).should('contain', 'beginner')
      })

      // Test sorting
      cy.get('[data-cy=sort-select]').select('title-asc')
      cy.get('[data-cy=materials-list]').should('be.visible')
    })

    it('should support bulk operations', () => {
      // Select multiple materials
      cy.get('[data-cy=select-all-checkbox]').check()
      cy.get('[data-cy=bulk-actions-dropdown]').click()
      cy.get('[data-cy=bulk-delete-option]').click()

      // Confirm bulk deletion
      cy.get('[data-cy=confirm-bulk-delete-button]').click()

      // Verify bulk operation success
      cy.get('[data-cy=success-message]').should('contain', 'Materials deleted successfully')
    })
  })
})

// Custom commands for learning materials
Cypress.Commands.add('createTestLearningMaterial', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/learning-materials`,
    headers: {
      'Authorization': `Bearer ${Cypress.env('adminToken')}`
    },
    body: {
      title: 'Test Material',
      description: 'Test Description',
      type: 'video',
      difficulty: 'beginner',
      careerPath: 'Frontend Developer',
      url: 'https://example.com',
      duration: 30,
      isActive: true
    }
  })
})

Cypress.Commands.add('createMultipleTestMaterials', (count: number) => {
  for (let i = 1; i <= count; i++) {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/learning-materials`,
      headers: {
        'Authorization': `Bearer ${Cypress.env('adminToken')}`
      },
      body: {
        title: `Test Material ${i}`,
        description: `Test Description ${i}`,
        type: 'video',
        difficulty: 'beginner',
        careerPath: 'Frontend Developer',
        url: `https://example.com/material-${i}`,
        duration: 30,
        isActive: true
      }
    })
  }
})
