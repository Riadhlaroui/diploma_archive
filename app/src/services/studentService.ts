import pb from "@/lib/pocketbase";

interface CreateStudentInput {
	matricule: string;
	firstName: string;
	lastName: string;
	dateOfBirth: string; // ISO string
	enrollmentYear: string; // ISO string
	specialtyId: string;
	file?: File | null; // Optional file for document upload
}

export const createStudent = async (data: CreateStudentInput) => {
	try {
		// Step 1: Create the student
		const { file, ...studentData } = data;
		const student = await pb.collection("Archive_students").create(studentData);

		// Step 2: Upload document if a file is provided
		if (file) {
			const formData = new FormData();
			formData.append("studentId", student.id);
			formData.append("file", file);

			await pb.collection("Archive_documents").create(formData);
		}

		return student;
	} catch (error) {
		console.error("Failed to create student or upload document:", error);
		throw error;
	}
};

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
