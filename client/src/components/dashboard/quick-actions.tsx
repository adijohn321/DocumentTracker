import { Link } from "wouter";
import { FileText, FilePlus, Search } from "lucide-react";
import { ScannerModal } from "../scanner/scanner-modal";
import { useState } from "react";

export function QuickActions() {
  const [showScannerModal, setShowScannerModal] = useState(false);

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-medium text-neutral-900">Quick Actions</h2>
        </div>
        <div className="divide-y divide-neutral-200">
          <Link href="/create-document">
            <a className="block px-5 py-4 hover:bg-neutral-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FilePlus className="h-6 w-6 text-primary-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-900">Create New Document</p>
                  <p className="text-sm text-neutral-500">Start a new document workflow</p>
                </div>
              </div>
            </a>
          </Link>
          <button 
            onClick={() => setShowScannerModal(true)}
            className="block w-full text-left px-5 py-4 hover:bg-neutral-50"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-accent-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-900">Scan Document</p>
                <p className="text-sm text-neutral-500">Scan and upload a physical document</p>
              </div>
            </div>
          </button>
          <Link href="/documents?status=pending">
            <a className="block px-5 py-4 hover:bg-neutral-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-amber-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-900">Review Pending Documents</p>
                  <p className="text-sm text-neutral-500">Documents awaiting your review</p>
                </div>
              </div>
            </a>
          </Link>
          <Link href="/documents">
            <a className="block px-5 py-4 hover:bg-neutral-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Search className="h-6 w-6 text-info" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-900">Search Documents</p>
                  <p className="text-sm text-neutral-500">Find documents by ID, type, or content</p>
                </div>
              </div>
            </a>
          </Link>
        </div>
      </div>
      
      <ScannerModal 
        isOpen={showScannerModal} 
        onClose={() => setShowScannerModal(false)}
        onScan={(scannedImage) => {
          console.log("Scanned image:", scannedImage);
          setShowScannerModal(false);
          // Navigate to create document with scanned image
        }}
      />
    </>
  );
}
