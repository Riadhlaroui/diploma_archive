"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, FileText, Plus, Check } from "lucide-react";
import pb from "@/lib/pocketbase";

const FACULTY_OPTIONS = [
  { value: "علوم-وتكنولوجيا", label: "علوم وتكنولوجيا" },
  { value: "الهندسة-المدنية", label: "الهندسة المدنية" },
  { value: "الطب", label: "الطب" },
  { value: "علوم-الحاسوب", label: "علوم الحاسوب" },
  { value: "الرياضيات", label: "الرياضيات" },
  { value: "الفيزياء", label: "الفيزياء" },
  { value: "الكيمياء", label: "الكيمياء" },
];

const DIPLOMA_TYPES = [
  { value: "Licence", label: "Licence" },
  { value: "Master", label: "Master" },
  { value: "Magister", label: "Magister" },
  { value: "Doctorat", label: "Doctorat" },
];

export default function StudentForm({
  studentData = null,
  onSuccess,
  onCancel,
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    faculty: "",
    diplomaTypes: [], // Changed to array for multiple selections
    year: new Date().getFullYear(),
  });

  // If studentData is provided, populate the form
  useEffect(() => {
    if (studentData) {
      setFormData({
        firstName: studentData.firstName || "",
        lastName: studentData.lastName || "",
        studentId: studentData.studentId || "",
        faculty: studentData.faculty || "",
        // Convert to array if it's a string
        diplomaTypes: Array.isArray(studentData.diplomaTypes)
          ? studentData.diplomaTypes
          : studentData.diplomaType
          ? [studentData.diplomaType]
          : [],
        year: studentData.year || new Date().getFullYear(),
      });

      // If there are files, set the previews
      if (studentData.files && Array.isArray(studentData.files)) {
        setFilePreviews(
          studentData.files.map((file) => ({
            url: pb.getFileUrl(studentData, file),
            name: file,
            isPdf: file.endsWith(".pdf"),
          }))
        );
      } else if (studentData.file) {
        // Handle legacy single file
        setFilePreviews([
          {
            url: pb.getFileUrl(studentData, studentData.file),
            name: studentData.file,
            isPdf: studentData.file.endsWith(".pdf"),
          },
        ]);
      }
    }
  }, [studentData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.faculty) {
      newErrors.faculty = "Faculty is required";
    }

    if (!formData.diplomaTypes.length) {
      newErrors.diplomaTypes = "At least one diploma type is required";
    }

    if (!formData.year || isNaN(formData.year)) {
      newErrors.year = "Valid year is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleDiplomaTypeToggle = (value) => {
    setFormData((prev) => {
      const diplomaTypes = [...prev.diplomaTypes];
      const index = diplomaTypes.indexOf(value);

      if (index === -1) {
        diplomaTypes.push(value);
      } else {
        diplomaTypes.splice(index, 1);
      }

      return {
        ...prev,
        diplomaTypes,
      };
    });

    // Clear error when field is edited
    if (errors.diplomaTypes) {
      setErrors((prev) => ({
        ...prev,
        diplomaTypes: null,
      }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    processFiles(selectedFiles);
  };

  const processFiles = (selectedFiles) => {
    // Check file types (PDF or image)
    const invalidFiles = selectedFiles.filter(
      (file) => !file.type.includes("pdf") && !file.type.includes("image")
    );

    if (invalidFiles.length > 0) {
      setErrors((prev) => ({
        ...prev,
        files: "Only PDF or image files are allowed",
      }));
      return;
    }

    // Add new files to existing files
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);

    // Create previews for the files
    const newPreviews = selectedFiles.map((file) => {
      if (file.type.includes("image")) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              url: e.target.result,
              name: file.name,
              isPdf: false,
              file,
            });
          };
          reader.readAsDataURL(file);
        });
      } else {
        // For PDF, just show an icon
        return Promise.resolve({
          url: "pdf",
          name: file.name,
          isPdf: true,
          file,
        });
      }
    });

    Promise.all(newPreviews).then((resolvedPreviews) => {
      setFilePreviews((prev) => [...prev, ...resolvedPreviews]);
    });

    // Clear file error
    if (errors.files) {
      setErrors((prev) => ({
        ...prev,
        files: null,
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (!droppedFiles.length) return;

    processFiles(droppedFiles);
  };

  const removeFile = (index) => {
    setFilePreviews((prev) => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });

    setFiles((prev) => {
      const newFiles = [...prev];
      // Only remove from files array if it's a new file (has file property)
      const fileToRemove = filePreviews[index];
      if (fileToRemove && fileToRemove.file) {
        const fileIndex = newFiles.findIndex(
          (f) => f.name === fileToRemove.name
        );
        if (fileIndex !== -1) {
          newFiles.splice(fileIndex, 1);
        }
      }
      return newFiles;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formDataToSubmit = new FormData();

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (key === "diplomaTypes") {
          // Handle array of diploma types
          formData.diplomaTypes.forEach((type, index) => {
            formDataToSubmit.append(`diplomaTypes`, type);
          });
        } else {
          formDataToSubmit.append(key, formData[key]);
        }
      });

      // Add files if they exist
      files.forEach((file, index) => {
        formDataToSubmit.append(`files`, file);
      });

      if (studentData) {
        // Update existing record
        await pb
          .collection("students")
          .update(studentData.id, formDataToSubmit);
      } else {
        // Create new record
        await pb.collection("students").create(formDataToSubmit);
      }

      // Success callback
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to submit the form. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormField = ({ label, required, children, error }) => (
    <div className="mb-4">
      <div className="mb-1 flex items-center">
        {label && (
          <label className="text-xs font-medium text-gray-500">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Student ID */}
        <FormField label="ID" error={errors.studentId}>
          <input
            type="text"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            className="w-full rounded bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Leave empty to auto-generate..."
          />
        </FormField>

        {/* First Name */}
        <FormField label="First Name" required error={errors.firstName}>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full rounded bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter first name"
          />
        </FormField>

        {/* Last Name */}
        <FormField label="Last Name" required error={errors.lastName}>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full rounded bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter last name"
          />
        </FormField>

        {/* Faculty */}
        <FormField label="Faculty" required error={errors.faculty}>
          <select
            name="faculty"
            value={formData.faculty}
            onChange={handleChange}
            className="w-full rounded bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select Faculty</option>
            {FACULTY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        {/* Diploma Types - Multiple Selection */}
        <FormField label="Diploma Types" required error={errors.diplomaTypes}>
          <div className="grid grid-cols-2 gap-2">
            {DIPLOMA_TYPES.map((option) => (
              <div
                key={option.value}
                className={`flex cursor-pointer items-center rounded border p-2 ${
                  formData.diplomaTypes.includes(option.value)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-gray-100"
                }`}
                onClick={() => handleDiplomaTypeToggle(option.value)}
              >
                <div
                  className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                    formData.diplomaTypes.includes(option.value)
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {formData.diplomaTypes.includes(option.value) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <span className="text-sm">{option.label}</span>
              </div>
            ))}
          </div>
        </FormField>

        {/* Year */}
        <FormField label="Year" required error={errors.year}>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            min="2000"
            max="2100"
            className="w-full rounded bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter year"
          />
        </FormField>

        {/* File Upload - Multiple Files */}
        <FormField label="Diploma Files" error={errors.files}>
          <div className="space-y-2">
            {/* File previews */}
            {filePreviews.length > 0 && (
              <div className="mb-2 space-y-2">
                {filePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative flex items-center rounded bg-gray-100 p-2"
                  >
                    {preview.isPdf ? (
                      <div className="flex items-center">
                        <FileText className="mr-2 h-6 w-6 text-blue-600" />
                        <span className="text-sm text-gray-700">
                          {preview.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="relative mr-2 h-10 w-10">
                          <img
                            src={preview.url || "/placeholder.svg"}
                            alt="File preview"
                            className="h-full w-full rounded object-cover"
                          />
                        </div>
                        <span className="text-sm text-gray-700">
                          {preview.name}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute right-1 top-1 rounded-full bg-gray-200 p-1 text-gray-600 hover:bg-gray-300"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload new file button */}
            <div
              className="flex cursor-pointer items-center justify-center rounded bg-gray-100 p-3 text-center"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput").click()}
            >
              <div className="flex items-center">
                <Plus className="mr-1 h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500">Upload new file</span>
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
              </div>
            </div>
          </div>
        </FormField>

        {/* Form Error */}
        {errors.submit && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-xs text-red-700">{errors.submit}</p>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="mt-6 flex justify-end space-x-2 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded bg-gray-800 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : studentData ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
