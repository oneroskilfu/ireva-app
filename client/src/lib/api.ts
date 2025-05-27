// API Client for iREVA Platform
// Handles authentication, property data, and secure API communication

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'investor' | 'admin';
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'investor' | 'admin';
  };
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  expectedReturn: number;
  description: string;
  images: string[];
  status: 'available' | 'funded' | 'completed';
  fundingProgress: number;
  minimumInvestment: number;
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get stored JWT token
  private getToken(): string | null {
    return localStorage.getItem('iREVA_token');
  }

  // Store JWT token
  private setToken(token: string): void {
    localStorage.setItem('iREVA_token', token);
  }

  // Remove JWT token
  private removeToken(): void {
    localStorage.removeItem('iREVA_token');
    localStorage.removeItem('iREVA_user');
  }

  // Store user data
  private setUser(user: any): void {
    localStorage.setItem('iREVA_user', JSON.stringify(user));
  }

  // Get stored user data
  getUser(): any {
    const userData = localStorage.getItem('iREVA_user');
    return userData ? JSON.parse(userData) : null;
  }

  // Create request headers with authentication
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.logout();
          throw new Error('Session expired. Please login again.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication Methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token and user data
    this.setToken(response.token);
    this.setUser(response.user);

    return response;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store token and user data
    this.setToken(response.token);
    this.setUser(response.user);

    return response;
  }

  logout(): void {
    this.removeToken();
    // Redirect to home page
    window.location.href = '/';
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Property Methods
  async getProperties(): Promise<Property[]> {
    return this.request<Property[]>('/properties');
  }

  async getProperty(id: string): Promise<Property> {
    return this.request<Property>(`/properties/${id}`);
  }

  // Investment Methods
  async invest(propertyId: string, amount: number): Promise<any> {
    return this.request('/investments', {
      method: 'POST',
      body: JSON.stringify({ propertyId, amount }),
    });
  }

  async getUserInvestments(): Promise<any[]> {
    return this.request<any[]>('/investments/my-investments');
  }

  // Profile Methods
  async getUserProfile(): Promise<any> {
    return this.request('/auth/profile');
  }

  async updateProfile(data: any): Promise<any> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;