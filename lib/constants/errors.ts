// lib/constants/errors.ts
export const ERROR_KEYS = {
	// Faculties Errors
	CREATE_FACULTY_FAILED: "errors.createFacultyFailed",
	UPDATE_FACULTY_FAILED: "errors.updateFacultyFailed",
	DELETE_FACULTY_FAILED: "errors.deleteFacultyFailed",

	// Departments Errors
	CREATE_DEPARTMENT_FAILED: "errors.createDepartmentFailed",
	UPDATE_DEPARTMENT_FAILED: "errors.updateDepartmentFailed",
	DELETE_DEPARTMENT_FAILED: "errors.deleteDepartmentFailed",

	// Fields Errors
	CREATE_FIELD_FAILED: "errors.createFieldFailed",
	UPDATE_FIELD_FAILED: "errors.updateFieldFailed",
	DELETE_FIELD_FAILED: "errors.deleteFieldFailed",

	// Majors Errors
	CREATE_MAJOR_FAILED: "errors.createMajorFailed",
	UPDATE_MAJOR_FAILED: "errors.updateMajorFailed",
	DELETE_MAJOR_FAILED: "errors.deleteMajorFailed",

	// Specialties Errors
	CREATE_SPECIALTY_FAILED: "errors.createSpecialtyFailed",
	UPDATE_SPECIALTY_FAILED: "errors.updateSpecialtyFailed",
	DELETE_SPECIALTY_FAILED: "errors.deleteSpecialtyFailed",

	// Students Errors
	CREATE_STUDENT_FAILED: "errors.createStudentFailed",
	UPDATE_STUDENT_FAILED: "errors.updateStudentFailed",
	DELETE_STUDENT_FAILED: "errors.deleteStudentFailed",
	MATRICULE_ALREADY_EXISTS: "errors.matriculeAlreadyExists",
	INVALID_STUDENT_YEAR_RANGE: "errors.invalidStudentYearRange",

	// Bulk Import Errors
	IMPORT_FAILED: "errors.importFailed",
	INVALID_YEAR_RANGE: "errors.invalidYearRange",
	REQUIRED_FIELD: "errors.requiredField",
	UPLOAD_FAILED: "errors.uploadFailed",
	DUPLICATE_ENTRY: "errors.duplicateEntry",
	FILE_NOT_SUPPORTED: "errors.fileNotSupported",

	// Team Errors
	CREATE_TEAM_FAILED: "errors.createTeamFailed",
	UPDATE_TEAM_FAILED: "errors.updateTeamFailed",
	DELETE_TEAM_FAILED: "errors.deleteTeamFailed",
	UNAUTHORIZED_TEAM_ACTION: "errors.unauthorizedTeamAction",

	// Generic Errors
	GENERIC_ERROR: "errors.genericError",
	UNKNOWN_ERROR: "errors.unknownError",
} as const;

export type ErrorKey = (typeof ERROR_KEYS)[keyof typeof ERROR_KEYS];
