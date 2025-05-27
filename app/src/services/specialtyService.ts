import pb from "@/lib/pocketbase";

export async function getSpecialtiesByMajor(
	majorId: string,
	page: number = 1,
	perPage: number = 10
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

export const addSpecialty = async ({
	name,
	major,
	departmentId,
}: {
	name: string;
	major?: string;
	departmentId: string;
}) => {
	return await pb.collection("Archive_specialties").create({
		name,
		major: major || "",
		departmentId,
	});
};

export const getSpecialtyByName = async (name: string) => {
	try {
		const result = await pb
			.collection("Archive_specialties")
			.getFirstListItem(`name="${name}"`);
		return result;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		// If no record found, return null instead of throwing
		if (error?.status === 404) return null;
		throw error;
	}
};

export const updateSpecialty = async (id: string, data: { name?: string }) => {
	return await pb.collection("Archive_specialties").update(id, data);
};

export async function deleteSpecialtyById(id: string) {
	try {
		await pb.collection("Archive_specialties").delete(id);
	} catch (error) {
		console.error("Error deleting specialty:", error);
		throw new Error("Failed to delete specialty.");
	}
}
