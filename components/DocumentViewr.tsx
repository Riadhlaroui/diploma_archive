"use client";

import type React from "react";
import { X, Download, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

interface DocumentViewerProps {
  file: File;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  file,
  fileName,
  isOpen,
  onClose,
}) => {
  const [zoom, setZoom] = useState(100);
  const fileUrl = URL.createObjectURL(file);
  const fileType = file.type.toLowerCase();

  const isImage = fileType.startsWith("image/");
  const isPDF = fileType === "application/pdf";

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-gray-900 rounded-md shadow-lg w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-300 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
              {fileName}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
          <div className="flex items-center gap-1">
            {isImage && (
              <>
                <button
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 transition-colors"
                  disabled={zoom <= 25}
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[60px] text-center px-2">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 transition-colors"
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto max-h-[calc(95vh-80px)] bg-white dark:bg-gray-900">
          {isImage ? (
            <div className="flex justify-center">
              <img
                src={fileUrl || "/placeholder.svg"}
                alt={fileName}
                className="max-w-full h-auto rounded border border-gray-200 dark:border-gray-700"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "top center",
                }}
              />
            </div>
          ) : isPDF ? (
            <iframe
              src={fileUrl}
              className="w-full h-[80vh] rounded border border-gray-200 dark:border-gray-700"
              title={fileName}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <p className="text-base mb-2">Preview not available</p>
                <p className="text-sm">
                  This file type cannot be previewed. You can download it to
                  view the content.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
