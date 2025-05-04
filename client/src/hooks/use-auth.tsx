import { createContext, ReactNode, useContext, useState, useEffect } from 'react';

// Define the UserPayload type to match your JWT payload
interface UserPayload {
  id: string;
  email: string;
  role: 'admin' | 'investor';
  verified: boolean;
}

// Extended User interface with optional UI-related fields
interface User extends UserPayload {
  username?: string;
  fullName?: string;
  profileImage?: string;
}

// Authentication context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Mock user data for demonstration
const mockAdminUser: User = {
  id: '1',
  email: 'admin@example.com',
  role: 'admin',
  verified: true,
  username: 'admin',
  fullName: 'Admin User'
};

const mockInvestorUser: User = {
  id: '2',
  email: 'investor@example.com',
  role: 'investor',
  verified: true,
  username: 'investor',
  fullName: 'Investor User'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Simulate checking for stored auth
    const checkAuth = async () => {
      setIsLoading(true);
      // Here you would normally check localStorage or cookies for a token
      // and validate it with your backend
      
      // For this example, we'll just simulate a delay
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // In a real app, you would call your API endpoint here
    // For this example, we'll simulate a successful login based on email
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (email === 'admin@example.com') {
        setUser(mockAdminUser);
      } else if (email === 'investor@example.com') {
        setUser(mockInvestorUser);
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // In a real app, you would also call your API logout endpoint
    // and clear any stored tokens
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;