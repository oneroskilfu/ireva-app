# Secure Login Component Implementation Plan

## Overview
This document outlines the strategy for implementing a secure login component for admin and investor users in the iREVA real estate investment platform. The login system will provide role-based authentication with appropriate security measures and dashboard access control.

## Current System Analysis

### Database Schema
- The application uses PostgreSQL with Drizzle ORM
- User schema already includes:
  - Role-based access (`role` enum: 'admin', 'investor')
  - Password hashing capabilities
  - KYC status tracking
  - Profile information fields

### Authentication Mechanisms
- **Session-based auth**: Implemented with Express sessions and Passport.js
- **JWT-based auth**: JWT token generation and verification exists
- **Multiple middleware options**: Both session and JWT auth middlewares are available
- **Role enforcement**: Middleware for role-based access control exists

### Frontend Components
- Multiple authentication-related components exist but are inconsistently implemented
- Both session and token-based authentication hooks present
- Some protected routes are implemented but need standardization

## Implementation Plan

### 1. Standardize Authentication Strategy

#### Decision: Use JWT-based Authentication
- **Rationale**: 
  - Better suited for the React frontend
  - Stateless and scalable
  - Already has partial implementation in the codebase
  - Works well with the database schema

#### Implementation Steps:
1. Consolidate authentication utilities into a single service
2. Standardize on the JWT implementation in `server/auth-jwt.ts`
3. Ensure proper token validation, expiration handling, and refresh mechanisms

### 2. Backend Implementation

#### 2.1 Database Schema Verification
- Ensure user schema supports all required fields
- Add any missing indices for query optimization
- Use Drizzle ORM's built-in schema validation

#### 2.2 Authentication Endpoints
- Consolidate and standardize authentication routes:
  - `/api/auth/login` - Handle login requests
  - `/api/auth/register` - Handle registration requests
  - `/api/auth/logout` - Clear authentication
  - `/api/auth/me` - Get current user profile
  - `/api/auth/refresh` - Refresh JWT token

#### 2.3 Security Implementation
- Password hashing with scrypt (already implemented)
- Rate limiting on authentication endpoints
- CSRF protection
- Proper HTTP security headers
- Secure cookie settings when applicable

#### 2.4 Role-Based Access Control
- Standardize middleware for checking user roles
- Create separate admin and investor middleware
- Implement hierarchical role structure (admin > investor)

### 3. Frontend Implementation

#### 3.1 Authentication Context
- Create a unified authentication context using React Context API
- Implement robust token management (storage, refresh, expiration)
- Provide user state and authentication methods to all components

#### 3.2 Login Component
- Create a professionally designed login page with:
  - Username/email and password fields
  - Remember me option
  - Forgot password link
  - Registration link for new users
  - Visual feedback for authentication state
  - Error handling with clear user messages

#### 3.3 Protected Routes
- Implement a standardized protected route component
- Role-based access control at the route level
- Loading states while authentication is being verified
- Redirect to login page for unauthenticated users
- Redirect to proper dashboard based on user role

#### 3.4 Dashboard Access
- Create role-specific dashboard layouts:
  - Admin dashboard with administrative tools
  - Investor dashboard with investment portfolio view
- Implement navigation guards based on user roles
- Provide clear visual indicators of current user role

### 4. Security Best Practices

#### 4.1 Token Management
- Store tokens securely (httpOnly cookies when possible, localStorage as fallback)
- Implement token refresh mechanism
- Auto-logout on token expiration
- Clear tokens on logout

#### 4.2 User Experience
- Clear loading indicators during authentication
- Meaningful error messages for failed logins
- Account locking after multiple failed attempts
- Email notifications for suspicious login activities

#### 4.3 Security Monitoring
- Implement logging for authentication events
- Track failed login attempts
- Monitor for unusual login patterns
- Provide audit trail for admin activities

## Implementation Sequence

### Phase 1: Backend Authentication
1. Standardize JWT implementation
2. Implement/verify authentication endpoints
3. Add security measures (rate limiting, CSRF)
4. Test authentication flow with Postman/curl

### Phase 2: Frontend Authentication
1. Create authentication context provider
2. Build login/register forms
3. Implement protected route components
4. Add token refresh mechanism

### Phase 3: Role-Based Access
1. Implement role-based dashboards
2. Add role-specific navigation
3. Create admin and investor views
4. Test role separation and access control

### Phase 4: Security Enhancements
1. Add account lockout mechanism
2. Implement password strength requirements
3. Add activity logging
4. Perform security testing

## Code Samples

### JWT Authentication Middleware
```typescript
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid authorization format' 
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    
    // Validate payload with Zod
    const validationResult = userPayloadSchema.safeParse(decoded);
    
    if (!validationResult.success) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token payload' 
      });
    }
    
    // Attach validated user to request
    req.user = validationResult.data;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired', 
        code: 'TOKEN_EXPIRED' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
}
```

### Protected Route Component
```tsx
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Route } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  roles?: string[];
}

export function ProtectedRoute({ 
  path, 
  component: Component, 
  roles = [] 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check roles if specified
  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const homePath = user.role === 'admin' ? '/admin/dashboard' : '/investor/dashboard';
    return (
      <Route path={path}>
        <Redirect to={homePath} />
      </Route>
    );
  }

  // User is authenticated and authorized
  return <Route path={path} component={Component} />;
}
```

## Conclusion
This implementation plan provides a comprehensive approach to creating a secure, role-based authentication system for the iREVA platform. By standardizing on JWT authentication, implementing proper security measures, and creating a consistent user experience, we can ensure that both admin and investor users have secure and appropriate access to the platform's features.