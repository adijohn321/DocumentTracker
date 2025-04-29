import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import DocumentsPage from "@/pages/documents-page";
import DocumentDetailPage from "@/pages/document-detail-page";
import CreateDocumentPage from "@/pages/create-document-page";
import DepartmentsPage from "@/pages/departments-page";
import AnalyticsPage from "@/pages/analytics-page";
import SettingsPage from "@/pages/settings-page";
import { ProtectedRoute } from "@/lib/protected-route";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function App() {
  const { isLoading } = useAuth();
  const [initialized, setInitialized] = useState(false);

  // Once we've checked authentication status, initialize the app
  useEffect(() => {
    if (!isLoading) {
      setInitialized(true);
    }
  }, [isLoading]);

  // Show loading indicator while checking auth status
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/" component={DashboardPage} />
        <ProtectedRoute path="/documents" component={DocumentsPage} />
        <ProtectedRoute path="/documents/:id" component={DocumentDetailPage} />
        <ProtectedRoute path="/create-document" component={CreateDocumentPage} />
        <ProtectedRoute path="/departments" component={DepartmentsPage} />
        <ProtectedRoute path="/analytics" component={AnalyticsPage} />
        <ProtectedRoute path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </TooltipProvider>
  );
}

export default App;
