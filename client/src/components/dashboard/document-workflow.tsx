import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface WorkflowStep {
  departmentId: number;
  departmentName: string;
  status: "completed" | "in_progress" | "pending";
  time?: string;
  description?: string;
}

export function DocumentWorkflow() {
  // Example query - this would be replaced with a real document workflow query
  const { data: document, isLoading } = useQuery({
    queryKey: ["/api/documents/recent"],
    select: (data) => data && data.length > 0 ? data[0] : null
  });

  // In a real application, this would fetch the full workflow for the selected document
  // For now, we'll create a mock workflow based on our design reference
  const workflowSteps: WorkflowStep[] = [
    {
      departmentId: 1,
      departmentName: "Reception",
      status: "completed",
      time: "2 hrs ago",
      description: "Document registration and initial processing"
    },
    {
      departmentId: 2,
      departmentName: "Cardiology",
      status: "in_progress",
      time: "Now",
      description: "Medical review and processing"
    },
    {
      departmentId: 6,
      departmentName: "Nursing",
      status: "pending",
      description: "Patient care coordination"
    },
    {
      departmentId: 7,
      departmentName: "Administration",
      status: "pending",
      description: "Final approval and document archiving"
    }
  ];

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-medium text-neutral-900">Document Workflow</h2>
        </div>
        <div className="p-5 h-80 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-5 py-4 border-b border-neutral-200">
        <h2 className="text-lg font-medium text-neutral-900">Document Workflow</h2>
      </div>
      <div className="p-5 h-80">
        <div className="flex flex-col h-full overflow-y-auto space-y-4">
          {workflowSteps.map((step) => (
            <div 
              key={step.departmentId}
              className={cn(
                "p-4 border rounded-lg relative",
                step.status === "in_progress" ? "border-2 border-primary-500 bg-primary-50" : "border-neutral-200",
                step.status === "pending" ? "opacity-70" : ""
              )}
            >
              <div 
                className={cn(
                  "absolute top-1 right-1 h-3 w-3 rounded-full",
                  step.status === "completed" ? "bg-success" : "",
                  step.status === "in_progress" ? "bg-accent-500 animate-pulse" : "",
                  step.status === "pending" ? "bg-neutral-300" : ""
                )}
              />
              <h3 className="text-sm font-medium text-neutral-700">{step.departmentName}</h3>
              <p className="mt-1 text-sm text-neutral-500">{step.description}</p>
              <div className="mt-2 flex justify-between items-center">
                <span 
                  className={cn(
                    "text-xs font-medium",
                    step.status === "completed" ? "text-success" : "",
                    step.status === "in_progress" ? "text-accent-500" : "",
                    step.status === "pending" ? "text-neutral-500" : ""
                  )}
                >
                  {step.status === "completed" && "Completed"}
                  {step.status === "in_progress" && "In Progress"}
                  {step.status === "pending" && "Pending"}
                </span>
                <span className="text-xs text-neutral-500">{step.time || "--"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-neutral-50 px-5 py-3 border-t border-neutral-200">
        <div className="text-sm">
          <Link href={document ? `/documents/${document.id}` : "/documents"}>
            <a className="font-medium text-primary-500 hover:text-primary-600">View full workflow</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
