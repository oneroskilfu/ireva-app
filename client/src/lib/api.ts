// API client for iREVA platform authentication and data

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'investor' | 'admin';
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: number;
}

interface RefreshResponse {
  token: string;
  expiresAt: number;
}

class APIClient {
  private baseURL: string;
  private token: string | null;
  private refreshToken: string | null;
  private expiresAt: number | null;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.baseURL = '/api';
    this.token = localStorage.getItem('auth_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    this.expiresAt = this.getStoredExpiresAt();
    
    // Set up automatic token refresh check
    this.startTokenExpiryCheck();
  }

  private getStoredExpiresAt(): number | null {
    const stored = localStorage.getItem('token_expires_at');
    return stored ? parseInt(stored, 10) : null;
  }

  private startTokenExpiryCheck(): void {
    // Check token expiry every 30 seconds
    setInterval(() => {
      this.checkTokenExpiry();
    }, 30000);
  }

  private async checkTokenExpiry(): Promise<void> {
    if (!this.token || !this.expiresAt) return;

    const now = Date.now();
    const timeUntilExpiry = this.expiresAt - now;
    
    // Refresh token if it expires within 5 minutes (300000ms)
    if (timeUntilExpiry < 300000 && timeUntilExpiry > 0) {
      try {
        await this.refreshAuthToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.handleTokenExpiry();
      }
    } else if (timeUntilExpiry <= 0) {
      // Token has expired
      this.handleTokenExpiry();
    }
  }

  private handleTokenExpiry(): void {
    console.log('Session expired - logging out user');
    this.logout();
    
    // Notify user about session expiry
    const event = new CustomEvent('sessionExpired', {
      detail: { message: 'Your session has expired. Please log in again.' }
    });
    window.dispatchEvent(event);
    
    // Redirect to login page
    window.location.href = '/login';
  }

  private async refreshAuthToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      this.refreshPromise = null;
      return newToken;
    } catch (error) {
      this.refreshPromise = null;
      throw error;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data: RefreshResponse = await response.json();
    
    // Update stored tokens
    this.token = data.token;
    this.expiresAt = data.expiresAt;
    
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('token_expires_at', data.expiresAt.toString());
    
    console.log('Token refreshed successfully');
    return data.token;
  }

  // Set authorization header if token exists
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method with automatic token refresh
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Check if token needs refresh before making request
    if (this.token && this.expiresAt) {
      const now = Date.now();
      const timeUntilExpiry = this.expiresAt - now;
      
      // Refresh if token expires within 1 minute
      if (timeUntilExpiry < 60000 && timeUntilExpiry > 0) {
        try {
          await this.refreshAuthToken();
        } catch (error) {
          console.error('Auto token refresh failed:', error);
          this.handleTokenExpiry();
          throw error;
        }
      }
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    // Handle 401 responses (token expired)
    if (response.status === 401) {
      if (this.refreshToken && !endpoint.includes('/auth/refresh')) {
        try {
          await this.refreshAuthToken();
          // Retry the original request with new token
          return this.request<T>(endpoint, options);
        } catch (refreshError) {
          console.error('Token refresh failed on 401:', refreshError);
          this.handleTokenExpiry();
          throw new Error('Session expired');
        }
      } else {
        this.handleTokenExpiry();
        throw new Error('Unauthorized');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store tokens and user data
    this.token = response.token;
    this.refreshToken = response.refreshToken;
    this.expiresAt = response.expiresAt;
    
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('refresh_token', response.refreshToken);
    localStorage.setItem('token_expires_at', response.expiresAt.toString());
    localStorage.setItem('user_data', JSON.stringify(response.user));

    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'investor' | 'admin';
  }): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store token and user data
    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user_data', JSON.stringify(response.user));

    return response;
  }

  async getUserProfile(): Promise<User> {
    return this.request<User>('/auth/profile');
  }

  // Utility methods
  logout(): void {
    this.token = null;
    this.refreshToken = null;
    this.expiresAt = null;
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('user_data');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getUser(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // Properties methods
  async getProperties(): Promise<any[]> {
    return this.request<any[]>('/properties');
  }

  async getProperty(id: string): Promise<any> {
    return this.request<any>(`/properties/${id}`);
  }
}

// Export singleton instance
export const apiClient = new APIClient();