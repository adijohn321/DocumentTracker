import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Loader2,
  FileText,
  Calendar,
  User,
  Building2,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  Forward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-purple-100 text-purple-800 border-purple-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export function DocumentDetail() {
  const { id } = useParams();
  const documentId = id ? parseInt(id) : 0;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [routingNotes, setRoutingNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // Fetch document details
  const { data: document, isLoading } = useQuery({
    queryKey: [`/api/documents/${documentId}`],
    enabled: !!documentId,
  });

  // Fetch document history
  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: [`/api/documents/${documentId}/history`],
    enabled: !!documentId,
  });

  // Fetch departments for routing
  const { data: departments } = useQuery({
    queryKey: ["/api/departments"],
  });

  // Update document mutation
  const updateDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/documents/${documentId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}/history`] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/recent"] });
      setIsRouteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update document",
        variant: "destructive",
      });
    },
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  // Handle document routing
  const handleRouteDocument = () => {
    if (!selectedDepartment) {
      toast({
        title: "Error",
        description: "Please select a department",
        variant: "destructive",
      });
      return;
    }

    updateDocumentMutation.mutate({
      currentDepartmentId: parseInt(selectedDepartment),
      status: newStatus || "in_progress",
      notes: routingNotes,
    });
  };

  // Handle document status change
  const handleStatusChange = (status: string) => {
    updateDocumentMutation.mutate({
      status,
      notes: `Status changed to ${status}`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Document not found</h2>
        <p className="mt-2 text-gray-600">
          The document you are looking for does not exist or has been removed.
        </p>
        <Button className="mt-4" onClick={() => navigate("/documents")}>
          Back to Documents
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">{document.title}</h1>
          <p className="text-muted-foreground">ID: {document.documentId}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={isRouteDialogOpen} onOpenChange={setIsRouteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Forward className="mr-2 h-4 w-4" />
                Route Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Route Document</DialogTitle>
                <DialogDescription>
                  Select the next department to route this document to.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Department</label>
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((dept: any) => (
                        <SelectItem
                          key={dept.id}
                          value={dept.id.toString()}
                          disabled={dept.id === document.currentDepartmentId}
                        >
                          {dept.name}
                          {dept.id === document.currentDepartmentId
                            ? " (Current)"
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Keep Current Status</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    placeholder="Add routing notes..."
                    value={routingNotes}
                    onChange={(e) => setRoutingNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsRouteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRouteDocument}
                  disabled={updateDocumentMutation.isPending}
                >
                  {updateDocumentMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Route Document
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() => handleStatusChange("approved")}
            disabled={
              document.status === "approved" || updateDocumentMutation.isPending
            }
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve
          </Button>

          <Button
            variant="outline"
            onClick={() => handleStatusChange("rejected")}
            disabled={
              document.status === "rejected" || updateDocumentMutation.isPending
            }
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>

          {document.filePath && (
            <Button variant="outline" asChild>
              <a href={document.filePath} target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 h-4 w-4" />
                View File
              </a>
            </Button>
          )}
        </div>
      </div>

      <Badge
        className={`${
          statusColors[document.status] || "bg-gray-100 text-gray-800"
        } text-xs`}
      >
        {document.status.toUpperCase()}
      </Badge>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">
                      Current Department
                    </h3>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{document.department?.name || "Unassigned"}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">
                      Document Type
                    </h3>
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {document.documentType?.name || "Unspecified"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">
                      Created By
                    </h3>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{document.creator?.name || "Unknown"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">
                      Created Date
                    </h3>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{formatDate(document.createdAt)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">
                      Last Updated
                    </h3>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{formatDate(document.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="font-medium mb-2">Document Content</h3>
                <div className="bg-muted rounded-md p-4 min-h-24 whitespace-pre-wrap">
                  {document.content || "No content"}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Document History</CardTitle>
              <CardDescription>
                Track the document's journey through departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isHistoryLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : history && history.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Changed By</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((entry: any) => (
                      <TableRow key={entry.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(entry.changedAt)}
                        </TableCell>
                        <TableCell>
                          {entry.fromDepartmentName || "None"}
                        </TableCell>
                        <TableCell>
                          {entry.toDepartmentName || "None"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${
                              statusColors[entry.statusChange] ||
                              "bg-gray-100 text-gray-800"
                            } text-xs`}
                          >
                            {entry.statusChange.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{entry.changedByName}</TableCell>
                        <TableCell>{entry.notes || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No history available for this document
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
