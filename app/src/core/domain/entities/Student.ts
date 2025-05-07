export interface Student {
	id: string;
	firstName: string;
	lastName: string;
	enrollmentYear: number;
	cycle: string; // e.g., "Undergraduate", "Master"
	level: string; // e.g., "L1", "M2"
	field: string; // e.g., "Engineering"
	major: string; // e.g., "Computer Science"
	specialization: string; // e.g., "AI & ML"
	createdAt: Date;
	updatedAt: Date;
}
