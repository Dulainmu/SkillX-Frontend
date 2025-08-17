#!/bin/bash

# SkillX Platform - End-to-End Test Runner
# This script runs comprehensive E2E tests using Cypress

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print status function
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Check if running in CI environment
is_ci() {
    [ -n "$CI" ] || [ -n "$GITHUB_ACTIONS" ]
}

# Check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v cypress &> /dev/null; then
        print_warning "Cypress not found globally, will use local installation"
    fi
    
    print_success "Dependencies check completed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dependencies installed"
    else
        print_status "Dependencies already installed"
    fi
}

# Start development server
start_dev_server() {
    print_status "Starting development server..."
    
    # Check if server is already running
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        print_status "Development server already running on port 5173"
        return 0
    fi
    
    # Start server in background
    npm run dev &
    DEV_SERVER_PID=$!
    
    # Wait for server to start
    print_status "Waiting for development server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            print_success "Development server started successfully"
            return 0
        fi
        sleep 1
    done
    
    print_error "Failed to start development server"
    exit 1
}

# Start backend server
start_backend_server() {
    print_status "Starting backend server..."
    
    # Check if backend is already running
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        print_status "Backend server already running on port 3001"
        return 0
    fi
    
    # Navigate to backend directory and start server
    cd ../SkillX-Backend-main
    
    # Check if backend dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_status "Installing backend dependencies..."
        npm install
    fi
    
    # Start backend server in background
    npm start &
    BACKEND_SERVER_PID=$!
    
    # Wait for backend to start
    print_status "Waiting for backend server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
            print_success "Backend server started successfully"
            cd ../SkillX-Frontend-main
            return 0
        fi
        sleep 1
    done
    
    print_error "Failed to start backend server"
    exit 1
}

# Run specific test module
run_test_module() {
    local module=$1
    local module_name=""
    
    case $module in
        "module1")
            module_name="Career Assessment & Quiz System"
            test_path="cypress/e2e/module1/career-assessment.cy.ts"
            ;;
        "module2")
            module_name="Career Path & Learning Materials"
            test_path="cypress/e2e/module2/career-path-learning.cy.ts"
            ;;
        "module3")
            module_name="Project-Based Learning System"
            test_path="cypress/e2e/module3/project-learning.cy.ts"
            ;;
        "module4")
            module_name="Admin - Career Path Management"
            test_path="cypress/e2e/module4/admin-career-management.cy.ts"
            ;;
        "integration")
            module_name="Cross-Module Integration"
            test_path="cypress/e2e/integration/cross-module-integration.cy.ts"
            ;;
        *)
            print_error "Unknown module: $module"
            exit 1
            ;;
    esac
    
    print_header "Running E2E Tests: $module_name"
    
    if [ -f "$test_path" ]; then
        if is_ci; then
            npx cypress run --spec "$test_path" --headless
        else
            npx cypress run --spec "$test_path"
        fi
        
        if [ $? -eq 0 ]; then
            print_success "Module $module_name tests passed"
        else
            print_error "Module $module_name tests failed"
            return 1
        fi
    else
        print_error "Test file not found: $test_path"
        return 1
    fi
}

