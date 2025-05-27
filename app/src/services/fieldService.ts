import pb from "@/lib/pocketbase";

export async function addField(data: {
	name: string;
	code: string;
	departmentId: string;
}) {
	try {
		const newDepartment = await pb.collection("Archive_fields").create(data);
		return newDepartment;
	} catch (error) {
		console.error("Error adding field:", error);
		throw new Error("Failed to add field.");
	}
}

export const isFieldNameTaken = async (name: string, departmentId: string) => {
	try {
		const result = await pb
			.collection("Archive_fields")
			.getFirstListItem(`name="${name}" && department="${departmentId}"`);
		return !!result; // Returns true if a record is found
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		if (error?.status === 404) {
			return false; // No field with the same name found
		}
		throw error; // Unexpected error, rethrow it
	}
};

export async function getFieldById(fieldId: string) {
	try {
		const field = await pb.collection("Archive_fields").getOne(fieldId);
		return field;
	} catch (error) {
		console.error("Error fetching field by ID:", error);
		return null;
	}
}

export async function getFields(
	departmentId: string,
	page = 1,
	perPage = 10,
	searchTerm: string = ""
) {
	if (!departmentId) {
		console.error("Missing departmentId!");
		return { items: [], totalPages: 1 };
	}

	// Build filter string for fields
	let filter = `departmentId="${departmentId}"`;
	if (searchTerm.trim()) {
		filter += ` && name ~ "${searchTerm.trim()}"`;
	}

	try {
		// Fetch paginated fields for the given department
		const fieldsResponse = await pb
			.collection("Archive_fields")
			.getList(page, perPage, {
				filter,
				sort: "-created",
			});

		// Fetch all majors to count them by field
		const allMajors = await pb.collection("Archive_majors").getFullList({
			fields: "fieldId",
		});

		// Count majors by fieldId
		const majorsCountMap: Record<string, number> = {};
		for (const major of allMajors) {
			const fieldId = major.fieldId;
			majorsCountMap[fieldId] = (majorsCountMap[fieldId] || 0) + 1;
		}

		// Add majorsCount to each field item
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const items = fieldsResponse.items.map((field: any) => ({
			...field,
			majorsCount: majorsCountMap[field.id] || 0,
		}));

		return {
			items,
			totalPages: fieldsResponse.totalPages,
		};
	} catch (error) {
		console.error("Error fetching fields:", error);
		return { items: [], totalPages: 1 };
	}
}

export async function getFieldByName(name: string, departmentId: string) {
	try {
		const result = await pb
			.collection("Archive_fields")
			.getFirstListItem(`name="${name}" && departmentId="${departmentId}"`, {});
		return result;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		if (error.status === 404) {
			return null; // No field with that name
		}
		throw error; // Unexpected error
	}
}

export async function updateField(id: string, data: { name: string }) {
	try {
		const result = await pb.collection("Archive_fields").update(id, data);
		return result;
	} catch (error) {
		console.error("Error updating field:", error);
		throw error;
	}
}

export async function deleteField(fieldId: string) {
	try {
		await pb.collection("fields").delete(fieldId);
	} catch (error) {
		console.error("Error deleting field:", error);
		throw error;
	}
}
