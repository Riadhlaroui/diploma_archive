import pb from "@/lib/pocketbase";

type StudentPayload = {
	matricule: string;
	firstName: string;
	lastName: string;
	dateOfBirth?: string;
	enrollmentYear: string;
	fieldId: string;
	majorId: string;
	specialtyId: string;
};

export type FileWithType = {
	file: File;
	fileType: string;
};

export async function createStudentWithDocuments(
	studentData: StudentPayload,
	files: FileWithType[]
) {
	try {
		// Step 1: Create the student
		const student = await pb.collection("Archive_students").create(studentData);

		// Step 2: Upload files and link them
		for (const fileItem of files) {
			const { file, fileType } = fileItem;

			// Ensure file is not empty
			if (!file || file.size === 0) continue;

			// Step 2.1: Upload file using FormData
			const fileForm = new FormData();
			fileForm.append("file", file);
			fileForm.append("typeId", fileType);

			const fileRecord = await pb.collection("Archive_files").create(fileForm);

			// Step 2.2: Link file with student in Archive_documents
			await pb.collection("Archive_documents").create({
				studentId: student.id,
				fileId: fileRecord.id,
			});
		}

		return { success: true, studentId: student.id };
	} catch (error) {
		console.error(
			"Error creating student with documents:",
			typeof error === "object" && error !== null && "response" in error
				? // eslint-disable-next-line @typescript-eslint/no-explicit-any
				  (error as any).response
				: error
		);
		return { success: false, error };
	}
}

export async function getStudentsByDepartment(
	departmentId: string,
	page = 1,
	perPage = 10
) {
	if (!departmentId) {
		console.error("Missing departmentId!");
		return { items: [], totalPages: 1 };
	}

	try {
		const result = await pb
			.collection("Archive_students")
			.getList(page, perPage, {
				filter: `departmentId="${departmentId}"`,
				sort: "-created",
			});

		return {
			items: result.items,
			totalPages: result.totalPages,
		};
	} catch (error) {
		console.error("Error fetching students by department:", error);
		return {
			items: [],
			totalPages: 1,
		};
	}
}

export async function getStudentsWithSpecialtyAndDocumentCount() {
	try {
		// Step 1: Get students with their specialties
		const students = await pb.collection("Archive_students").getFullList({
			expand: "specialtyId",
			sort: "-created",
		});

		// Step 2: Get all documents (for counting per student)
		const documents = await pb.collection("Archive_documents").getFullList();

		// Step 3: Map students and count their documents
		const result = students.map((student) => {
			const documentCount = documents.filter(
				(doc) => doc.studentId === student.id
			).length;
			const specialtyName = student.expand?.specialtyId?.name || "N/A";

			return {
				studentId: student.id,
				studentName: student.name, // assuming 'name' field exists
				specialtyName,
				documentCount,
			};
		});

		return result;
	} catch (error) {
		console.error("Failed to fetch student data:", error);
		return [];
	}
}

export async function fetchStudents(page = 1, perPage = 10) {
	try {
		// Fetch paginated students with expanded specialty, field, and major
		const studentsResponse = await pb
			.collection("Archive_students")
			.getList(page, perPage, {
				expand: "specialtyId,fieldId,majorId",
				sort: "-created",
			});

		// Fetch all documents to count them by student
		const allDocuments = await pb.collection("Archive_documents").getFullList({
			fields: "studentId",
		});

		// Count documents by studentId
		const documentsCountMap: Record<string, number> = {};
		for (const doc of allDocuments) {
			const studentId = doc.studentId;
			documentsCountMap[studentId] = (documentsCountMap[studentId] || 0) + 1;
		}

		// Add documentsCount to each student
		const items = studentsResponse.items.map((student) => ({
			...student,
			documentsCount: documentsCountMap[student.id] || 0,
		}));

		return {
			items,
			totalPages: studentsResponse.totalPages,
		};
	} catch (error) {
		console.error("Error fetching students:", error);
		return { items: [], totalPages: 1 };
	}
}

interface StudentFilter {
	matricule?: string;
	searchQuery?: string; // for searching name or matricule
	facultyId?: string;
	departmentId?: string;
	fieldId?: string;
	majorId?: string;
	specialtyId?: string;
}

export async function searchStudents(
	filter: StudentFilter,
	page = 1,
	perPage = 10
) {
	let fieldIds: string[] | undefined;

	if (filter.departmentId) {
		const fieldsRes = await pb
			.collection("Archive_fields")
			.getFullList(undefined, {
				filter: `departmentId.id="${filter.departmentId}"`,
				expand: "departmentId,departmentId.facultyId",
			});

		console.log("Fields res:", fieldsRes);

		if (filter.facultyId) {
			fieldIds = fieldsRes
				.filter(
					(field) =>
						field.expand?.departmentId?.expand?.facultyId?.id ===
						filter.facultyId
				)
				.map((field) => field.id);
		} else {
			fieldIds = fieldsRes.map((field) => field.id);
		}

		console.log("Filtered field IDs:", fieldIds);

		if (!fieldIds.length) {
			return {
				items: [],
				page,
				perPage,
				totalItems: 0,
				totalPages: 0,
			};
		}
	}

	const filters: string[] = [];

	if (fieldIds) {
		const fieldFilters = fieldIds.map((id) => `fieldId.id="${id}"`);
		filters.push(`(${fieldFilters.join(" || ")})`);
	} else if (filter.fieldId) {
		filters.push(`fieldId.id="${filter.fieldId}"`);
	}

	if (filter.majorId) filters.push(`majorId.id="${filter.majorId}"`);
	if (filter.specialtyId)
		filters.push(`specialtyId.id="${filter.specialtyId}"`);

	if (filter.matricule) filters.push(`matricule~"${filter.matricule}"`);
	if (filter.searchQuery) {
		filters.push(
			`firstName~"${filter.searchQuery}" || lastName~"${filter.searchQuery}"`
		);
	}

	const filterString = filters.length > 0 ? filters.join(" && ") : undefined;

	console.log("Constructed filter string:", filterString);

	// Fetch filtered students with expansions
	const studentsResponse = await pb
		.collection("Archive_students")
		.getList(page, perPage, {
			filter: filterString,
			expand: "specialtyId,fieldId,majorId",
		});

	// Fetch all documents to count them by student
	const allDocuments = await pb.collection("Archive_documents").getFullList({
		fields: "studentId",
	});

	// Count documents per studentId
	const documentsCountMap: Record<string, number> = {};
	for (const doc of allDocuments) {
		const studentId = doc.studentId;
		documentsCountMap[studentId] = (documentsCountMap[studentId] || 0) + 1;
	}

	// Add documentsCount to each student
	const items = studentsResponse.items.map((student) => ({
		...student,
		documentsCount: documentsCountMap[student.id] || 0,
	}));

	return {
		items,
		totalPages: studentsResponse.totalPages,
		page,
		perPage,
	};
}
