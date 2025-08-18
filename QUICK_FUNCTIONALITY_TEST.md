# Quick Functionality Test Guide

## 🚀 **Immediate Testing Steps**

### **Step 1: Start the Servers**

```bash
# Terminal 1 - Start Backend
cd SkillX-Backend-main
npm start

# Terminal 2 - Start Frontend  
cd SkillX-Frontend-main
npm run dev
```

### **Step 2: Basic Functionality Tests**

#### **✅ Test 1: Frontend Loading**
- Open browser to `http://localhost:5173`
- Should see SkillX homepage
- Navigation should work

#### **✅ Test 2: Career Assessment**
- Click "Take Career Assessment"
- Should load assessment flow
- Questions should display properly
- Can complete assessment

#### **✅ Test 3: Career Recommendations**
- Complete assessment
- Should see career recommendations
- Should show skills and tasks sections
- Can browse career paths

#### **✅ Test 4: Admin Panel**
- Navigate to `/admin/career-paths`
- Should see career management interface
- Can edit career paths
- Can add display skills and tasks

#### **✅ Test 5: Database Integration**
- Check if career data loads
- Verify skills and tasks display
- Test admin updates persist

---

## 🔍 **Manual Test Checklist**

### **Module 1: Career Assessment**
- [ ] **Login/Registration**: Can create account and login
- [ ] **Quiz Flow**: Questions load and can be answered
- [ ] **Results**: Career recommendations appear
- [ ] **Skills Rating**: Can rate technical and personal skills
- [ ] **UI Responsiveness**: Works on different screen sizes

### **Module 2: Career Paths**
- [ ] **Browse Careers**: Can view all career paths
- [ ] **Career Details**: Skills and tasks sections display
- [ ] **Learning Paths**: Roadmaps load properly
- [ ] **Progress Tracking**: Progress is saved

### **Module 3: Projects**
- [ ] **Project Access**: Can view assigned projects
- [ ] **Submission**: Can submit project work
- [ ] **Mentor Feedback**: Feedback system works

### **Module 4: Admin Management**
- [ ] **Admin Access**: Only admins can access admin panel
- [ ] **Career Management**: Can create/edit/delete careers
- [ ] **Display Skills/Tasks**: Can manage what users see
- [ ] **Form Validation**: Forms validate input properly

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: Cypress Configuration Error**
**Error**: `exports is not defined in ES module scope`
**Solution**: 
```bash
# Update package.json
"type": "module" -> remove this line
# OR
# Rename cypress.config.ts to cypress.config.js
```

### **Issue 2: Backend Connection Error**
**Error**: `Failed to fetch careers`
**Solution**:
- Ensure backend is running on port 3001
- Check MongoDB connection
- Verify API endpoints are working

### **Issue 3: Frontend Build Error**
**Error**: `npm install` fails
**Solution**:
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### **Issue 4: Database Issues**
**Error**: `Career roles not found`
**Solution**:
```bash
# Run database setup scripts
cd SkillX-Backend-main
npm run fix:career-skills
npm run update:display-fields
```

---

## 📊 **Test Results Template**

### **Test Session: [Date]**

| Test Area | Status | Notes |
|-----------|--------|-------|
| Frontend Loading | ✅/❌ | |
| Career Assessment | ✅/❌ | |
| Career Recommendations | ✅/❌ | |
| Skills & Tasks Display | ✅/❌ | |
| Admin Panel | ✅/❌ | |
| Database Integration | ✅/❌ | |

### **Issues Found:**
1. **Issue**: [Description]
   - **Severity**: High/Medium/Low
   - **Steps to Reproduce**: [Steps]
   - **Expected**: [Expected behavior]
   - **Actual**: [Actual behavior]

### **Recommendations:**
- [ ] Fix critical issues first
- [ ] Implement missing test cases
- [ ] Add performance monitoring
- [ ] Improve error handling

---

## 🎯 **Success Criteria**

### **Minimum Viable Testing**
- ✅ Frontend loads without errors
- ✅ Career assessment completes successfully
- ✅ Recommendations display with skills/tasks
- ✅ Admin can manage career paths
- ✅ Database operations work correctly

### **Full Functionality Testing**
- ✅ All modules work end-to-end
- ✅ User roles and permissions work
- ✅ Data persistence across sessions
- ✅ Error handling is graceful
- ✅ Performance is acceptable

---

## 📞 **Next Steps**

1. **Run Quick Tests**: Follow the manual test checklist
2. **Document Issues**: Use the test results template
3. **Fix Critical Issues**: Address any blocking problems
4. **Implement Missing Tests**: Create test files for Modules 5 & 6
5. **Set Up CI/CD**: Integrate automated testing

---

*This guide helps you quickly verify that your SkillX platform is working correctly before running the full test suite.*
