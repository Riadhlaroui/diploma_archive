import pb from "@/lib/pocketbase";

export async function getSpecialtiesByMajor(
	majorId: string,
	page: number = 1,
	perPage: number = 10,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
	try {
		const result = await pb
			.collection("Archive_specialties")
			.getList(page, perPage, {
				filter: `majorId = "${majorId}"`,
				sort: "-created",
			});

		return {
			items: result.items,
			totalPages: result.totalPages,
		};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error("Error fetching specialties by major:", error);
		throw error;
	}
}

export async function isSpecialtyNameTaken(
	name: string,
	majorId: string,
): Promise<boolean> {
	const trimmedName = name.trim();
	const trimmedMajorId = majorId.trim();

	if (!trimmedName || !trimmedMajorId) return false;

	try {
		const result = await pb.collection("Archive_specialties").getList(1, 1, {
			filter: pb.filter("name = {:name} && majorId = {:majorId}", {
				name: trimmedName,
				majorId: trimmedMajorId,
			}),
			fields: "id",
			requestKey: null,
		});
		return result.totalItems > 0;
	} catch (error: any) {
		if (error.isAbort) return false;
		console.error("Error checking specialty name:", error);
		return false;
	}
}

export const addSpecialty = async ({
	name,
	majorId,
}: {
	name: string;
	major?: string;
	majorId: string;
}) => {
	return await pb.collection("Archive_specialties").create({
		name,
		majorId,
	});
};

export async function getSpecialtyByName(name: string, majorId: string) {
	try {
		const result = await pb
			.collection("Archive_specialties")
			.getFirstListItem(`name="${name}" && majorId="${majorId}"`, {});
		return result;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		if (error.status === 404) {
			return null; // No field with that name
		}
		throw error; // Unexpected error
	}
}

export async function updateSpecialty(id: string, data: { name: string }) {
	try {
		const result = await pb.collection("Archive_specialties").update(id, data);
		return result;
	} catch (error) {
		console.error("Error updating specialty:", error);
		throw error;
	}
}

export async function deleteSpecialtyById(id: string) {
	try {
		await pb.collection("Archive_specialties").delete(id);
	} catch (error) {
		console.error("Error deleting specialty:", error);
		throw new Error("Failed to delete specialty.");
	}
}
