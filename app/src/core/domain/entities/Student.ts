export interface Student {
	id: string;
	firstName: string;
	lastName: string;
	enrollmentYear: number;
	faculty: string; // e.g., "Computer Science"
	diplomaType: string; // e.g., "Bachelor of Science"
	year: Date;
	createdAt: Date;
	updatedAt: Date;
}
