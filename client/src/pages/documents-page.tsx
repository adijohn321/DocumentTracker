import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { DocumentList } from "@/components/documents/document-list";

export default function DocumentsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto focus:outline-none p-4 lg:p-6 bg-neutral-50">
          <div className="pb-5 border-b border-neutral-200">
            <h1 className="text-2xl font-bold text-neutral-900">Documents</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Manage, track, and view all your documents
            </p>
          </div>
          
          <div className="mt-6">
            <DocumentList />
          </div>
        </main>
      </div>
    </div>
  );
}
