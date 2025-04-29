import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, BarChart, LineChart } from "lucide-react";
import {
  BarChart as RechartBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartLineChart,
  Line,
  Legend,
} from "recharts";

export function PerformanceMetrics() {
  const [timeframe, setTimeframe] = useState("7days");

  const { data: departmentMetrics, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ["/api/analytics/departments"],
  });

  const { data: processingMetrics, isLoading: isProcessingLoading } = useQuery({
    queryKey: ["/api/analytics/processing-time"],
  });

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 className="text-lg font-medium text-neutral-900">Performance Metrics</h2>
        <div className="flex space-x-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department Document Volume Chart */}
          <div className="bg-neutral-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-neutral-700 mb-3">Document Volume by Department</h3>
            <div className="h-64 relative">
              {isDepartmentsLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : departmentMetrics && departmentMetrics.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartBarChart
                    data={departmentMetrics}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="departmentName" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1976D2" />
                  </RechartBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart className="h-8 w-8 text-neutral-400 mb-2 mx-auto" />
                    <p className="text-sm text-neutral-500">No department data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Document Processing Time Chart */}
          <div className="bg-neutral-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-neutral-700 mb-3">Average Processing Time by Document Type</h3>
            <div className="h-64 relative">
              {isProcessingLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : processingMetrics && processingMetrics.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartLineChart
                    data={processingMetrics}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="documentTypeName" tick={{ fontSize: 10 }} />
                    <YAxis unit="h" />
                    <Tooltip
                      formatter={(value) => [`${value} hours`, "Avg. Processing Time"]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgProcessingTime"
                      stroke="#F57C00"
                      activeDot={{ r: 8 }}
                      name="Processing Time"
                    />
                  </RechartLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-8 w-8 text-neutral-400 mb-2 mx-auto" />
                    <p className="text-sm text-neutral-500">No processing time data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-neutral-50 px-5 py-3 border-t border-neutral-200">
        <div className="text-sm">
          <Link href="/analytics">
            <a className="font-medium text-primary-500 hover:text-primary-600">View detailed analytics</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
