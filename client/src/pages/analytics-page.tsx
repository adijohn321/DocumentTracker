import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BarChart3, LineChart as LineChartIcon, PieChart, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";

const COLORS = ['#1976D2', '#388E3C', '#F57C00', '#D32F2F', '#7B1FA2', '#0288D1', '#FBC02D'];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7days");
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Fetch department metrics
  const { data: departmentMetrics, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ["/api/analytics/departments"],
  });
  
  // Fetch processing time metrics
  const { data: processingMetrics, isLoading: isProcessingLoading } = useQuery({
    queryKey: ["/api/analytics/processing-time"],
  });
  
  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
  });
  
  // Prepare data for pie chart
  const prepareStatusData = () => {
    if (!dashboardStats) return [];
    
    // In a real application, this would be actual data from the API
    // For now, we're creating mock data based on total and active documents
    return [
      { name: "In Progress", value: dashboardStats.activeDocuments },
      { name: "Pending", value: dashboardStats.pendingApprovals },
      { name: "Completed", value: dashboardStats.totalDocuments - dashboardStats.activeDocuments - dashboardStats.pendingApprovals },
    ];
  };
  
  const renderActiveShape = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-midAngle * Math.PI / 180);
    const cos = Math.cos(-midAngle * Math.PI / 180);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>{`${payload.name}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" fontSize={12}>
          {`${value} documents (${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto focus:outline-none p-4 lg:p-6 bg-neutral-50">
          <div className="pb-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-neutral-900">Analytics Dashboard</h1>
            <div className="mt-3 sm:mt-0">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
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
          
          <div className="mt-6">
            <Tabs defaultValue="overview">
              <TabsList className="mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="processing">Processing Time</TabsTrigger>
                <TabsTrigger value="status">Document Status</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-primary-500" />
                        Documents by Department
                      </CardTitle>
                      <CardDescription>
                        Distribution of documents across hospital departments
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      {isDepartmentsLoading ? (
                        <div className="h-full flex justify-center items-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : departmentMetrics && departmentMetrics.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={departmentMetrics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="departmentName" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#1976D2" name="Documents" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col justify-center items-center">
                          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No department data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <LineChartIcon className="h-5 w-5 mr-2 text-primary-500" />
                        Processing Time by Document Type
                      </CardTitle>
                      <CardDescription>
                        Average time to process each document type
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      {isProcessingLoading ? (
                        <div className="h-full flex justify-center items-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : processingMetrics && processingMetrics.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={processingMetrics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="documentTypeName" />
                            <YAxis unit="h" />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="avgProcessingTime" 
                              stroke="#F57C00" 
                              name="Avg. Processing Time (hours)"
                              strokeWidth={2}
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col justify-center items-center">
                          <LineChartIcon className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No processing time data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-primary-500" />
                        Performance Summary
                      </CardTitle>
                      <CardDescription>
                        Key metrics for document processing performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                          <h3 className="text-2xl font-bold mt-1">
                            {isStatsLoading ? (
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            ) : (
                              dashboardStats?.totalDocuments || 0
                            )}
                          </h3>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-sm font-medium text-muted-foreground">Avg. Processing Time</p>
                          <h3 className="text-2xl font-bold mt-1">
                            {isStatsLoading ? (
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            ) : (
                              dashboardStats?.avgProcessingTime || "0 hrs"
                            )}
                          </h3>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-sm font-medium text-muted-foreground">Active Documents</p>
                          <h3 className="text-2xl font-bold mt-1">
                            {isStatsLoading ? (
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            ) : (
                              dashboardStats?.activeDocuments || 0
                            )}
                          </h3>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                          <h3 className="text-2xl font-bold mt-1">
                            {isStatsLoading ? (
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            ) : (
                              dashboardStats?.pendingApprovals || 0
                            )}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Departments Tab */}
              <TabsContent value="departments">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Volume by Department</CardTitle>
                    <CardDescription>
                      Detailed breakdown of document distribution across hospital departments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-96">
                    {isDepartmentsLoading ? (
                      <div className="h-full flex justify-center items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : departmentMetrics && departmentMetrics.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={departmentMetrics}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="departmentName" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#1976D2" name="Number of Documents" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col justify-center items-center">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No department data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Processing Time Tab */}
              <TabsContent value="processing">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Processing Time Analysis</CardTitle>
                    <CardDescription>
                      Average processing time by document type
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-96">
                    {isProcessingLoading ? (
                      <div className="h-full flex justify-center items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : processingMetrics && processingMetrics.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={processingMetrics}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="documentTypeName" />
                          <YAxis unit="h" />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="avgProcessingTime"
                            name="Avg. Processing Time (hours)"
                            stroke="#F57C00"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col justify-center items-center">
                        <LineChartIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No processing time data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Document Status Tab */}
              <TabsContent value="status">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Status Distribution</CardTitle>
                    <CardDescription>
                      Current status of all documents in the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-96">
                    {isStatsLoading ? (
                      <div className="h-full flex justify-center items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : dashboardStats ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={prepareStatusData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={100}
                            outerRadius={140}
                            dataKey="value"
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                          >
                            {prepareStatusData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col justify-center items-center">
                        <PieChart className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No document status data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
