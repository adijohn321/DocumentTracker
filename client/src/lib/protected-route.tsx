import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

// Protected route component that redirects to auth page if user is not authenticated
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  return (
    <Route
      path={path}
      component={() => {
        // Get auth state from our hook
        const { user, isLoading } = useAuth();

        // Show loading spinner while checking auth
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }

        // Redirect to auth page if not logged in
        if (!user) {
          return <Redirect to="/auth" />;
        }

        // Render the protected component if user is authenticated
        return <Component />;
      }}
    />
  );
}
