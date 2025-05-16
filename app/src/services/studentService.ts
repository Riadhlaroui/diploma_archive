import pb from "@/lib/pocketbase";

export interface Student {
	id: string;
	matricule: string;
	firstName: string;
	lastName: string;
	enrollmentYear: number;
	dateOfBirth: Date;
	specialtyId: string;
	year: Date;
	createdAt: Date;
	updatedAt: Date;
}

export const createStudent = async (data: {
	matricule: string;
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	enrollmentYear: string;
	specialtyId: string;
}) => {
	return await pb.collection("Archive_students").create(data);
};
