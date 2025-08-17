# SkillX Platform - Cypress End-to-End Testing Framework

## Overview

This document provides comprehensive documentation for the Cypress End-to-End (E2E) testing framework implemented for the SkillX Platform. The framework covers all modules and provides automated testing for critical user workflows.

## 🎯 **Test Coverage**

### **Module 1: Career Assessment & Quiz System**
- **TC_AUTO_001**: Login Functionality Test
- **TC_AUTO_002**: Quiz Questions Loading Test
- **TC_AUTO_003**: Answer Validation Test
- **TC_AUTO_004**: Career Recommendation Engine Test
- **TC_AUTO_005**: Skills Rating System Test

### **Module 2: Career Path & Learning Materials**
- **TC_AUTO_006**: Career Path Selection Test
- **TC_AUTO_007**: Learning Materials Access Test
- **TC_AUTO_008**: Progress Tracking Test

### **Module 3: Project-Based Learning System**
- **TC_AUTO_009**: Skill Prerequisite Validation Test
- **TC_AUTO_010**: Project Assignment Logic Test
- **TC_AUTO_011**: Project Submission Workflow Test
- **TC_AUTO_012**: Mentor Integration Test

### **Module 4: Admin - Career Path Management**
- **TC_AUTO_013**: Admin Access Control Test
- **TC_AUTO_014**: Career Path CRUD Operations Test
- **TC_AUTO_015**: Form Validation Test

### **Cross-Module Integration Tests**
- **TC_INT_001**: Complete User Journey Test
- **TC_INT_002**: Data Consistency Test
- **TC_INT_003**: Role-Based Access Test
- **TC_INT_004**: End-to-End Workflow Test

## 🛠️ **Framework Architecture**

### **Technology Stack**
- **Cypress**: Primary E2E testing framework
- **TypeScript**: Type-safe test development
- **React Testing Library**: Component testing utilities
- **Custom Commands**: Reusable test utilities

### **Directory Structure**
```
cypress/
├── e2e/
│   ├── module1/
│   │   └── career-assessment.cy.ts
│   ├── module2/
│   │   └── career-path-learning.cy.ts
│   ├── module3/
│   │   └── project-learning.cy.ts
│   ├── module4/
│   │   └── admin-career-management.cy.ts
│   └── integration/
│       └── cross-module-integration.cy.ts
├── support/
│   ├── e2e.ts
│   └── commands.ts
├── fixtures/
│   └── project-files.zip
└── reports/
    └── e2e-test-summary.md
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Modern web browser (Chrome, Firefox, Edge)

### **Installation**

1. **Navigate to the frontend directory:**
   ```bash
   cd SkillX-Frontend-main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify Cypress installation:**
   ```bash
   npx cypress verify
   ```

### **Configuration**

The Cypress configuration is defined in `cypress.config.ts`:

```typescript
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },
  env: {
    apiUrl: 'http://localhost:3001',
    testUser: { email: 'test@example.com', password: 'password123' },
    adminUser: { email: 'admin@example.com', password: 'admin123' },
    mentorUser: { email: 'mentor@example.com', password: 'mentor123' }
  }
})
```

## 🏃‍♂️ **Running Tests**

### **Using the Test Runner Script**

The easiest way to run E2E tests is using the provided script:

```bash
# Run all E2E tests
./run-e2e-tests.sh

# Run specific module tests
./run-e2e-tests.sh -m module1

# Open Cypress Test Runner UI
./run-e2e-tests.sh -u

# Generate test report
./run-e2e-tests.sh -r

# Show manual test checklist
./run-e2e-tests.sh -c
```

### **Available Script Options**

| Option | Description | Example |
|--------|-------------|---------|
| `-h, --help` | Show help message | `./run-e2e-tests.sh -h` |
| `-m, --module` | Run specific module | `./run-e2e-tests.sh -m module1` |
| `-a, --all` | Run all tests (default) | `./run-e2e-tests.sh -a` |
| `-u, --ui` | Open Cypress UI | `./run-e2e-tests.sh -u` |
| `-r, --report` | Generate test report | `./run-e2e-tests.sh -r` |
| `-c, --checklist` | Show manual checklist | `./run-e2e-tests.sh -c` |
| `--no-server` | Don't start servers | `./run-e2e-tests.sh --no-server` |
| `--ci` | Run in CI mode | `./run-e2e-tests.sh --ci` |

### **Available Modules**

| Module | Description | Test File |
|--------|-------------|-----------|
| `module1` | Career Assessment & Quiz System | `career-assessment.cy.ts` |
| `module2` | Career Path & Learning Materials | `career-path-learning.cy.ts` |
| `module3` | Project-Based Learning System | `project-learning.cy.ts` |
| `module4` | Admin - Career Path Management | `admin-career-management.cy.ts` |
| `integration` | Cross-Module Integration | `cross-module-integration.cy.ts` |

