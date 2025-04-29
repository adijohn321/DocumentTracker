import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { DocumentForm } from "@/components/documents/document-form";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CreateDocumentPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto focus:outline-none p-4 lg:p-6 bg-neutral-50">
          <div className="pb-5 border-b border-neutral-200 flex items-center">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href="/documents">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Documents
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-neutral-900">Create New Document</h1>
          </div>
          
          <div className="mt-6">
            <DocumentForm />
          </div>
        </main>
      </div>
    </div>
  );
}
