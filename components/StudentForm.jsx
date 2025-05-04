"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, FileText } from "lucide-react";
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
];

export default function StudentForm({
  studentData = null,
  onSuccess,
  onCancel,
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    faculty: "",
    diplomaType: "",
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
        diplomaType: studentData.diplomaType || "",
        year: studentData.year || new Date().getFullYear(),
      });

      // If there's a file, set the preview
      if (studentData.fileUrl) {
        setFilePreview(studentData.fileUrl);
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

    if (!formData.diplomaType) {
      newErrors.diplomaType = "Diploma type is required";
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check file type (PDF or image)
    const fileType = selectedFile.type;
    if (!fileType.includes("pdf") && !fileType.includes("image")) {
      setErrors((prev) => ({
        ...prev,
        file: "Only PDF or image files are allowed",
      }));
      return;
    }

    setFile(selectedFile);

    // Create preview for the file
    if (fileType.includes("image")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // For PDF, just show an icon
      setFilePreview("pdf");
    }

    // Clear file error
    if (errors.file) {
      setErrors((prev) => ({
        ...prev,
        file: null,
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

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    // Check file type (PDF or image)
    const fileType = droppedFile.type;
    if (!fileType.includes("pdf") && !fileType.includes("image")) {
      setErrors((prev) => ({
        ...prev,
        file: "Only PDF or image files are allowed",
      }));
      return;
    }

    setFile(droppedFile);

    // Create preview for the file
    if (fileType.includes("image")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(droppedFile);
    } else {
      // For PDF, just show an icon
      setFilePreview("pdf");
    }

    // Clear file error
    if (errors.file) {
      setErrors((prev) => ({
        ...prev,
        file: null,
      }));
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formDataToSubmit = new FormData();

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        formDataToSubmit.append(key, formData[key]);
      });

      // Add file if exists
      if (file) {
        formDataToSubmit.append("file", file);
      }

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

        {/* Diploma Type */}
        <FormField label="Diploma Type" required error={errors.diplomaType}>
          <select
            name="diplomaType"
            value={formData.diplomaType}
            onChange={handleChange}
            className="w-full rounded bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {DIPLOMA_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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

        {/* File Upload */}
        <FormField label="Diploma File" error={errors.file}>
          <div
            className="w-full rounded bg-gray-100 p-2"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {filePreview ? (
              <div className="relative flex items-center rounded p-2">
                {filePreview === "pdf" ? (
                  <div className="flex items-center">
                    <FileText className="mr-2 h-6 w-6 text-blue-600" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                  </div>
                ) : (
                  <div className="relative h-16 w-16">
                    <img
                      src={filePreview || "/placeholder.svg"}
                      alt="File preview"
                      className="h-full w-full rounded object-cover"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute right-1 top-1 rounded-full bg-gray-200 p-1 text-gray-600 hover:bg-gray-300"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                className="flex cursor-pointer items-center justify-center rounded p-4 text-center"
                onClick={() => document.getElementById("fileInput").click()}
              >
                <div>
                  <Upload className="mx-auto mb-1 h-5 w-5 text-gray-400" />
                  <span className="text-xs text-gray-500">Upload new file</span>
                  <input
                    id="fileInput"
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            )}
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
