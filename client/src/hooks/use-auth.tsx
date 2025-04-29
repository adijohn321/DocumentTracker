import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as SelectUser, InsertUser } from "@shared/schema";
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

// Create the auth context with basic default values
const AuthContext = createContext<AuthContextType | null>(null);

// Hook for components to get the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Auth provider component to wrap the app
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<SelectUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check auth status on mount
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/user', { credentials: 'include' });
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Not authenticated, that's normal
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials: { username: string; password: string }) => {
    try {
      setError(null);
      console.log("Login attempt:", credentials.username);
      
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include"
      });
      
      if (!res.ok) {
        const errorData = await res.text();
        console.error("Login error:", errorData);
        throw new Error(errorData || "Login failed");
      }
      
      const userData = await res.json();
      console.log("Login successful:", userData.username);
      
      setUser(userData);
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (err) {
      console.error("Login error:", err);
      const error = err instanceof Error ? err : new Error('Login failed');
      setError(error);
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
      setError(null);
      console.log("Register attempt:", data.username);
      
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });
      
      if (!res.ok) {
        const errorData = await res.text();
        console.error("Registration error:", errorData);
        throw new Error(errorData || "Registration failed");
      }
      
      const userData = await res.json();
      console.log("Registration successful:", userData.username);
      
      setUser(userData);
      toast({
        title: "Registration successful",
        description: `Welcome to DocTrack, ${userData.name}!`,
      });
    } catch (err) {
      console.error("Registration error:", err);
      const error = err instanceof Error ? err : new Error('Registration failed');
      setError(error);
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
      setError(null);
      console.log("Logout attempt");
      
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
      });
      
      if (!res.ok) {
        const errorData = await res.text();
        console.error("Logout error:", errorData);
        throw new Error(errorData || "Logout failed");
      }
      
      console.log("Logout successful");
      setUser(null);
      toast({
        title: "Logged out successfully",
      });
    } catch (err) {
      console.error("Logout error:", err);
      const error = err instanceof Error ? err : new Error('Logout failed');
      setError(error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Return provider with context value
  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      error,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
