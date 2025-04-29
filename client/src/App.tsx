import { TooltipProvider } from "@/components/ui/tooltip";
import AuthPage from "@/pages/auth-page";

// The simplest app possible - just show the auth page
function App() {
  return (
    <TooltipProvider>
      <AuthPage />
    </TooltipProvider>
  );
}

export default App;
