// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login with test user
Cypress.Commands.add('login', () => {
  const { email, password } = Cypress.env('testUser')
  
  cy.visit('/login')
  cy.get('[data-cy=email-input]').type(email)
  cy.get('[data-cy=password-input]').type(password)
  cy.get('[data-cy=login-button]').click()
  
  // Wait for successful login
  cy.url().should('include', '/dashboard')
  cy.get('[data-cy=user-menu]').should('be.visible')
})

// Custom command to login as admin
Cypress.Commands.add('loginAsAdmin', () => {
  const { email, password } = Cypress.env('adminUser')
  
  cy.visit('/login')
  cy.get('[data-cy=email-input]').type(email)
  cy.get('[data-cy=password-input]').type(password)
  cy.get('[data-cy=login-button]').click()
  
  // Wait for successful login
  cy.url().should('include', '/admin')
  cy.get('[data-cy=admin-dashboard]').should('be.visible')
})

// Custom command to login as mentor
Cypress.Commands.add('loginAsMentor', () => {
  const { email, password } = Cypress.env('mentorUser')
  
  cy.visit('/login')
  cy.get('[data-cy=email-input]').type(email)
  cy.get('[data-cy=password-input]').type(password)
  cy.get('[data-cy=login-button]').click()
  
  // Wait for successful login
  cy.url().should('include', '/mentor')
  cy.get('[data-cy=mentor-dashboard]').should('be.visible')
})

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=user-menu]').click()
  cy.get('[data-cy=logout-button]').click()
  
  // Wait for logout
  cy.url().should('include', '/login')
})

// Custom command to wait for API response
Cypress.Commands.add('waitForApi', (method: string, url: string) => {
  cy.intercept(method, `${Cypress.env('apiUrl')}${url}`).as('apiCall')
  cy.wait('@apiCall')
})

// Custom command to clear test data
Cypress.Commands.add('clearTestData', () => {
  // Clear localStorage
  cy.clearLocalStorage()
  
  // Clear cookies
  cy.clearCookies()
})

// Custom command to create test user
Cypress.Commands.add('createTestUser', () => {
  const testUser = Cypress.env('testUser')
  
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/register`,
    body: {
      email: testUser.email,
      password: testUser.password,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      role: 'learner'
    }
  }).then((response) => {
    expect(response.status).to.eq(201)
  })
})

// Custom command to navigate to career assessment
Cypress.Commands.add('navigateToCareerAssessment', () => {
  cy.visit('/career-assessment')
  cy.get('[data-cy=career-assessment-page]').should('be.visible')
})

// Custom command to complete quiz
Cypress.Commands.add('completeQuiz', () => {
  // Wait for quiz to load
  cy.get('[data-cy=quiz-container]').should('be.visible')
  
  // Answer questions
  cy.get('[data-cy=question-0]').within(() => {
    cy.get('[data-cy=option-1]').click() // Select intermediate level
  })
  
  cy.get('[data-cy=question-1]').within(() => {
    cy.get('[data-cy=option-0]').click() // Select frontend preference
  })
  
  // Submit quiz
  cy.get('[data-cy=submit-quiz-button]').click()
  
  // Wait for results
  cy.get('[data-cy=quiz-results]').should('be.visible')
})

// Custom command to rate skills
Cypress.Commands.add('rateSkills', () => {
  // Navigate to skills assessment
  cy.get('[data-cy=skills-tab]').click()
  
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
  
  // Wait for save confirmation
  cy.get('[data-cy=skills-saved-message]').should('be.visible')
})

// Custom command to select career path
Cypress.Commands.add('selectCareerPath', (careerSlug: string) => {
  cy.visit(`/careers/${careerSlug}`)
  cy.get('[data-cy=career-path-details]').should('be.visible')
  
  // Click on career path
  cy.get(`[data-cy=career-${careerSlug}]`).click()
  
  // Wait for career path to load
  cy.get('[data-cy=career-roadmap]').should('be.visible')
})

// Custom command to access learning materials
Cypress.Commands.add('accessLearningMaterials', () => {
  // Navigate to learning materials
  cy.get('[data-cy=learning-materials-tab]').click()
  
  // Wait for materials to load
  cy.get('[data-cy=materials-list]').should('be.visible')
  
  // Click on first material
  cy.get('[data-cy=material-item]').first().click()
  
  // Wait for material to open
  cy.get('[data-cy=material-content]').should('be.visible')
})

// Custom command to submit project
Cypress.Commands.add('submitProject', () => {
  // Navigate to projects
  cy.get('[data-cy=projects-tab]').click()
  
  // Wait for projects to load
  cy.get('[data-cy=projects-list]').should('be.visible')
  
  // Click on first available project
  cy.get('[data-cy=project-item]').first().click()
  
  // Fill project submission form
  cy.get('[data-cy=project-url-input]').type('https://github.com/user/project')
  cy.get('[data-cy=project-description-input]').type('This is my project submission')
  cy.get('[data-cy=project-notes-input]').type('Additional notes about the project')
  
  // Submit project
  cy.get('[data-cy=submit-project-button]').click()
  
  // Wait for submission confirmation
  cy.get('[data-cy=project-submitted-message]').should('be.visible')
})

// Custom command to provide mentor feedback
Cypress.Commands.add('provideMentorFeedback', () => {
  // Navigate to mentor submissions
  cy.get('[data-cy=mentor-submissions-tab]').click()
  
  // Wait for submissions to load
  cy.get('[data-cy=submissions-list]').should('be.visible')
  
  // Click on first submission
  cy.get('[data-cy=submission-item]').first().click()
  
  // Fill feedback form
  cy.get('[data-cy=feedback-score-input]').type('85')
  cy.get('[data-cy=feedback-text-input]').type('Great work! The project demonstrates excellent skills.')
  cy.get('[data-cy=feedback-status-select]').select('approved')
  
  // Submit feedback
  cy.get('[data-cy=submit-feedback-button]').click()
  
  // Wait for feedback submission confirmation
  cy.get('[data-cy=feedback-submitted-message]').should('be.visible')
})

// Override visit command to handle authentication
Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  // Add authentication token if available
  const token = localStorage.getItem('token')
  if (token) {
    options = {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`
      }
    }
  }
  
  return originalFn(url, options)
})

// Custom commands for Learning Materials Management (Module 5)
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

// Custom commands for Project Management (Module 6)
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
