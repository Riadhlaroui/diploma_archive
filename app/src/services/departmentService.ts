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
