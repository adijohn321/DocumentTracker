import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as SelectUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Global auth state (simple approach)
let currentUser: SelectUser | null = null;
let isLoadingAuth = true;

// Define our auth context type
interface AuthContextType {
  user: SelectUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

// Create a default context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  logout: async () => {}
});

// Export the hook for easy access to auth state
export function useAuth() {
  return useContext(AuthContext);
}

// Auth provider component to wrap the app
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<SelectUser | null>(currentUser);
  const [isLoading, setIsLoading] = useState(isLoadingAuth);

  // Check auth status on mount
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/user', { credentials: 'include' });
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          currentUser = userData;
        } else {
          setUser(null);
          currentUser = null;
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setUser(null);
        currentUser = null;
      } finally {
        setIsLoading(false);
        isLoadingAuth = false;
      }
    }

    checkAuthStatus();
  }, []);

  // Logout function
  const logout = async () => {
    try {
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
      currentUser = null;
      toast({
        title: "Logged out successfully",
      });
      
      // Redirect to login page
      window.location.href = '/auth';
    } catch (err) {
      console.error("Logout error:", err);
      toast({
        title: "Logout failed",
        description: err instanceof Error ? err.message : "Failed to logout",
        variant: "destructive",
      });
    }
  };

  // Use our global auth state
  useEffect(() => {
    if (currentUser !== user) {
      setUser(currentUser);
    }
    if (isLoadingAuth !== isLoading) {
      setIsLoading(isLoadingAuth);
    }
  }, [currentUser, isLoadingAuth]);

  // Return provider with simplified context value
  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Helper function to update global auth state from App.tsx
export function updateAuthState(userData: SelectUser | null) {
  currentUser = userData;
  isLoadingAuth = false;
}
