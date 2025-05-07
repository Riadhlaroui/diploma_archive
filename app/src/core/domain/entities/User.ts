export type UserRole = "admin" | "staff";

export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: UserRole;
	createdAt: Date;
	updatedAt: Date;
}
