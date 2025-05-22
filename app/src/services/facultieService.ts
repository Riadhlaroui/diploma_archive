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
