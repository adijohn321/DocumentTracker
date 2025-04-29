import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileInput } from "@/components/ui/file-input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

// Define document form schema
const documentFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  content: z.string().optional(),
  documentTypeId: z.string().optional(),
  currentDepartmentId: z.string(),
  filePath: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

export function DocumentForm() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Get document types and departments
  const { data: documentTypes, isLoading: typesLoading } = useQuery({
    queryKey: ["/api/document-types"],
  });

  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ["/api/departments"],
  });

  // Set up the form
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      content: "",
      documentTypeId: "",
      currentDepartmentId: "",
      filePath: "",
    },
  });

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) return null;

    setFileUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      setFileUploading(false);
      return data.filePath;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      setFileUploading(false);
      return null;
    }
  };

  // Create document mutation
  const createDocumentMutation = useMutation({
    mutationFn: async (data: DocumentFormValues) => {
      const res = await apiRequest("POST", "/api/documents", {
        title: data.title,
        content: data.content,
        documentTypeId: data.documentTypeId ? parseInt(data.documentTypeId) : undefined,
        currentDepartmentId: parseInt(data.currentDepartmentId),
        filePath: data.filePath,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/recent"] });
      navigate("/documents");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create document",
        variant: "destructive",
      });
    },
  });

  // Submit handler
  const onSubmit = async (data: DocumentFormValues) => {
    try {
      // Upload file if selected
      if (file) {
        const filePath = await handleFileUpload();
        if (filePath) {
          data.filePath = filePath;
        }
      }

      // Create document
      createDocumentMutation.mutate(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process document",
        variant: "destructive",
      });
    }
  };

  const isLoading = typesLoading || departmentsLoading || createDocumentMutation.isPending || fileUploading;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Document</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter document title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter document description or notes"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="documentTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={typesLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes?.map((type: any) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentDepartmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Department</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={departmentsLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments?.map((dept: any) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="filePath"
              render={() => (
                <FormItem>
                  <FormLabel>Document File</FormLabel>
                  <FormControl>
                    <FileInput
                      onFileSelect={setFile}
                      containerClassName="w-full"
                      dropzoneText={
                        file
                          ? `File selected: ${file.name}`
                          : "Drag and drop file here, or click to browse"
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="flex justify-between px-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/documents")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {fileUploading ? "Uploading..." : "Create Document"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
