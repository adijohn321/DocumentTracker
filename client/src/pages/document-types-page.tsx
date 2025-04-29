import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Document Type Schema
const documentTypeSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().optional(),
  workflowSteps: z.string().optional(),
});

type DocumentTypeFormValues = z.infer<typeof documentTypeSchema>;

export default function DocumentTypesPage() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Get document types
  const { data: documentTypes = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/document-types"],
  });

  // Set up form
  const form = useForm<DocumentTypeFormValues>({
    resolver: zodResolver(documentTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      workflowSteps: "",
    },
  });

  // Create document type mutation
  const createDocumentTypeMutation = useMutation({
    mutationFn: async (data: DocumentTypeFormValues) => {
      // Parse workflow steps if provided
      let workflowConfig;
      if (data.workflowSteps) {
        try {
          // Format: departmentId1,departmentId2,departmentId3
          const steps = data.workflowSteps.split(',').map(step => step.trim());
          workflowConfig = {
            steps: steps.map((departmentId, index) => ({
              departmentId: parseInt(departmentId),
              order: index + 1,
              isOptional: false,
            })),
            allowSkip: false,
          };
        } catch (error) {
          throw new Error("Invalid workflow steps format");
        }
      }

      const res = await apiRequest("POST", "/api/document-types", {
        name: data.name,
        description: data.description || "",
        workflowConfig,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document type created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/document-types"] });
      form.reset();
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create document type",
        variant: "destructive",
      });
    },
  });

  // Submit handler
  const onSubmit = (data: DocumentTypeFormValues) => {
    createDocumentTypeMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto focus:outline-none p-4 lg:p-6 bg-neutral-50">
          <div className="max-w-7xl mx-auto">
            <div className="pb-5 border-b border-neutral-200 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-neutral-900">Document Types</h1>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Document Type
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Document Type</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Medical Record, Lab Request" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe this document type" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="workflowSteps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Workflow Steps (Department IDs)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 1,2,3,4" {...field} />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-1">
                              Enter department IDs separated by commas in the order they should process the document.
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createDocumentTypeMutation.isPending}
                        >
                          {createDocumentTypeMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Create
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Document Types</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : documentTypes?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Workflow</TableHead>
                          <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documentTypes.map((type: any) => (
                          <TableRow key={type.id}>
                            <TableCell className="font-medium">{type.name}</TableCell>
                            <TableCell>{type.description}</TableCell>
                            <TableCell>
                              {type.workflowConfig?.steps?.map((step: any) => step.departmentId).join(" → ") || "No workflow configured"}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-destructive hover:text-destructive/90"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No document types found. Create one to get started.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}