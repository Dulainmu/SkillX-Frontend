// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test on uncaught exceptions
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  return true
})

// Custom type definitions
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with test user
       * @example cy.login()
       */
      login(): Chainable<void>
      
      /**
       * Custom command to login as admin
       * @example cy.loginAsAdmin()
       */
      loginAsAdmin(): Chainable<void>
      
      /**
       * Custom command to login as mentor
       * @example cy.loginAsMentor()
       */
      loginAsMentor(): Chainable<void>
      
      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>
      
      /**
       * Custom command to wait for API response
       * @example cy.waitForApi('GET', '/api/careers')
       */
      waitForApi(method: string, url: string): Chainable<void>
      
      /**
       * Custom command to clear test data
       * @example cy.clearTestData()
       */
      clearTestData(): Chainable<void>
      
      /**
       * Custom command to create test user
       * @example cy.createTestUser()
       */
      createTestUser(): Chainable<void>
      
      /**
       * Custom command to navigate to career assessment
       * @example cy.navigateToCareerAssessment()
       */
      navigateToCareerAssessment(): Chainable<void>
      
      /**
       * Custom command to complete quiz
       * @example cy.completeQuiz()
       */
      completeQuiz(): Chainable<void>
      
      /**
       * Custom command to rate skills
       * @example cy.rateSkills()
       */
      rateSkills(): Chainable<void>
      
      /**
       * Custom command to select career path
       * @example cy.selectCareerPath('frontend-developer')
       */
      selectCareerPath(careerSlug: string): Chainable<void>
      
      /**
       * Custom command to create test learning material
       * @example cy.createTestLearningMaterial()
       */
      createTestLearningMaterial(): Chainable<void>
      
      /**
       * Custom command to create multiple test materials
       * @example cy.createMultipleTestMaterials(5)
       */
      createMultipleTestMaterials(count: number): Chainable<void>
      
      /**
       * Custom command to create test project
       * @example cy.createTestProject()
       */
      createTestProject(): Chainable<void>
      
      /**
       * Custom command to create multiple test projects
       * @example cy.createMultipleTestProjects(5)
       */
      createMultipleTestProjects(count: number): Chainable<void>
      
      /**
       * Custom command to create project with specific skill level
       * @example cy.createProjectWithSkillLevel('beginner')
       */
      createProjectWithSkillLevel(skillLevel: string): Chainable<void>
      
      /**
       * Custom command to create project for specific career path
       * @example cy.createProjectForCareerPath('Frontend Developer')
       */
      createProjectForCareerPath(careerPath: string): Chainable<void>
      
      /**
       * Custom command to access learning materials
       * @example cy.accessLearningMaterials()
       */
      accessLearningMaterials(): Chainable<void>
      
      /**
       * Custom command to submit project
       * @example cy.submitProject()
       */
      submitProject(): Chainable<void>
      
      /**
       * Custom command to provide mentor feedback
       * @example cy.provideMentorFeedback()
       */
      provideMentorFeedback(): Chainable<void>
    }
  }
}
