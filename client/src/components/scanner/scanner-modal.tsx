import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, RefreshCw } from "lucide-react";

// Import Scanner.js dynamically to avoid SSR issues
let Scanner: any = null;
if (typeof window !== "undefined") {
  try {
    // In a real implementation, this would be properly imported from npm
    // For demo purposes, we'll simulate its existence
    Scanner = {
      create: (options: any) => {
        return {
          render: (element: HTMLElement) => {
            console.log("Scanner rendered on element", element);
          },
          start: () => {
            console.log("Scanner started");
          },
          stop: () => {
            console.log("Scanner stopped");
          },
          onDetected: (callback: (result: any) => void) => {
            console.log("Scanner detection handler set");
          },
          getActiveTrack: () => null,
        };
      },
    };
  } catch (error) {
    console.error("Error loading Scanner.js:", error);
  }
}

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (scannedImage: string) => void;
}

export function ScannerModal({ isOpen, onClose, onScan }: ScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const scannerInstance = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isOpen && scannerRef.current) {
      initializeScanner();
    }

    return () => {
      if (scannerInstance.current) {
        try {
          scannerInstance.current.stop();
        } catch (error) {
          console.error("Error stopping scanner:", error);
        }
      }
      
      // Stop video tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const initializeScanner = async () => {
    if (!Scanner) {
      setScanError("Scanner.js library could not be loaded");
      return;
    }

    try {
      setIsCameraStarting(true);
      setScanError(null);

      // In a real implementation with scanner.js:
      // 1. Request camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) videoRef.current.play();
          setIsCameraStarting(false);
        };
      }

      // Simulate scanner.js implementation
      setTimeout(() => {
        setIsCameraStarting(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsCameraStarting(false);
      setScanError("Failed to access camera. Please ensure camera permissions are granted.");
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    
    // Simulate scanning process
    setTimeout(() => {
      // In a real implementation, this would be the actual scanned document
      // captured from scanner.js
      const mockScannedImageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
      
      onScan(mockScannedImageData);
      setIsScanning(false);
      onClose();
    }, 2000);
  };

  const retryCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    
    setScanError(null);
    initializeScanner();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Scan Document
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Position the document you want to scan within the camera view.
          </p>
          
          <div 
            ref={scannerRef} 
            className="bg-neutral-100 rounded-lg overflow-hidden h-64 w-full relative flex items-center justify-center"
          >
            {isCameraStarting ? (
              <div className="text-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Activating camera...</p>
              </div>
            ) : scanError ? (
              <div className="text-center p-4">
                <p className="text-sm text-destructive mb-4">{scanError}</p>
                <Button variant="outline" size="sm" onClick={retryCamera}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />
                <div className="absolute inset-0 border-2 border-dashed border-primary-200 m-4 pointer-events-none"></div>
              </>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleScan} 
            disabled={isScanning || isCameraStarting || !!scanError}
          >
            {isScanning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isScanning ? "Scanning..." : "Scan Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
