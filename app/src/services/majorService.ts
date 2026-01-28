import pb from "@/lib/pocketbase";

export async function addMajor(name: string, fieldId: string) {
	if (!name.trim() || !fieldId.trim()) {
		console.error("Name and fieldId are required to add a major.");
		return null;
	}

	try {
		const newMajor = await pb.collection("Archive_majors").create({
			name: name.trim(),
			fieldId: fieldId.trim(),
		});

		return newMajor;
	} catch (error) {
		console.error("Failed to add major:", error);
		throw error;
	}
}

export async function isMajorNameTaken(
	name: string,
	fieldId: string,
): Promise<boolean> {
	const trimmedName = name.trim();
	const trimmedFieldId = fieldId.trim();

	if (!trimmedName || !trimmedFieldId) return false;

	try {
		const result = await pb.collection("Archive_majors").getList(1, 1, {
			filter: pb.filter("name = {:name} && fieldId = {:fieldId}", {
				name: trimmedName,
				fieldId: trimmedFieldId,
			}),
			fields: "id",
			requestKey: null,
		});
		return result.totalItems > 0;
	} catch (error: any) {
		if (error.isAbort) return false;
		console.error("Error checking major name:", error);
		return false;
	}
}

export async function getMajors(
	fieldId: string,
	page = 1,
	perPage = 10,
	search = "",
) {
	if (!fieldId) {
		console.error("Missing fieldId!");
		return { items: [], totalPages: 1 };
	}

	// Build filter string for majors
	let filter = `fieldId="${fieldId}"`;
	if (search.trim()) {
		filter += ` && name ~ "${search.trim()}"`;
	}

	try {
		// Fetch paginated majors for the given field
		const majorsResponse = await pb
			.collection("Archive_majors")
			.getList(page, perPage, {
				filter,
				sort: "-created",
			});

		// Fetch all specialties to count them by major
		const allSpecialties = await pb
			.collection("Archive_specialties")
			.getFullList({
				fields: "majorId",
			});

		// Count specialties by majorId
		const specialtiesCountMap: Record<string, number> = {};
		for (const specialty of allSpecialties) {
			const majorId = specialty.majorId;
			specialtiesCountMap[majorId] = (specialtiesCountMap[majorId] || 0) + 1;
		}

		// Add specialtiesCount to each major item
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const items = majorsResponse.items.map((major: any) => ({
			...major,
			specialtiesCount: specialtiesCountMap[major.id] || 0,
		}));

		return {
			items,
			totalPages: majorsResponse.totalPages,
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
			.collection("Archive_majors")
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
	search: string = "",
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
