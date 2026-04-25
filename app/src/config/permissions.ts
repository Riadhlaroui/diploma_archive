export const PERMISSIONS = {
	// Students
	students_view: "students_view",
	students_create: "students_create",
	students_edit: "students_edit",
	students_delete: "students_delete",

	// Documents
	documents_view: "documents_view",
	documents_upload: "documents_upload",
	documents_delete: "documents_delete",

	// Staff (admin only)
	staff_view: "staff_view",
	staff_create: "staff_create",
	staff_edit: "staff_edit",
	staff_delete: "staff_delete",

	// Documents type
	document_type_create: "document_type_create",
	document_type_view: "document_type_view",
	document_type_edit: "document_type_edit",
	document_type_delete: "document_type_delete",

	// Faculties
	faculty_create: "faculty_create",
	faculty_view: "faculty_view",
	faculty_edit: "faculty_edit",
	faculty_delete: "faculty_delete",

	// Departments
	department_create: "department_create",
	department_view: "department_view",
	department_edit: "department_edit",
	department_delete: "department_delete",

	// Fields
	field_create: "field_create",
	field_view: "field_view",
	field_edit: "field_edit",
	field_delete: "field_delete",

	// Majors
	major_create: "major_create",
	major_view: "major_view",
	major_edit: "major_edit",
	major_delete: "major_delete",

	// Specialty
	specialty_create: "specialty_create",
	specialty_view: "specialty_view",
	specialty_edit: "specialty_edit",
	specialty_delete: "specialty_delete",

	// Settings
	settings_view: "settings_view",
} as const;

const PERMISSION_GROUPS: {
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

export type Permission = keyof typeof PERMISSIONS;
export type PermissionGroup = (typeof PERMISSION_GROUPS)[number];

export { PERMISSION_GROUPS };

// Preset permission sets
export const ROLE_PRESETS: Record<string, Permission[]> = {
	admin: Object.keys(PERMISSIONS) as Permission[],

	staff: [
		"students_view",
		"students_create",
		"students_edit",
		"documents_view",
		"documents_upload",
	],

	readonly: [
		"students_view",
		"documents_view",
		"faculty_view",
		"department_view",
		"field_view",
		"major_view",
		"specialty_view",
	],
};
