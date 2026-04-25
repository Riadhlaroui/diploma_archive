import { Permission } from "./permissions";

export const PERMISSION_GROUPS: {
	label: string;
	permissions: Permission[];
}[] = [
	{
		label: "Students",

		permissions: [
			"students_view",
			"students_create",
			"students_edit",
			"students_delete",
		],
	},
	{
		label: "Documents",
		permissions: ["documents_view", "documents_upload", "documents_delete"],
	},
	{
		label: "Document Types",
		permissions: [
			"document_type_view",
			"document_type_create",
			"document_type_edit",
			"document_type_delete",
		],
	},
	{
		label: "Staff",
		permissions: ["staff_view", "staff_create", "staff_edit", "staff_delete"],
	},
	{
		label: "Faculties",
		permissions: [
			"faculty_view",
			"faculty_create",
			"faculty_edit",
			"faculty_delete",
		],
	},
	{
		label: "Departments",
		permissions: [
			"department_view",
			"department_create",
			"department_edit",
			"department_delete",
		],
	},
	{
		label: "Fields",
		permissions: ["field_view", "field_create", "field_edit", "field_delete"],
	},
	{
		label: "Majors",
		permissions: ["major_view", "major_create", "major_edit", "major_delete"],
	},
	{
		label: "Specialties",
		permissions: [
			"specialty_view",
			"specialty_create",
			"specialty_edit",
			"specialty_delete",
		],
	},
];
