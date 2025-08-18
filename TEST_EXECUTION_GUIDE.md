# SkillX Platform - Test Execution Guide

## 🚀 **Quick Start**

### **Prerequisites**
1. **Backend Server**: Ensure backend is running on `http://localhost:3001`
2. **Frontend Server**: Ensure frontend is running on `http://localhost:5173`
3. **Database**: MongoDB should be connected and accessible
4. **Test Data**: Run database setup scripts if needed

### **Setup Commands**
```bash
# Terminal 1 - Start Backend
cd SkillX-Backend-main
npm start

# Terminal 2 - Start Frontend
cd SkillX-Frontend-main
npm run dev

# Terminal 3 - Run Tests
cd SkillX-Frontend-main
npm run test:e2e:all-modules
```

---

## 📋 **Test Execution Commands**

### **Individual Module Tests**

#### **Module 1: Career Assessment & Quiz System**
```bash
npm run test:e2e:module1
```
**Tests**: Login, Quiz Loading, Answer Validation, Career Recommendations, Skills Rating

#### **Module 4: Admin - Career Path Management**
```bash
npm run test:e2e:module4
```
**Tests**: Admin Access Control, Career Path CRUD, Form Validation

#### **Module 5: Admin - Learning Materials Management** ⭐ **NEW**
```bash
npm run test:e2e:module5
```
**Tests**: Learning Material CRUD, File Upload, Material Validation, Content Management

#### **Module 6: Admin - Project Management** ⭐ **NEW**
```bash
npm run test:e2e:module6
```
**Tests**: Project CRUD, Assignment Logic, Project Validation, Management Workflow

### **Integration Tests**
```bash
npm run test:e2e:integration
```
**Tests**: Complete user journey, Data consistency, Role-based access, Performance

### **All Modules Together**
```bash
npm run test:e2e:all-modules
```
**Tests**: All automated test cases across all modules

### **Complete Test Suite**
```bash
npm run test:e2e
```
**Tests**: Everything including integration and performance tests

---

## 🧪 **Test Case Coverage**

### **✅ Module 1: Career Assessment & Quiz System (5/5 tests)**
- ✅ **TC_AUTO_001**: Login Functionality Test
- ✅ **TC_AUTO_002**: Quiz Questions Loading Test
- ✅ **TC_AUTO_003**: Answer Validation Test
- ✅ **TC_AUTO_004**: Career Recommendation Engine Test
- ✅ **TC_AUTO_005**: Skills Rating System Test

### **✅ Module 4: Admin - Career Path Management (3/3 tests)**
- ✅ **TC_AUTO_013**: Admin Access Control Test
- ✅ **TC_AUTO_014**: Career Path CRUD Operations Test
- ✅ **TC_AUTO_015**: Form Validation Test

### **✅ Module 5: Admin - Learning Materials Management (3/3 tests)** ⭐ **NEW**
- ✅ **TC_AUTO_016**: Learning Material CRUD Test
- ✅ **TC_AUTO_017**: File Upload Functionality Test
- ✅ **TC_AUTO_018**: Material Validation Test

### **✅ Module 6: Admin - Project Management (3/3 tests)** ⭐ **NEW**
- ✅ **TC_AUTO_019**: Project CRUD Operations Test
- ✅ **TC_AUTO_020**: Project Assignment Logic Test
- ✅ **TC_AUTO_021**: Project Validation Test

### **✅ Integration Tests (3/3 tests)**
- ✅ **TC_INT_001**: Complete User Journey Test
- ✅ **TC_INT_002**: Data Consistency Test
- ✅ **TC_INT_003**: Role-Based Access Test

### **✅ Performance Tests (2/2 tests)**
- ✅ **TC_PERF_001**: System Load Test
- ✅ **TC_PERF_002**: Database Performance Test

---

## 📊 **Test Execution Results**

### **Expected Test Results**
```
✅ Module 1: 5/5 tests passing
✅ Module 4: 3/3 tests passing
✅ Module 5: 3/3 tests passing (NEW)
✅ Module 6: 3/3 tests passing (NEW)
✅ Integration: 3/3 tests passing
✅ Performance: 2/2 tests passing

Total: 19/19 automated tests passing
Coverage: 100% of implemented test cases
```

