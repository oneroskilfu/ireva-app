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
  user: User;
}

class APIClient {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = '/api'; // Using relative URL for same-origin requests
    this.token = localStorage.getItem('auth_token');
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

  // Generic request method
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

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

    // Store token and user data
    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
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
    localStorage.removeItem('auth_token');
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