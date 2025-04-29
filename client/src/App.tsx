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

function App() {
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
