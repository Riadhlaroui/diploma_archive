// lib/constants/errors.ts
export const ERROR_KEYS = {
	// Authentication Errors
	INVALID_CREDENTIALS: "errors.sign-in.invalidCredentials",
	ACCOUNT_DISABLED: "errors.sign-in.accountDisabled",
	ACCOUNT_EXPIRED: "errors.sign-in.accountExpired",
	TOO_MANY_ATTEMPTS: "errors.sign-in.tooManyAttempts",
	NOT_FOUND: "errors.sign-in.notFound",

	// Profile Errors
	NAME_REQUIRED: "errors.profile.nameRequired",
	FILL_ALL_FIELDS: "errors.profile.fillAll",
	INVALID_EMAIL: "errors.profile.invalidEmail",
	SAME_EMAIL: "errors.profile.sameEmail",
	EMAIL_ALREADY_EXISTS: "errors.profile.emailExists",
	WRONG_PASSWORD: "errors.profile.wrongPassword",
	SAME_PASSWORD: "errors.profile.samePassword",
	UPDATE_FAILED: "errors.profile.updateFailed",

	// AddStaff Errors
	MISMATCHED_PASSWORDS: "errors.addStaffDialog.mismatchTitle",
	MISMATCHED_PASSWORDS_SHORT: "errors.addStaffDialog.mismatchShort",
	MISSMATCHED_PASSWORDS_DESCRIPTION: "errors.addStaffDialog.mismatchDesc",
	MISSING_FIELDS_TITLE: "errors.addStaffDialog.missingTitle",
	MISSING_FIELDS_DESC: "errors.addStaffDialog.missingDesc",
	WEAK_PASSWORD_TITLE: "errors.addStaffDialog.weakTitle",
	WEAK_PASSWORD_DESC: "errors.addStaffDialog.weakDesc",
	FAILED_TO_CREATE_STAFF: "errors.addStaffDialog.userCreatedError",
	EMAIL_STAFF_ALREADY_EXISTS: "errors.addStaffDialog.emailExistsTitle",
	EMAIL_STAFF_ALREADY_EXISTS_DESC: "errors.addStaffDialog.emailExistsDesc",

	// DeleteStaff Errors
	FETCH_STAFF_FAILED: "errors.deleteStaffDialog.fetchFailed",
	DELETE_STAFF_FAILED: "errors.deleteStaffDialog.deleteFailed",
	PARTIAL_STAFF_FAIL: "errors.deleteStaffDialog.partialFail",

	// UpdateStaff Errors
	FAILED_TO_UPDATE_STAFF: "errors.editUserDialog.errorMessage",

	// Faculties Errors
	CREATE_FACULTY_FAILED: "errors.createFacultyFailed",
	UPDATE_FACULTY_FAILED: "errors.updateFacultyFailed",
	DELETE_FACULTY_FAILED: "errors.faculties.deleteError",
	FACULTY_ERROR: "errors.faculties.error",
	DUPLICATE_ADDFACULTY_ERROR_TITLE: "errors.addFaculty.duplicateTitle",
	DUPLICATE_ADDFACULTY_ERROR_SUBTITLE: "errors.addFaculty.duplicateSubtitle",
	ADDFACULTY_ERROR_TITLE: "errors.addFaculty.errorTitle",
	ADDFACULTY_ERROR_SUBTITLE: "errors.addFaculty.errorSubtitle",

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
	CREATE_STUDENT_FAILED: "errors.students.createStudentFailed",
	UPDATE_STUDENT_FAILED: "errors.students.updateStudentFailed",
	DELETE_STUDENT_FAILED: "errors.students.deleteStudentFailed",
	MATRICULE_ALREADY_EXISTS: "errors.students.matriculeAlreadyExists",
	REQUIRED_STUDENT_FIELD: "errors.students.requiredField",
	NO_DOCUMENTS: "errors.students.noDocuments",
	INVALID_DOB: "errors.students.invalidDOB",
	FUTURE_DOB: "errors.students.futureDOB",
	INVALID_ENROLLMENT_YEAR: "errors.students.invalidEnrollmentYear",
	EXISTS: "errors.students.exists",
	CHOOSE_DIFFERENT: "errors.students.chooseDifferent",
	CREATION_ERROR: "errors.students.creationError",
	DELETE_FAILED: "errors.students.deleteFailed",
	INVALID_GRADUATION_YEAR: "errors.students.invalidGraduationYear",
	GRADUATION_BEFORE_ENROLLMENT: "errors.students.graduationBeforeEnrollment",

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
