import { Switch, Route, useLocation } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { AuthProvider, updateAuthState } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import DocumentsPage from "@/pages/documents-page";
import DocumentDetailPage from "@/pages/document-detail-page";
import CreateDocumentPage from "@/pages/create-document-page";
import DepartmentsPage from "@/pages/departments-page";
import DocumentTypesPage from "@/pages/document-types-page";
import AnalyticsPage from "@/pages/analytics-page";
import SettingsPage from "@/pages/settings-page";
import { User as SelectUser } from "@shared/schema";

// Simple app with routes
function App() {
  const [user, setUser] = useState<SelectUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useLocation();
  
  // Check if user is logged in on mount
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          updateAuthState(userData); // Update the global auth state
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
        if (!user) {
          updateAuthState(null); // Ensure global state is also updated
        }
      }
    }
    
    checkAuthStatus();
  }, []);
  
  // Pass auth state to AuthPage
  const handleAuthSuccess = (userData: SelectUser) => {
    setUser(userData);
    updateAuthState(userData); // Update the global auth state
    setLocation('/');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <AuthProvider>
      <TooltipProvider>
        <Switch>
          {!user ? (
            // Public routes - only accessible when not logged in
            <>
              <Route path="/auth">
                <AuthPage onAuthSuccess={handleAuthSuccess} />
              </Route>
              <Route path="/">
                <AuthPage onAuthSuccess={handleAuthSuccess} />
              </Route>
            </>
          ) : (
            // Protected routes - only accessible when logged in
            <>
              <Route path="/" component={DashboardPage} />
              <Route path="/documents" component={DocumentsPage} />
              <Route path="/documents/:id" component={DocumentDetailPage} />
              <Route path="/create-document" component={CreateDocumentPage} />
              <Route path="/departments" component={DepartmentsPage} />
              <Route path="/document-types" component={DocumentTypesPage} />
              <Route path="/analytics" component={AnalyticsPage} />
              <Route path="/settings" component={SettingsPage} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