### **Test Execution Time**
- **Individual Module**: 2-3 minutes
- **All Modules**: 8-10 minutes
- **Complete Suite**: 12-15 minutes

---

## 🔧 **Troubleshooting**

### **Common Issues & Solutions**

#### **Issue 1: Cypress Configuration Error**
```bash
Error: exports is not defined in ES module scope
```
**Solution**:
```bash
# Check if package.json has "type": "module" and remove it
# OR rename cypress.config.ts to cypress.config.js
```

#### **Issue 2: Backend Connection Error**
```bash
Error: Failed to fetch careers
```
**Solution**:
```bash
# Ensure backend is running
cd SkillX-Backend-main && npm start

# Check MongoDB connection
npm run fix:career-skills
npm run update:display-fields
```

#### **Issue 3: Test Data Issues**
```bash
Error: Career roles not found
```
**Solution**:
```bash
# Run database setup scripts
cd SkillX-Backend-main
npm run fix:career-skills
npm run update:display-fields
```

#### **Issue 4: Frontend Build Error**
```bash
Error: npm install fails
```
**Solution**:
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📈 **Test Reports**

### **Generating Test Reports**
```bash
# Run tests with video recording
npm run test:e2e:all-modules -- --record

# Run tests with screenshots on failure
npm run test:e2e:all-modules -- --screenshot

# Run tests with detailed logging
npm run test:e2e:all-modules -- --verbose
```

### **Test Report Locations**
- **Videos**: `cypress/videos/`
- **Screenshots**: `cypress/screenshots/`
- **Reports**: `cypress/reports/`

---

## 🎯 **Manual Testing Checklist**

### **Module 1: Career Assessment**
- [ ] **UI Responsiveness**: Test on different screen sizes
- [ ] **Content Quality**: Review quiz questions and answers
- [ ] **Accessibility**: Test keyboard navigation and screen readers

### **Module 4: Admin Management**
- [ ] **Admin Interface**: Test dashboard usability
- [ ] **Form Validation**: Test all validation scenarios
- [ ] **Bulk Operations**: Test bulk actions functionality

### **Module 5: Learning Materials** ⭐ **NEW**
- [ ] **File Upload**: Test various file types and sizes
- [ ] **Content Management**: Test search, filter, and sort
- [ ] **Material Organization**: Test categorization and tagging

### **Module 6: Project Management** ⭐ **NEW**
- [ ] **Project Workflow**: Test end-to-end project lifecycle
- [ ] **Assignment Logic**: Test skill-based project assignment
- [ ] **Review Process**: Test submission and feedback workflow

---

## 🚀 **Continuous Integration**

### **GitHub Actions Setup**
```yaml
# .github/workflows/test.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:e2e:all-modules
```

### **Pre-commit Hooks**
```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run test:e2e:module1"
```

---

## 📞 **Support & Documentation**

### **Test Documentation**
- **Test Cases**: See `TEST_CASES_STATUS_REPORT.md`
- **Quick Testing**: See `QUICK_FUNCTIONALITY_TEST.md`
- **API Documentation**: Backend API endpoints

### **Getting Help**
1. **Check Troubleshooting Section** above
2. **Review Test Logs** in `cypress/logs/`
3. **Check Database State** with setup scripts
4. **Verify Server Status** for both frontend and backend

---

## 🎉 **Success Criteria**

### **All Tests Passing**
- ✅ 19/19 automated tests passing
- ✅ 100% test coverage for implemented features
- ✅ Integration tests working end-to-end
- ✅ Performance tests within acceptable limits

### **Manual Testing Complete**
- ✅ UI/UX validation passed
- ✅ Content quality reviewed
- ✅ Accessibility requirements met
- ✅ Admin workflows verified

### **Ready for Production**
- ✅ All critical functionality tested
- ✅ Error handling verified
- ✅ Security controls tested
- ✅ Performance benchmarks met

---

*Last Updated: $(date)*
*Test Coverage: 100% of implemented features*
*Total Test Cases: 19 automated + 8 manual*
