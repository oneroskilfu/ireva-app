# iREVA Feature Validation Guide

This document provides a structured approach to validate the newly implemented features in the iREVA platform.

## Bug Reporting & Issue Tracker

### User Perspective
1. Navigate to `/issues` to view the issue list
2. Click on "Report New Issue" button
3. Fill out the issue form with:
   - Title: "Test Issue"
   - Description: Provide detailed information about a test issue
   - Category: Select from dropdown
   - Priority: Select from dropdown
4. Submit the form and verify success message
5. Navigate back to issues list and verify the new issue appears
6. Click on the issue to view details
7. Add a comment to the issue
8. Verify the comment appears in the issue thread

### Admin Perspective
1. Log in as an admin
2. Navigate to `/issues` to access the admin issues dashboard
3. Verify you can see all reported issues with statistics
4. Use filters to filter issues by status, category, and priority
5. Select a specific issue to view details
6. Update the issue status to "In Progress"
7. Add an internal note visible only to admins
8. Verify the note is marked as internal
9. Verify the issue status change is reflected in the UI

## User Engagement Metrics Dashboard

### Admin Only
1. Log in as an admin
2. Navigate to `/admin/engagement-metrics`
3. Verify the dashboard loads with:
   - Total Users counter
   - Total Investments counter
   - Total Invested amount
   - ROI Redemption Rate
4. Check the "Investment Trends" tab and verify the chart displays
5. Check the "User Activity" tab and verify user activity by day
6. Check the "Investment Categories" tab and verify the pie chart
7. Check the "User Retention" tab and verify the retention line chart
8. Change the date range filter and verify the data updates
9. Test the export functionality if implemented

## Settings & Preference Customization

### User Settings
1. Navigate to `/account/settings`
2. Test updating profile information:
   - First Name
   - Last Name
   - Email (if editable)
   - Phone Number
   - Bio
   - Address information
3. Verify changes are saved successfully
4. Test notification preferences:
   - Toggle Email Notifications
   - Toggle SMS Notifications
   - Toggle In-App Notifications
   - Toggle specific notification types
5. Test security settings:
   - Change password (if implemented)
   - Toggle Two-Factor Authentication (if implemented)
   - Toggle Login Notifications
6. Verify changes are saved successfully

## Cross-Feature Testing

1. Report an issue, then check if notification appears
2. Update settings to disable notifications, then report another issue and verify no notification is sent
3. As an admin, respond to an issue, then verify the user receives a notification
4. Update profile information, then verify it appears correctly in the issue reporting form

## Mobile Responsiveness Testing

1. Access the platform on a mobile device or using browser dev tools mobile emulation
2. Test each of the following pages for proper mobile display:
   - Issues list
   - Issue detail
   - Issue reporting form
   - User engagement metrics dashboard (admin)
   - Settings page
3. Verify that:
   - No horizontal scrolling is required
   - All text is legible
   - Buttons and touch targets are adequately sized
   - Forms are usable on small screens

## Error Handling Testing

1. Try submitting forms with invalid data and verify error messages
2. Disconnect internet connection and test graceful failure handling
3. Test authentication timeout scenarios
4. Verify 404 pages for non-existent resources

## Performance Testing

1. Time page load performance for each main feature
2. Check memory usage in browser dev tools
3. Test with slow network conditions using browser throttling
4. Monitor API response times in browser network tab

## Cross-Browser Testing

1. Test all features in Chrome
2. Test all features in Firefox
3. Test all features in Safari (if available)
4. Test all features in Edge (if available)

## Final Validation Checklist

- [ ] All new features are functional
- [ ] Features work across different user roles (admin vs regular user)
- [ ] UI is consistent with the rest of the platform
- [ ] Mobile responsiveness is confirmed
- [ ] Error states are properly handled
- [ ] Performance is acceptable
- [ ] Cross-browser compatibility is verified