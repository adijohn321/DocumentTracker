import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

interface DocumentStatus {
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
}

const documentStatuses: Record<string, DocumentStatus> = {
  pending: {
    label: "Pending Review",
    value: "pending",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
  },
  in_progress: {
    label: "In Progress",
    value: "in_progress",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
  },
  approved: {
    label: "Approved",
    value: "approved",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
  },
  completed: {
    label: "Completed",
    value: "completed",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
  },
};

export function RecentDocuments() {
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 4;

  const { data: documents, isLoading } = useQuery({
    queryKey: ["/api/documents/recent"],
  });

  const filteredDocuments = documents
    ? filter === "all"
      ? documents
      : documents.filter((doc: any) => doc.status === filter)
    : [];

  // Pagination logic
  const totalPages = Math.ceil(
    (filteredDocuments?.length || 0) / documentsPerPage
  );
  const indexOfLastDoc = currentPage * documentsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - documentsPerPage;
  const currentDocuments = filteredDocuments.slice(
    indexOfFirstDoc,
    indexOfLastDoc
  );

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);

    if (diffHrs < 1) return "just now";
    if (diffHrs === 1) return "1 hour ago";
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 className="text-lg font-medium text-neutral-900">Recent Documents</h2>
        <div className="flex space-x-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Document
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {currentDocuments.length > 0 ? (
                currentDocuments.map((doc: any) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">
                            {doc.title}
                          </div>
                          <div className="text-sm text-neutral-500">
                            ID: {doc.documentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">
                        {doc.documentTypeName || "Unspecified"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          documentStatuses[doc.status]?.bgColor || "bg-gray-100"
                        } ${
                          documentStatuses[doc.status]?.textColor || "text-gray-800"
                        }`}
                      >
                        {documentStatuses[doc.status]?.label || doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {formatTimeAgo(doc.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {doc.departmentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/documents/${doc.id}`}>
                        <a className="text-primary-500 hover:text-primary-600">
                          View
                        </a>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-neutral-500">
                    No documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <div className="bg-neutral-50 px-5 py-3 border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-700">
            Showing <span className="font-medium">{Math.min(filteredDocuments.length, documentsPerPage)}</span> of{" "}
            <span className="font-medium">{filteredDocuments.length}</span> documents
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className="relative hidden sm:inline-flex items-center"
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
