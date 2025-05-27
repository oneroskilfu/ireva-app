# iREVA Platform - Complete Manual Testing Guide

This guide provides step-by-step instructions for testing the complete user journey on the iREVA real estate investment platform.

## 🎯 Testing Objectives

Validate the complete investor journey:
1. **User Registration & Authentication**
2. **Profile Completion**
3. **Property Discovery & Viewing**
4. **Investment Application Process**
5. **KYC Verification Workflow**
6. **Admin Management Functions**

---

## 🔐 Test Setup Requirements

### Prerequisites
- [ ] Platform deployed and accessible
- [ ] Database connected and initialized
- [ ] Email service configured (for verification emails)
- [ ] Admin account created
- [ ] Test payment methods ready (if integrated)

### Test Data Preparation
```
Investor Test User:
- Email: investor.test@example.com
- Password: TestInvestor123!
- Name: John Test Investor

Admin Test User:
- Email: admin.test@example.com
- Password: TestAdmin123!
- Name: Admin Test User

Test Property Data:
- Title: Lagos Premium Apartments
- Location: Victoria Island, Lagos
- Price: ₦5,000,000 minimum investment
- Type: Residential
```

---

## 📋 Complete User Flow Testing

### Phase 1: User Registration & Authentication

#### Test 1.1: New User Registration
**Objective**: Verify new users can register successfully

**Steps**:
1. Navigate to homepage
2. Click "Sign Up" or "Get Started"
3. Fill registration form:
   - Email: `investor.test@example.com`
   - Password: `TestInvestor123!`
   - First Name: `John`
   - Last Name: `Investor`
   - Role: `Investor` (default)
4. Click "Register"

**Expected Results**:
- [ ] Registration form validates input
- [ ] Strong password requirements enforced
- [ ] Success message displayed
- [ ] User automatically logged in
- [ ] Redirected to investor dashboard
- [ ] Welcome email sent (if configured)

**Error Cases to Test**:
- [ ] Weak password rejection
- [ ] Invalid email format rejection
- [ ] Duplicate email registration attempt
- [ ] Missing required fields

#### Test 1.2: User Login
**Objective**: Verify existing users can log in

**Steps**:
1. Navigate to login page
2. Enter credentials:
   - Email: `investor.test@example.com`
   - Password: `TestInvestor123!`
3. Click "Login"

**Expected Results**:
- [ ] Login successful
- [ ] JWT token received and stored
- [ ] User redirected to appropriate dashboard
- [ ] User info displayed correctly
- [ ] Session persists on page refresh

**Error Cases to Test**:
- [ ] Wrong password rejection
- [ ] Non-existent email rejection
- [ ] Empty fields validation

#### Test 1.3: Authentication Persistence
**Objective**: Verify authentication state persists

**Steps**:
1. Login successfully
2. Refresh the page
3. Navigate to different pages
4. Close and reopen browser
5. Return to site

**Expected Results**:
- [ ] User remains logged in after page refresh
- [ ] Protected routes accessible
- [ ] User data persists across navigation
- [ ] Session expires appropriately (if configured)

---

### Phase 2: Profile Completion

#### Test 2.1: Complete User Profile
**Objective**: Verify users can complete their profiles

**Steps**:
1. Navigate to profile page
2. Fill out personal information:
   - Phone: `+234 803 123 4567`
   - Address: `123 Test Street, Lagos`
   - Date of Birth: `1990-01-15`
3. Add employment information:
   - Occupation: `Software Engineer`
   - Annual Income: `₦6,000,000`
   - Employer: `Tech Company Ltd`
4. Save profile

**Expected Results**:
- [ ] All fields save correctly
- [ ] Profile completion status updates
- [ ] Input validation works properly
- [ ] Success confirmation displayed
- [ ] Profile data persists

---

### Phase 3: Property Discovery

#### Test 3.1: Browse Properties
**Objective**: Verify users can view available properties

**Steps**:
1. Navigate to properties page
2. Browse property listings
3. Use filters:
   - Location: Lagos
   - Price range: ₦1M - ₦10M
   - Property type: Residential
4. Sort properties by price/ROI

