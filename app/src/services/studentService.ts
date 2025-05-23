import pb from "@/lib/pocketbase";

export interface Student {
	id: string;
	matricule: string;
	firstName: string;
	lastName: string;
	enrollmentYear: number;
	dateOfBirth: Date;
	specialtyId: string;
	year: Date;
	createdAt: Date;
	updatedAt: Date;
}

export const createStudent = async (data: {
	matricule: string;
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	enrollmentYear: string;
	specialtyId: string;
}) => {
	return await pb.collection("Archive_students").create(data);
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
