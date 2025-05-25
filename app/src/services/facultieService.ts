/* eslint-disable @typescript-eslint/no-explicit-any */
import pb from "@/lib/pocketbase";

export interface FacultieList {
	id: string;
	name: string;
	departmentCount: number;
	createdAt: string;
	updatedAt?: string;
}

export async function addFaculty(name: string) {
	try {
		// Create a new faculty record with departmentCount set to 0
		const record = await pb.collection("Archive_faculties").create({
			name,
			numberOfDepartments: 0,
		});

		console.log("Faculty added:", record);
		return record;
	} catch (error) {
		console.error("Error adding faculty:", error);
		throw error;
	}
}

export async function deleteFaculty(id: string) {
	try {
		await pb.collection("Archive_faculties").delete(id);
		console.log(`Faculty with ID ${id} deleted successfully.`);
	} catch (error) {
		console.error(`Error deleting faculty with ID ${id}:`, error);
		throw error;
	}
}

export async function getDepartments(
	facultyId: string,
	page = 1,
	perPage = 10
) {
	if (!facultyId) {
		console.error("Missing facultyId!");
		return { items: [], totalPages: 1 };
	}

	try {
		// Fetch paginated departments for the given faculty
		const departmentsResponse = await pb
			.collection("Archive_departments")
			.getList(page, perPage, {
				filter: `facultyId="${facultyId}"`,
				sort: "-created",
			});

		// Fetch all specialties to count them per department
		const allSpecialties = await pb
			.collection("Archive_specialties")
			.getFullList();

		// Count specialties by department ID
		const specialtyCountMap: Record<string, number> = {};
		for (const specialty of allSpecialties) {
			const deptId = specialty.departmentId;
			if (specialtyCountMap[deptId]) {
				specialtyCountMap[deptId]++;
			} else {
				specialtyCountMap[deptId] = 1;
			}
		}

		const items = departmentsResponse.items.map((dept: any) => ({
			...dept,
			specialtiesCount: specialtyCountMap[dept.id] || 0, // <-- match the name used in UI
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

export async function getFacultyByName(name: string) {
	try {
		const result = await pb
			.collection("Archive_faculties")
			.getFirstListItem(`name="${name}"`);
		return result;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		return null; // Not found is okay
	}
}

export async function getFacultyById(facultyId: string) {
	try {
		const faculty = await pb.collection("Archive_faculties").getOne(facultyId);
		return faculty;
	} catch (error) {
		console.error("Error fetching faculty:", error);
		return null;
	}
}

export async function updateFaculty(id: string, data: { name: string }) {
	return await pb.collection("Archive_faculties").update(id, data);
}

export async function getFaculties(
	page: number = 1,
	perPage: number = 10
): Promise<{ items: FacultieList[]; totalPages: number }> {
	const facultiesResponse = await pb
		.collection("Archive_faculties")
		.getList(page, perPage, {
			sort: "-created",
		});

	const departments = await pb.collection("Archive_departments").getFullList();

	const facultyMap: Record<string, number> = {};
	for (const dept of departments) {
		const facultyId = dept.facultyId;
		if (facultyMap[facultyId]) {
			facultyMap[facultyId]++;
		} else {
			facultyMap[facultyId] = 1;
		}
	}

	const items = facultiesResponse.items.map((faculty: any) => ({
		id: faculty.id,
		name: faculty.name,
		createdAt: faculty.created,
		updatedAt: faculty.updated,
		departmentCount: facultyMap[faculty.id] || 0,
	}));

	return {
		items,
		totalPages: facultiesResponse.totalPages,
	};
}