**Expected Results**:
- [ ] Properties display correctly
- [ ] Images load properly
- [ ] Filters work as expected
- [ ] Sorting functions correctly
- [ ] Property cards show key information
- [ ] Pagination works (if applicable)

#### Test 3.2: View Property Details
**Objective**: Verify detailed property information displays

**Steps**:
1. Click on a property from listings
2. Review property details page
3. Check all sections:
   - Property description
   - Investment details
   - Location information
   - Expected returns
   - Risk factors
4. View property images/gallery

**Expected Results**:
- [ ] Property details load completely
- [ ] All information displays correctly
- [ ] Images/gallery functions properly
- [ ] Investment calculator works (if present)
- [ ] Contact/interest buttons visible

---

### Phase 4: Investment Application

#### Test 4.1: Investment Interest
**Objective**: Verify users can express investment interest

**Steps**:
1. On property details page
2. Click "Invest Now" or "Express Interest"
3. Select investment amount: `₦5,000,000`
4. Review investment summary
5. Proceed to application

**Expected Results**:
- [ ] Investment form opens correctly
- [ ] Amount validation works
- [ ] Summary calculation accurate
- [ ] Terms and conditions displayed
- [ ] Next step clearly indicated

#### Test 4.2: Investment Application Process
**Objective**: Test the complete investment application

**Steps**:
1. Complete investment application form
2. Upload required documents (if any)
3. Review application summary
4. Submit application

**Expected Results**:
- [ ] Form validates all required fields
- [ ] File uploads work properly
- [ ] Application summary accurate
- [ ] Submission confirmation received
- [ ] Application status trackable

---

### Phase 5: KYC Verification Process

#### Test 5.1: KYC Form Completion
**Objective**: Verify KYC submission process

**Steps**:
1. Navigate to KYC section
2. Complete personal information
3. Add employment details
4. Enter bank account information
5. Upload required documents:
   - Identity document (passport/ID)
   - Proof of address (utility bill)
   - Proof of income (bank statement)
   - Bank statement

**Expected Results**:
- [ ] All form sections save properly
- [ ] File uploads successful
- [ ] Document validation works
- [ ] Progress tracking visible
- [ ] Submission confirmation received

#### Test 5.2: KYC Status Tracking
**Objective**: Verify users can track KYC status

**Steps**:
1. Submit KYC documents
2. Check KYC status in dashboard
3. View document status individually
4. Check for status updates

**Expected Results**:
- [ ] Status displays correctly (Pending/Under Review)
- [ ] Individual document status visible
- [ ] Status badges/indicators clear
- [ ] Expected timeline communicated

---

### Phase 6: Dashboard Functionality

#### Test 6.1: Investor Dashboard
**Objective**: Verify investor dashboard completeness

**Steps**:
1. Access investor dashboard
2. Review all sections:
   - Portfolio overview
   - Investment summary
   - KYC status
   - Recent activity
   - Account balance (if applicable)

**Expected Results**:
- [ ] All data displays correctly
- [ ] Charts/graphs render properly
- [ ] Navigation works smoothly
- [ ] Real-time data updates
- [ ] Mobile responsive design

#### Test 6.2: Investment Portfolio Tracking
**Objective**: Test portfolio management features

**Steps**:
1. View investment portfolio
2. Check individual investment details
3. Review performance metrics
4. Download investment reports

**Expected Results**:
- [ ] Portfolio summary accurate
- [ ] Individual investments tracked
- [ ] Performance data correct
- [ ] Export functionality works

---

### Phase 7: Admin Functions Testing

#### Test 7.1: Admin Authentication
**Objective**: Verify admin access controls

**Steps**:
1. Login as admin user
2. Access admin dashboard
3. Verify admin-only features visible
4. Test role-based restrictions

**Expected Results**:
- [ ] Admin successfully authenticated
- [ ] Admin dashboard accessible
- [ ] Investor users cannot access admin features
- [ ] Role-based navigation works

#### Test 7.2: User Management
**Objective**: Test admin user management capabilities

**Steps**:
1. Access user management section
2. View user list
3. Search/filter users
4. View user details
5. Update user status (if permitted)

**Expected Results**:
- [ ] User list displays correctly
- [ ] Search/filter functions work
- [ ] User details accessible
- [ ] Status updates reflect properly
- [ ] Audit logs created for changes

