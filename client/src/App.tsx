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

function App() {
  return (
    <TooltipProvider>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/" component={DashboardPage} />
        <Route path="/documents" component={DocumentsPage} />
        <Route path="/documents/:id" component={DocumentDetailPage} />
        <Route path="/create-document" component={CreateDocumentPage} />
        <Route path="/departments" component={DepartmentsPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </TooltipProvider>
  );
}

export default App;
