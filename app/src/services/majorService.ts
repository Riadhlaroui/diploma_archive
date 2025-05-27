import pb from "@/lib/pocketbase";

export async function getMajors(
	fieldId: string,
	page: number = 1,
	perPage: number = 10,
	search: string = ""
) {
	try {
		const result = await pb
			.collection("Archive_majors")
			.getList(page, perPage, {
				filter:
					`fieldId="${fieldId}"` + (search ? ` && name ~ "${search}"` : ""),
				sort: "-created",
			});

		return {
			items: result.items,
			totalPages: result.totalPages,
		};
	} catch (error) {
		console.error("Failed to fetch majors:", error);
		return {
			items: [],
			totalPages: 1,
		};
	}
}

export async function getMajorByName(name: string, fieldId: string) {
	try {
		const result = await pb
			.collection("Archive_fields")
			.getFirstListItem(`name="${name}" && fieldId="${fieldId}"`, {});
		return result;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		if (error.status === 404) {
			return null; // No field with that name
		}
		throw error; // Unexpected error
	}
}

export async function getSpecialtiesByMajor(
	majorId: string,
	page: number = 1,
	perPage: number = 10,
	search: string = ""
) {
	try {
		const filter = `majorId="${majorId}"${
			search ? ` && name ~ "${search}"` : ""
		}`;

		const result = await pb
			.collection("Archive_specialties")
			.getList(page, perPage, {
				filter,
				sort: "-created",
			});

		return {
			items: result.items,
			totalPages: result.totalPages,
		};
	} catch (error) {
		console.error("Error fetching specialties by major:", error);
		throw error;
	}
}

export async function updateMajor(id: string, data: { name: string }) {
	try {
		const result = await pb.collection("Archive_majors").update(id, data);
		return result;
	} catch (error) {
		console.error("Error updating field:", error);
		throw error;
	}
}

export async function getMajorById(majorId: string) {
	try {
		const major = await pb.collection("Archive_majors").getOne(majorId);
		return major;
	} catch (error) {
		console.error("Error fetching major by ID:", error);
		throw error;
	}
}

export async function deleteMajor(id: string) {
	try {
		await pb.collection("Archive_majors").delete(id);
	} catch (error) {
		console.error("Failed to delete major:", error);
		throw error;
	}
}
