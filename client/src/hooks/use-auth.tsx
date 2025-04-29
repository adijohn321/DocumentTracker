import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define our auth context type
type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (data: InsertUser) => Promise<void>;
  logout: () => Promise<void>;
};

// Create the context with a more complete default value to avoid null checks
const defaultState: AuthContextType = {
  user: null,
  isLoading: true,
  error: null,
  login: async () => {
    throw new Error("login() not implemented");
  },
  register: async () => {
    throw new Error("register() not implemented");
  },
  logout: async () => {
    throw new Error("logout() not implemented");
  }
};

// Create the auth context
export const AuthContext = createContext<AuthContextType>(defaultState);

// Hook for components to get the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component to wrap the app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<SelectUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/user');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to check authentication'));
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: { username: string; password: string }) => {
    try {
      const res = await apiRequest("POST", "/api/login", credentials);
      const userData = await res.json();
      setUser(userData);
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Login failed');
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Register function
  const register = async (data: InsertUser) => {
    try {
      const res = await apiRequest("POST", "/api/register", data);
      const userData = await res.json();
      setUser(userData);
      toast({
        title: "Registration successful",
        description: `Welcome to DocTrack, ${userData.name}!`,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Registration failed');
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      setUser(null);
      toast({
        title: "Logged out successfully",
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Logout failed');
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Create context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    register,
    logout
  };

  // Return provider with context value
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
