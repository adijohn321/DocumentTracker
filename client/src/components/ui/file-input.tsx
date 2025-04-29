import React, { forwardRef, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Label } from "./label";
import { UploadCloud } from "lucide-react";

export interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileSelect?: (file: File | null) => void;
  label?: string;
  error?: string;
  dropzoneText?: string;
  acceptedTypes?: string;
  containerClassName?: string;
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      className,
      label,
      error,
      onFileSelect,
      dropzoneText = "Drag and drop files here, or click to browse",
      acceptedTypes = "application/pdf,image/*",
      containerClassName,
      ...props
    },
    ref
  ) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          const file = e.dataTransfer.files[0];
          setSelectedFile(file);
          onFileSelect?.(file);
        }
      },
      [onFileSelect]
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setSelectedFile(file);
          onFileSelect?.(file);
        } else {
          setSelectedFile(null);
          onFileSelect?.(null);
        }
      },
      [onFileSelect]
    );

    return (
      <div className={containerClassName}>
        {label && <Label className="mb-2 block">{label}</Label>}
        <div
          className={cn(
            "relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-muted p-4 transition-colors",
            dragActive && "border-primary bg-muted/20",
            error && "border-destructive",
            className
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Input
            ref={ref}
            type="file"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleChange}
            accept={acceptedTypes}
            {...props}
          />
          <div className="flex flex-col items-center justify-center text-center">
            <UploadCloud className="mb-2 h-10 w-10 text-muted-foreground" />
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              {selectedFile ? (
                <span className="text-primary-500">{selectedFile.name}</span>
              ) : (
                dropzoneText
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Supported formats: PDF, JPG, PNG
            </div>
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

FileInput.displayName = "FileInput";

export { FileInput };