# Run all E2E tests
run_all_e2e_tests() {
    print_header "Running All E2E Tests"
    
    local failed_modules=()
    
    # Run each module
    for module in "module1" "module2" "module3" "module4" "integration"; do
        if ! run_test_module "$module"; then
            failed_modules+=("$module")
        fi
    done
    
    # Report results
    if [ ${#failed_modules[@]} -eq 0 ]; then
        print_success "All E2E tests passed!"
        return 0
    else
        print_error "The following modules failed: ${failed_modules[*]}"
        return 1
    fi
}

# Run tests with UI
run_tests_with_ui() {
    print_header "Opening Cypress Test Runner"
    npx cypress open
}

# Generate test report
generate_test_report() {
    print_status "Generating test report..."
    
    # Create reports directory
    mkdir -p cypress/reports
    
    # Generate HTML report if mochawesome is available
    if npm list mochawesome-merge > /dev/null 2>&1; then
        npx mochawesome-merge cypress/results/*.json > cypress/reports/combined-report.json
        npx marge cypress/reports/combined-report.json -o cypress/reports
        print_success "HTML report generated: cypress/reports/combined-report.html"
    else
        print_warning "mochawesome not installed, skipping HTML report generation"
    fi
    
    # Generate summary report
    cat > cypress/reports/e2e-test-summary.md << EOF
# SkillX Platform - E2E Test Summary

## Test Execution Summary
- **Date**: $(date)
- **Environment**: $(is_ci && echo "CI/CD" || echo "Local")
- **Node Version**: $(node --version)
- **Cypress Version**: $(npx cypress --version | head -n 1)

## Test Coverage
- ✅ Module 1: Career Assessment & Quiz System
- ✅ Module 2: Career Path & Learning Materials  
- ✅ Module 3: Project-Based Learning System
- ✅ Module 4: Admin - Career Path Management
- ✅ Cross-Module Integration Tests

## Test Cases Covered
- TC_AUTO_001: Login Functionality Test
- TC_AUTO_002: Quiz Questions Loading Test
- TC_AUTO_003: Answer Validation Test
- TC_AUTO_004: Career Recommendation Engine Test
- TC_AUTO_005: Skills Rating System Test
- TC_AUTO_006: Career Path Selection Test
- TC_AUTO_007: Learning Materials Access Test
- TC_AUTO_008: Progress Tracking Test
- TC_AUTO_009: Skill Prerequisite Validation Test
- TC_AUTO_010: Project Assignment Logic Test
- TC_AUTO_011: Project Submission Workflow Test
- TC_AUTO_012: Mentor Integration Test
- TC_AUTO_013: Admin Access Control Test
- TC_AUTO_014: Career Path CRUD Operations Test
- TC_AUTO_015: Form Validation Test
- TC_INT_001: Complete User Journey Test
- TC_INT_002: Data Consistency Test
- TC_INT_003: Role-Based Access Test
- TC_INT_004: End-to-End Workflow Test

## Manual Test Cases
The following test cases require manual verification:

### Module 1: Career Assessment & Quiz System
- TC_MANUAL_001: User Interface Validation
- TC_MANUAL_002: Quiz Content Quality Check

### Module 2: Career Path & Learning Materials
- TC_MANUAL_003: Learning Path Logic Validation
- TC_MANUAL_004: Content Quality Assessment

### Module 3: Project-Based Learning System
- TC_MANUAL_005: Project Quality and Relevance
- TC_MANUAL_006: Mentor Experience Testing

### Module 4: Admin - Career Path Management
- TC_MANUAL_007: Admin Interface Usability

### Module 5: Admin - Learning Materials Management
- TC_MANUAL_008: Content Management Workflow

### Module 6: Admin - Project Management
- TC_MANUAL_009: Project Management Workflow

## Next Steps
1. Review automated test results
2. Execute manual test cases
3. Address any failed tests
4. Update test cases as needed
EOF

    print_success "Test summary generated: cypress/reports/e2e-test-summary.md"
}

# Show manual test checklist
show_manual_test_checklist() {
    print_header "Manual Test Checklist"
    
    cat << 'EOF'

## Module 1: Career Assessment & Quiz System

### TC_MANUAL_001: User Interface Validation
- [ ] Navigate through all quiz-related pages
- [ ] Check layouts on different screen sizes (desktop, tablet, mobile)
- [ ] Verify colors, fonts, and button placements
- [ ] Test accessibility features (screen reader compatibility)
- [ ] Verify responsive design works correctly
- [ ] Check loading states and transitions

### TC_MANUAL_002: Quiz Content Quality Check
- [ ] Review all available quiz questions
- [ ] Check if questions are clearly worded
- [ ] Verify answer options make sense
- [ ] Ensure questions cover relevant career areas
- [ ] Check for any biased or inappropriate content
- [ ] Verify question difficulty progression

## Module 2: Career Path & Learning Materials

### TC_MANUAL_003: Learning Path Logic Validation
- [ ] Review different career paths
- [ ] Check the sequence of learning materials
- [ ] Verify prerequisites make sense
- [ ] Ensure difficulty progression is appropriate
- [ ] Check for logical flow between steps
- [ ] Verify learning objectives are clear

### TC_MANUAL_004: Content Quality Assessment
- [ ] Sample materials from different career paths
- [ ] Check if content is current and accurate
- [ ] Verify external links are working
- [ ] Assess material difficulty levels
- [ ] Check for broken media (videos, images)
- [ ] Verify content accessibility

## Module 3: Project-Based Learning System

### TC_MANUAL_005: Project Quality and Relevance
- [ ] Review project descriptions and requirements
- [ ] Assess project complexity and learning objectives
- [ ] Check if projects reflect real-world scenarios
- [ ] Verify project instructions are clear
- [ ] Check for appropriate skill level requirements
- [ ] Assess project deliverables

### TC_MANUAL_006: Mentor Experience Testing
- [ ] Log in as a mentor
- [ ] Review submitted projects
- [ ] Provide feedback using the system
- [ ] Check communication tools
- [ ] Test mentor dashboard functionality
- [ ] Verify feedback submission process

## Module 4: Admin - Career Path Management

### TC_MANUAL_007: Admin Interface Usability
- [ ] Navigate through admin dashboard
- [ ] Test all management functions
- [ ] Check search and filter capabilities
- [ ] Assess workflow efficiency
- [ ] Test bulk operations
- [ ] Verify data export functionality

## Module 5: Admin - Learning Materials Management

### TC_MANUAL_008: Content Management Workflow
- [ ] Test the complete workflow for adding new materials
- [ ] Check search and filtering capabilities
- [ ] Test bulk operations if available
- [ ] Verify organization and categorization
- [ ] Test file upload functionality
- [ ] Check content preview features

## Module 6: Admin - Project Management

### TC_MANUAL_009: Project Management Workflow
- [ ] Create project as admin
- [ ] Assign to skill levels
- [ ] Monitor learner engagement with projects
- [ ] Review submission and feedback process
- [ ] Test project analytics
- [ ] Verify project lifecycle management

## Cross-Module Integration

### Additional Manual Verification
- [ ] Test complete user journey from registration to completion
- [ ] Verify data consistency across all modules
- [ ] Test role-based access control
- [ ] Check error handling and recovery
- [ ] Test performance under load
- [ ] Verify security measures

EOF
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    
    # Kill development server if running
    if [ -n "$DEV_SERVER_PID" ]; then
        kill $DEV_SERVER_PID 2>/dev/null || true
        print_status "Development server stopped"
    fi
    
    # Kill backend server if running
    if [ -n "$BACKEND_SERVER_PID" ]; then
        kill $BACKEND_SERVER_PID 2>/dev/null || true
        print_status "Backend server stopped"
    fi
}

# Show help
show_help() {
    cat << 'EOF'
SkillX Platform - E2E Test Runner

Usage: ./run-e2e-tests.sh [OPTIONS]

Options:
    -h, --help              Show this help message
    -m, --module MODULE     Run tests for specific module (module1|module2|module3|module4|integration)
    -a, --all               Run all E2E tests (default)
    -u, --ui                Open Cypress Test Runner UI
    -r, --report            Generate test report
    -c, --checklist         Show manual test checklist
    --no-server             Don't start development servers (assumes they're already running)
    --ci                    Run in CI mode (headless)

Examples:
    ./run-e2e-tests.sh                    # Run all tests
    ./run-e2e-tests.sh -m module1         # Run only career assessment tests
    ./run-e2e-tests.sh -u                 # Open Cypress UI
    ./run-e2e-tests.sh -r                 # Generate test report
    ./run-e2e-tests.sh -c                 # Show manual test checklist

Available Modules:
    module1     - Career Assessment & Quiz System
    module2     - Career Path & Learning Materials
    module3     - Project-Based Learning System
    module4     - Admin - Career Path Management
    integration - Cross-Module Integration Tests

EOF
}

# Main function
main() {
    local run_all=true
    local run_ui=false
    local generate_report=false
    local show_checklist=false
    local start_servers=true
    local ci_mode=false
    local module=""
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -m|--module)
                module="$2"
                run_all=false
                shift 2
                ;;
            -a|--all)
                run_all=true
                shift
                ;;
            -u|--ui)
                run_ui=true
                run_all=false
                shift
                ;;
            -r|--report)
                generate_report=true
                run_all=false
                shift
                ;;
            -c|--checklist)
                show_checklist=true
                run_all=false
                shift
                ;;
            --no-server)
                start_servers=false
                shift
                ;;
            --ci)
                ci_mode=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Set trap for cleanup
    trap cleanup EXIT
    
    print_header "SkillX Platform - E2E Test Runner"
    
    # Check dependencies
    check_dependencies
    
    # Install dependencies
    install_dependencies
    
    # Start servers if needed
    if [ "$start_servers" = true ]; then
        start_backend_server
        start_dev_server
    fi
    
    # Execute requested action
    if [ "$show_checklist" = true ]; then
        show_manual_test_checklist
    elif [ "$generate_report" = true ]; then
        generate_test_report
    elif [ "$run_ui" = true ]; then
        run_tests_with_ui
    elif [ "$run_all" = true ]; then
        run_all_e2e_tests
    elif [ -n "$module" ]; then
        run_test_module "$module"
    fi
    
    print_header "E2E Test Execution Completed"
}

# Run main function with all arguments
main "$@"
