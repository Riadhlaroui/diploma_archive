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

export async function addDepartment(data: {
	name: string;
	code: string;
	facultyId: string;
}) {
	try {
		const newDepartment = await pb
			.collection("Archive_departments")
			.create(data);
		return newDepartment;
	} catch (error) {
		console.error("Error adding department:", error);
		throw new Error("Failed to add department.");
	}
}

export async function deleteDepartment(departmentId: string) {
	try {
		await pb.collection("Archive_departments").delete(departmentId);
	} catch (error) {
		console.error("Error deleting department:", error);
		throw new Error("Failed to delete department.");
	}
}

export async function updateDepartment(
	departmentId: string,
	data: { name: string }
) {
	try {
		const updatedDepartment = await pb
			.collection("Archive_departments")
			.update(departmentId, data);
		return updatedDepartment;
	} catch (error) {
		console.error("Error updating department:", error);
		throw new Error("Failed to update department.");
	}
}

export async function getDepartmentByName(name: string) {
	try {
		const result = await pb
			.collection("Archive_departments")
			.getFirstListItem(`name = "${name}"`);
		return result;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		// Handle "not found" (404) as a valid case
		if (error.status === 404) {
			return null; // No department found with this name
		}
		console.error("Error fetching department by name:", error);
		throw new Error("Failed to fetch department by name.");
	}
}
