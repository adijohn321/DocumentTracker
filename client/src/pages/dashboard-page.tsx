import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, FileText, PieChart, Clock, FileCheck } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { DocumentWorkflow } from "@/components/dashboard/document-workflow";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { PerformanceMetrics } from "@/components/dashboard/performance-metrics";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: dashboardStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header notifications={3} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto focus:outline-none p-4 lg:p-6 bg-neutral-50">
          <div className="pb-5 border-b border-neutral-200 sm:flex sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <Button asChild>
                <Link href="/create-document">
                  <FileText className="-ml-1 mr-2 h-5 w-5" />
                  New Document
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {isStatsLoading ? (
                <div className="col-span-full flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <StatsCard
                    title="Total Documents"
                    value={dashboardStats?.totalDocuments || 0}
                    icon={<FileText className="h-6 w-6" />}
                    iconBgColor="bg-primary-50"
                    iconColor="text-primary-500"
                    href="/documents"
                    linkText="View all"
                  />
                  
                  <StatsCard
                    title="Active Documents"
                    value={dashboardStats?.activeDocuments || 0}
                    icon={<FileCheck className="h-6 w-6" />}
                    iconBgColor="bg-secondary-50"
                    iconColor="text-secondary-500"
                    href="/documents?status=in_progress"
                    linkText="View active"
                  />
                  
                  <StatsCard
                    title="Avg. Processing Time"
                    value={dashboardStats?.avgProcessingTime || "0 hrs"}
                    icon={<Clock className="h-6 w-6" />}
                    iconBgColor="bg-accent-50"
                    iconColor="text-accent-500"
                    href="/analytics"
                    linkText="View reports"
                  />
                  
                  <StatsCard
                    title="Pending Approvals"
                    value={dashboardStats?.pendingApprovals || 0}
                    icon={<PieChart className="h-6 w-6" />}
                    iconBgColor="bg-red-50"
                    iconColor="text-error"
                    href="/documents?status=pending"
                    linkText="Approve documents"
                  />
                </>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent Documents */}
            <div className="lg:col-span-2">
              <RecentDocuments />
            </div>

            {/* Document Workflow & Quick Actions */}
            <div className="space-y-6">
              <DocumentWorkflow />
              <QuickActions />
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mt-8">
            <PerformanceMetrics />
          </div>
        </main>
      </div>
    </div>
  );
}
