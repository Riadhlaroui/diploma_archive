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

export async function isDepartmentNameTaken(
	name: string,
	facultyId: string
): Promise<boolean> {
	const trimmedName = name.trim();
	const trimmedFacultyId = facultyId.trim();

	if (!trimmedName || !trimmedFacultyId) {
		console.error("Name and facultyId are required");
		return false;
	}

	try {
		// Case-insensitive search
		await pb
			.collection("Archive_departments")
			.getFirstListItem(
				`(name~"${trimmedName}" || name="${trimmedName}") && facultyId="${trimmedFacultyId}"`
			);
		return true;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		if (error.status === 404) return false;
		console.error("Error checking department name:", error);
		throw error;
	}
}

export async function getSpecialtiesByDepartment(
	departmentId: string,
	page: number = 1,
	perPage: number = 10,
	searchTerm: string = ""
) {
	if (!departmentId) {
		console.error("Missing departmentId!");
		return { items: [], totalPages: 1, totalItems: 0 };
	}

	// Build filter string
	let filter = `departmentId = "${departmentId}"`;
	if (searchTerm.trim()) {
		filter += ` && name ~ "${searchTerm.trim()}"`;
	}

	try {
		const result = await pb
			.collection("Archive_specialties")
			.getList(page, perPage, {
				filter,
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

export async function getDepartments(
	facultyId: string,
	page = 1,
	perPage = 10,
	searchTerm: string = ""
) {
	if (!facultyId) {
		console.error("Missing facultyId!");
		return { items: [], totalPages: 1 };
	}

	// Build filter string
	let filter = `facultyId="${facultyId}"`;
	if (searchTerm.trim()) {
		filter += ` && name ~ "${searchTerm.trim()}"`;
	}

	try {
		// Fetch paginated departments for the given faculty
		const departmentsResponse = await pb
			.collection("Archive_departments")
			.getList(page, perPage, {
				filter,
				sort: "-created",
			});

		// Fetch all fields to count them by department
		const allFields = await pb
			.collection("Archive_fields")
			.getFullList({ fields: "departmentId" });

		// Count fields by departmentId
		const fieldsCountMap: Record<string, number> = {};
		for (const field of allFields) {
			const deptId = field.departmentId;
			fieldsCountMap[deptId] = (fieldsCountMap[deptId] || 0) + 1;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const items = departmentsResponse.items.map((dept: any) => ({
			...dept,
			fieldsCount: fieldsCountMap[dept.id] || 0,
		}));

		return {
			items,
			totalPages: departmentsResponse.totalPages,
		};
	} catch (error) {
		console.error("Error fetching departments:", error);
		return { items: [], totalPages: 1 };
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

export async function getDepartmentByNameAndFaculty(
	name: string,
	facultyId: string
) {
	if (!name.trim() || !facultyId.trim()) {
		console.error("Name and facultyId are required");
		return null;
	}

	try {
		const result = await pb
			.collection("Archive_departments")
			.getFirstListItem(
				`name="${name.trim()}" && facultyId="${facultyId.trim()}"`
			);
		return result;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		if (error.status === 404) {
			return null;
		}
		console.error("Error fetching department by name and faculty:", error);
		throw new Error("Failed to fetch department by name and faculty.");
	}
}
