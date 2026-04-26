import { Permission } from "./permissions";

export const PERMISSION_GROUPS: {
	labelKey: string;
	permissions: Permission[];
}[] = [
	{
		labelKey: "permissionGroups.students",
		permissions: [
			"students_view",
			"students_create",
			"students_edit",
			"students_delete",
		],
	},
	{
		labelKey: "permissionGroups.documents",
		permissions: ["documents_view", "documents_upload", "documents_delete"],
	},
	{
		labelKey: "permissionGroups.documentTypes",
		permissions: [
			"document_type_view",
			"document_type_create",
			"document_type_edit",
			"document_type_delete",
		],
	},
	{
		labelKey: "permissionGroups.staff",
		permissions: ["staff_view", "staff_create", "staff_edit", "staff_delete"],
	},
	{
		labelKey: "permissionGroups.faculties",
		permissions: [
			"faculty_view",
			"faculty_create",
			"faculty_edit",
			"faculty_delete",
		],
	},
	{
		labelKey: "permissionGroups.departments",
		permissions: [
			"department_view",
			"department_create",
			"department_edit",
			"department_delete",
		],
	},
	{
		labelKey: "permissionGroups.fields",
		permissions: ["field_view", "field_create", "field_edit", "field_delete"],
	},
	{
		labelKey: "permissionGroups.majors",
		permissions: ["major_view", "major_create", "major_edit", "major_delete"],
	},
	{
		labelKey: "permissionGroups.specialties",
		permissions: [
			"specialty_view",
			"specialty_create",
			"specialty_edit",
			"specialty_delete",
		],
	},
];