### **Direct Cypress Commands**

```bash
# Run all tests
npx cypress run

# Run specific test file
npx cypress run --spec "cypress/e2e/module1/career-assessment.cy.ts"

# Open Cypress Test Runner
npx cypress open

# Run tests in headless mode
npx cypress run --headless

# Run tests with specific browser
npx cypress run --browser chrome
```

## 🧪 **Custom Commands**

The framework includes custom Cypress commands for common operations:

### **Authentication Commands**
```typescript
cy.login()                    // Login as test user
cy.loginAsAdmin()            // Login as admin user
cy.loginAsMentor()           // Login as mentor user
cy.logout()                  // Logout current user
```

### **Navigation Commands**
```typescript
cy.navigateToCareerAssessment()  // Navigate to career assessment
cy.selectCareerPath('frontend-developer')  // Select specific career path
cy.accessLearningMaterials()     // Access learning materials
```

### **Workflow Commands**
```typescript
cy.completeQuiz()            // Complete career assessment quiz
cy.rateSkills()              // Rate user skills
cy.submitProject()           // Submit a project
cy.provideMentorFeedback()   // Provide mentor feedback
```

### **Utility Commands**
```typescript
cy.waitForApi('GET', '/api/careers')  // Wait for API response
cy.clearTestData()           // Clear test data
cy.createTestUser()          // Create test user
```

## 📊 **Test Data Management**

### **Test Users**
The framework uses predefined test users for different roles:

```typescript
// Test User (Learner)
{
  email: 'test@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User'
}

// Admin User
{
  email: 'admin@example.com',
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'User'
}

// Mentor User
{
  email: 'mentor@example.com',
  password: 'mentor123',
  firstName: 'Mentor',
  lastName: 'User'
}
```

### **Data Cleanup**
Tests automatically clean up data before and after execution:
- Clear localStorage and sessionStorage
- Clear cookies
- Reset test data between tests

## 🔧 **Writing Tests**

### **Test Structure**
```typescript
describe('Module Name', () => {
  beforeEach(() => {
    cy.clearTestData()
    cy.createTestUser()
  })

  describe('Test Case Name', () => {
    it('should perform specific action', () => {
      // Test implementation
      cy.visit('/page')
      cy.get('[data-cy=element]').should('be.visible')
      cy.get('[data-cy=button]').click()
      cy.get('[data-cy=result]').should('contain', 'expected text')
    })
  })
})
```

### **Best Practices**

1. **Use data-cy attributes** for element selection:
   ```typescript
   cy.get('[data-cy=login-button]').click()
   ```

2. **Wait for API responses**:
   ```typescript
   cy.waitForApi('POST', '/auth/login')
   ```

3. **Use custom commands** for common operations:
   ```typescript
   cy.login()
   cy.navigateToCareerAssessment()
   ```

4. **Test user workflows** not just individual components:
   ```typescript
   // Complete user journey
   cy.login()
   cy.completeQuiz()
   cy.rateSkills()
   cy.get('[data-cy=recommendations]').should('be.visible')
   ```

5. **Handle async operations** properly:
   ```typescript
   cy.get('[data-cy=loading]').should('be.visible')
   cy.get('[data-cy=content]').should('be.visible')
   ```

## 📈 **Test Reports**

### **Generated Reports**
The framework generates comprehensive test reports:

1. **Console Output**: Real-time test execution status
2. **Video Recordings**: Automatic video capture of test runs
3. **Screenshots**: Screenshots on test failures
4. **HTML Reports**: Detailed HTML reports (if mochawesome is installed)
5. **Summary Report**: Markdown summary of test execution

### **Report Locations**
```
cypress/
├── videos/           # Test execution videos
├── screenshots/      # Failure screenshots
├── reports/          # Generated reports
│   ├── e2e-test-summary.md
│   └── combined-report.html (if available)
└── results/          # JSON test results
```

## 🔍 **Debugging Tests**

### **Cypress Test Runner UI**
```bash
./run-e2e-tests.sh -u
```
- Interactive test execution
- Real-time debugging
- Step-by-step test execution
- Element inspection

### **Debugging Tips**

1. **Use `cy.pause()`** to pause test execution:
   ```typescript
   cy.get('[data-cy=button]').click()
   cy.pause() // Test pauses here
   cy.get('[data-cy=result]').should('be.visible')
   ```

2. **Use `cy.debug()`** to inspect elements:
   ```typescript
   cy.get('[data-cy=element]').debug()
   ```