#### Test 7.3: KYC Review Process
**Objective**: Test admin KYC review workflow

**Steps**:
1. Access KYC management section
2. View pending KYC submissions
3. Review submitted documents
4. Approve/reject KYC application
5. Add review comments

**Expected Results**:
- [ ] Pending submissions visible
- [ ] Documents viewable/downloadable
- [ ] Approval/rejection process works
- [ ] Comments save correctly
- [ ] User notifications sent
- [ ] Status updates in user dashboard

#### Test 7.4: Property Management
**Objective**: Verify admin property management

**Steps**:
1. Access property management
2. Create new property listing
3. Edit existing property
4. Update property status
5. View property analytics

**Expected Results**:
- [ ] Property creation successful
- [ ] All fields save correctly
- [ ] Image uploads work
- [ ] Status updates reflect
- [ ] Analytics display properly

---

## 🔧 Technical Testing

### Performance Testing
- [ ] Page load times under 3 seconds
- [ ] Image optimization working
- [ ] Database queries efficient
- [ ] API response times acceptable

### Security Testing
- [ ] SQL injection protection active
- [ ] XSS protection working
- [ ] CSRF tokens present
- [ ] Authentication required for protected routes
- [ ] Role-based access working

### Mobile Responsiveness
- [ ] Mobile layout proper
- [ ] Touch interactions work
- [ ] Forms usable on mobile
- [ ] Images scale correctly

### Browser Compatibility
- [ ] Chrome functionality
- [ ] Firefox compatibility
- [ ] Safari testing
- [ ] Edge browser support

---

## 🚨 Error Scenarios Testing

### Network Issues
- [ ] Offline mode handling
- [ ] Slow connection behavior
- [ ] Failed API requests handling
- [ ] Timeout error messages

### Data Validation
- [ ] Required field validation
- [ ] Format validation (email, phone)
- [ ] File size/type restrictions
- [ ] Character limits enforced

### Edge Cases
- [ ] Empty states display
- [ ] Very long text handling
- [ ] Special characters in input
- [ ] Large file uploads

---

## 📊 Test Results Documentation

### Test Execution Log
```
Date: ___________
Tester: ___________
Environment: ___________

Phase 1 Results:
✅ Registration: PASS/FAIL
✅ Login: PASS/FAIL
✅ Authentication: PASS/FAIL

Phase 2 Results:
✅ Profile Completion: PASS/FAIL

Phase 3 Results:
✅ Property Browse: PASS/FAIL
✅ Property Details: PASS/FAIL

Phase 4 Results:
✅ Investment Process: PASS/FAIL

Phase 5 Results:
✅ KYC Submission: PASS/FAIL
✅ KYC Tracking: PASS/FAIL

Phase 6 Results:
✅ Investor Dashboard: PASS/FAIL
✅ Portfolio Tracking: PASS/FAIL

Phase 7 Results:
✅ Admin Authentication: PASS/FAIL
✅ User Management: PASS/FAIL
✅ KYC Review: PASS/FAIL
✅ Property Management: PASS/FAIL
```

### Issues Found
```
Issue #1:
Description: ___________
Steps to Reproduce: ___________
Expected vs Actual: ___________
Severity: Critical/High/Medium/Low
```

---

## ✅ Go-Live Checklist

Before production deployment:

### Security
- [ ] All environment variables properly set
- [ ] JWT secrets generated and secure
- [ ] HTTPS enabled and working
- [ ] CORS properly configured
- [ ] Rate limiting active

### Data Protection
- [ ] Database backups configured
- [ ] Admin-only destructive operations protected
- [ ] Audit logging enabled
- [ ] Input validation comprehensive

### Monitoring
- [ ] Error tracking active (Sentry)
- [ ] Performance monitoring enabled
- [ ] User analytics configured
- [ ] Health checks responding

### Documentation
- [ ] API documentation complete
- [ ] User guides available
- [ ] Admin documentation ready
- [ ] Support procedures documented

---

**Testing completed successfully? Your iREVA platform is ready for Nigerian investors! 🚀**

For any issues found during testing, prioritize by severity and fix critical/high issues before launch. Medium/low issues can be addressed post-launch based on user feedback.