import pb from "@/lib/pocketbase";

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

export const updateSpecialty = async (
	id: string,
	data: { name?: string; major?: string }
) => {
	return await pb.collection("Archive_specialties").update(id, data);
};
