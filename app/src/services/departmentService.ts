import pb from "@/lib/pocketbase";

export async function getDepartmentById(departmentId: string) {
	try {
		const department = await pb
			.collection("Archive_departments")
			.getOne(departmentId);
		return department;
	} catch (error) {
		console.error("Error fetching department:", error);
		return null;
	}
}

export async function getSpecialtiesByDepartment(
	departmentId: string,
	page: number = 1,
	perPage: number = 10
) {
	try {
		const result = await pb
			.collection("Archive_specialties")
			.getList(page, perPage, {
				filter: `departmentId = "${departmentId}"`,
				sort: "-created",
			});

		// Map for clean pagination and total
		return {
			items: result.items,
			totalPages: result.totalPages,
			totalItems: result.totalItems,
		};
	} catch (error) {
		console.error("Error fetching specialties:", error);
		throw new Error("Failed to fetch specialties.");
	}
}
