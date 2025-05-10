"use client";
import { X } from "lucide-react";
import StudentForm from "./StudentForm";

export default function StudentFormDialog({
  isOpen,
  onClose,
  studentData = null,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/20" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-base font-medium text-gray-800">
            {studentData ? "Edit student record" : "New student record"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <StudentForm
            studentData={studentData}
            onSuccess={onClose}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
