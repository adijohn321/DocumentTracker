import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

// This is a simplified version of the protected route component
// It renders the Route directly and handles auth in the component
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
        try {
          const { user, isLoading } = useAuth();

          if (isLoading) {
            return (
              <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-border" />
              </div>
            );
          }

          if (!user) {
            return <Redirect to="/auth" />;
          }

          return <Component />;
        } catch (error) {
          // If there's an error with authentication, redirect to auth page
          console.error("Auth error:", error);
          return <Redirect to="/auth" />;
        }
      }}
    />
  );
}
