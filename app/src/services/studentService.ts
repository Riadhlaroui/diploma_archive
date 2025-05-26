import pb from "@/lib/pocketbase";

interface CreateStudentInput {
	matricule: string;
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	enrollmentYear: string;
	specialtyId: string;
	field: string;
	major: string;
}

export const createStudent = async (
	data: CreateStudentInput,
	files: File[] = []
) => {
	try {
		console.log("Data sent to PocketBase:", data);
		console.log("Files sent to PocketBase:", files);

		// Disable auto-cancel for student creation
		const student = await pb.collection("Archive_students").create(data, {
			$autoCancel: false,
		});

		// Upload each document and link to student
		if (files.length > 0) {
			const uploadPromises = files.map((file) => {
				const formData = new FormData();
				formData.append("studentId", student.id); // relation field to student record
				formData.append("file", file); // file field to upload file

				// Disable auto-cancel for document uploads
				return pb.collection("Archive_documents").create(formData, {
					$autoCancel: false,
				});
			});

			await Promise.all(uploadPromises);
		}

		return student;
	} catch (error) {
		console.error("Failed to create student or upload documents:", error);
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
