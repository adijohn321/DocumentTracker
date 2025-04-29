import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// We need to fix the order - AuthProvider should be inside QueryClientProvider
// and Toaster should be last since it depends on components that might use 
// toast notifications
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
  </QueryClientProvider>
);
