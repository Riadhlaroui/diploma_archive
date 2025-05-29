import pb from "@/lib/pocketbase";

type StudentPayload = {
	matricule: string;
	firstName: string;
	lastName: string;
	dateOfBirth?: string;
	enrollmentYear: string;
	field: string;
	major: string;
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
		// Fetch paginated students with expanded specialty
		const studentsResponse = await pb
			.collection("Archive_students")
			.getList(page, perPage, {
				expand: "specialtyId",
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
