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

			// Step 2.1: Upload file to Archive_files
			const fileRecord = await pb.collection("Archive_files").create({
				file,
				fileType,
			});

			// Step 2.2: Link file with student in Archive_documents
			await pb.collection("Archive_documents").create({
				studentId: student.id,
				fileId: fileRecord.id,
			});
		}

		return { success: true, studentId: student.id };
	} catch (error) {
		console.error("Error creating student with documents:", error);
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