3. **Check network requests**:
   ```typescript
   cy.intercept('GET', '/api/data').as('getData')
   cy.wait('@getData')
   ```

4. **View test logs** in browser console during test execution

## 🚨 **Error Handling**

### **Common Issues and Solutions**

1. **Element not found**:
   ```typescript
   // Wait for element to be visible
   cy.get('[data-cy=element]', { timeout: 10000 }).should('be.visible')
   ```

2. **API timeout**:
   ```typescript
   // Increase timeout for slow APIs
   cy.waitForApi('POST', '/slow-api', { timeout: 30000 })
   ```

3. **Race conditions**:
   ```typescript
   // Wait for loading to complete
   cy.get('[data-cy=loading]').should('not.exist')
   cy.get('[data-cy=content]').should('be.visible')
   ```

4. **Authentication issues**:
   ```typescript
   // Clear auth data and re-login
   cy.clearTestData()
   cy.login()
   ```

## 🔄 **CI/CD Integration**

### **GitHub Actions Example**
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd SkillX-Frontend-main && npm install
      - run: cd SkillX-Frontend-main && ./run-e2e-tests.sh --ci
      - uses: actions/upload-artifact@v3
        with:
          name: cypress-videos
          path: SkillX-Frontend-main/cypress/videos/
```

### **CI Mode Features**
- Headless execution
- Automatic server startup
- Video recording
- Screenshot capture
- Artifact upload

## 📋 **Manual Test Cases**

While the framework covers automated testing, some scenarios require manual verification:

### **Module 1: Career Assessment & Quiz System**
- **TC_MANUAL_001**: User Interface Validation
- **TC_MANUAL_002**: Quiz Content Quality Check

### **Module 2: Career Path & Learning Materials**
- **TC_MANUAL_003**: Learning Path Logic Validation
- **TC_MANUAL_004**: Content Quality Assessment

### **Module 3: Project-Based Learning System**
- **TC_MANUAL_005**: Project Quality and Relevance
- **TC_MANUAL_006**: Mentor Experience Testing

### **Module 4: Admin - Career Path Management**
- **TC_MANUAL_007**: Admin Interface Usability

### **Module 5: Admin - Learning Materials Management**
- **TC_MANUAL_008**: Content Management Workflow

### **Module 6: Admin - Project Management**
- **TC_MANUAL_009**: Project Management Workflow

Use the checklist command to view detailed manual test procedures:
```bash
./run-e2e-tests.sh -c
```

## 🎯 **Quality Assurance**

### **Test Coverage Goals**
- **90%+ User Journey Coverage**: All critical user workflows
- **100% Authentication Coverage**: Login, logout, role-based access
- **95%+ Form Validation Coverage**: All input validation scenarios
- **85%+ Error Handling Coverage**: Network errors, validation errors
- **100% Cross-Module Integration**: Data consistency across modules

### **Performance Benchmarks**
- **Test Execution Time**: < 10 minutes for full test suite
- **Page Load Time**: < 3 seconds for all pages
- **API Response Time**: < 2 seconds for all endpoints
- **Memory Usage**: < 500MB during test execution

### **Reliability Standards**
- **Flaky Test Rate**: < 5%
- **False Positive Rate**: < 2%
- **Test Maintenance**: Weekly review and updates
- **Documentation**: Always up-to-date with code changes

## 🤝 **Contributing**

### **Adding New Tests**

1. **Create test file** in appropriate module directory
2. **Follow naming convention**: `feature-name.cy.ts`
3. **Use existing custom commands** when possible
4. **Add data-cy attributes** to new elements
5. **Update documentation** with new test cases

### **Test Review Process**

1. **Code Review**: All test changes require review
2. **Automated Testing**: Tests must pass in CI
3. **Documentation Update**: Update relevant documentation
4. **Performance Check**: Ensure tests don't impact performance

## 📞 **Support**

### **Getting Help**

1. **Check Documentation**: This README and inline comments
2. **Review Test Examples**: Existing test files for patterns
3. **Cypress Documentation**: [docs.cypress.io](https://docs.cypress.io)
4. **Team Support**: Contact development team for issues

### **Reporting Issues**

When reporting test issues, include:
- Test file and line number
- Error message and stack trace
- Steps to reproduce
- Environment details (browser, OS, etc.)
- Screenshots or videos if available

---

## 🎉 **Conclusion**

The Cypress E2E testing framework provides comprehensive coverage of the SkillX Platform's critical user workflows. With automated testing for all major modules and integration scenarios, the framework ensures high-quality, reliable software delivery.

For questions or support, refer to the documentation above or contact the development team.
