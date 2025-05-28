import pb from "@/lib/pocketbase";

import PocketBase from "pocketbase";

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

export const fetchStudents = async (page: number, perPage: number) => {
	const pb = new PocketBase("http://127.0.0.1:8090");

	const res = await pb.collection("Archive_students").getList(page, perPage, {
		expand: "specialtyId",
	});

	const studentsWithExtras = await Promise.all(
		res.items.map(async (student) => {
			res.items.map((student) => {
				console.log(student.specialty); // Should log the expanded specialty object or null
			});

			const pbInstance = new PocketBase("http://127.0.0.1:8090"); // new instance
			const documents = await pbInstance
				.collection("Archive_documents")
				.getFullList({
					filter: `studentId="${student.id}"`,
					fields: "id",
				});
			return {
				...student,
				documentsCount: documents.length,
			};
		})
	);

	return {
		items: studentsWithExtras,
		totalPages: res.totalPages,
	};
};
