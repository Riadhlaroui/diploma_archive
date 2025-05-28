"use client";

import type React from "react";
import { useState, useRef, useCallback } from "react";
import { X, Upload, FileText, ImageIcon, File, Plus } from "lucide-react";
import { Separator } from "./ui/separator";

interface DocumentItem {
  file: File;
  type: string; // Document type e.g. BAC
}

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (documents: DocumentItem[]) => void;
}

const predefinedTypes = [
  "Birth Certificate",
  "BAC",
  "National ID",
  "Enrollment Certificate",
];

const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [types, setTypes] = useState(predefinedTypes);
  const [newType, setNewType] = useState("");
  const [addingType, setAddingType] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Add files to documents state
  const addFiles = useCallback((files: FileList) => {
    const newDocs: DocumentItem[] = Array.from(files).map((file) => ({
      file,
      type: "",
    }));
    setDocuments((prev) => [...prev, ...newDocs]);
  }, []);

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    addFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag and Drop handlers
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const setDocumentType = (index: number, type: string) => {
    setDocuments((prev) => {
      const copy = [...prev];
      copy[index].type = type;
      return copy;
    });
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (documents.some((doc) => doc.type.trim() === "")) {
      alert("Please specify a type for all documents");
      return;
    }
    onConfirm(documents);
    setDocuments([]);
    onOpenChange(false);
  };

  const addNewType = () => {
    const trimmed = newType.trim();
    if (!trimmed) return;
    if (types.includes(trimmed)) {
      alert("This type already exists");
      return;
    }
    setTypes((prev) => [...prev, trimmed]);
    setNewType("");
    setAddingType(false);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return <ImageIcon className="w-4 h-4 text-gray-500" />;
    } else if (["pdf"].includes(extension || "")) {
      return <FileText className="w-4 h-4 text-gray-500" />;
    } else {
      return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-md shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-300 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Upload Documents
            </h3>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Drag and drop area */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mb-6 cursor-pointer border-2 border-dashed rounded-md flex flex-col items-center justify-center p-8 text-center transition-all
							${
                dragActive
                  ? "border-gray-400 bg-gray-50 dark:bg-gray-800"
                  : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
          >
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
              Drag & drop files here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              or click to browse your computer
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Supported formats: PDF, PNG, JPG, JPEG, DOC, DOCX
            </p>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={onFilesSelected}
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              className="hidden"
            />
          </div>

          {/* Documents List */}
          {documents.length > 0 && (
            <div className="space-y-4 mb-6">
              <h4 className="text-base font-medium text-gray-900 dark:text-white">
                Uploaded Files ({documents.length})
              </h4>
              <div className="space-y-3">
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getFileIcon(doc.file.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {doc.file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(doc.file.size)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeDocument(idx)}
                            className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                            aria-label={`Remove ${doc.file.name}`}
                            type="button"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Document Type{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            className="w-full h-9 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-500 dark:focus:border-gray-400"
                            value={doc.type}
                            onChange={(e) =>
                              setDocumentType(idx, e.target.value)
                            }
                          >
                            <option value="" disabled>
                              Select document type
                            </option>
                            {types.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {/* Add new document type section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Document Types
            </h4>
            {!addingType ? (
              <button
                type="button"
                onClick={() => setAddingType(true)}
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
              >
                <Plus className="w-4 h-4" />
                Add new document type
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter new type name"
                  className="flex-1 h-9 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-500 dark:focus:border-gray-400"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addNewType();
                    } else if (e.key === "Escape") {
                      setAddingType(false);
                      setNewType("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addNewType}
                  className="px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingType(false);
                    setNewType("");
                  }}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setDocuments([]);
              onOpenChange(false);
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white font-medium rounded hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={documents.length === 0}
          >
            Confirm ({documents.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadDialog;
