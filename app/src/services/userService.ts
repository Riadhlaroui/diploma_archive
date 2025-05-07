// userService.ts

import pb from "@/lib/pocketbase";
import { User } from "../core/domain/entities/User";

type createUserInput = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role: "admin" | "staff";
	phone: string;
};

export async function getCurrentUser(): Promise<User | null> {
	try {
		const record = pb.authStore.model;
		if (!record) return null;

		console.log("User record:", record);

		return {
			id: record.id,
			firstName: record.firstName,
			lastName: record.lastName,
			email: record.email,
			role: record.role,
			createdAt: new Date(record.created),
			updatedAt: new Date(record.updated),
		};
	} catch {
		return null;
	}
}

export async function createUser(data: createUserInput): Promise<User | null> {
	try {
		const record = await pb.collection("Archive_users").create(data);

		return {
			id: record.id,
			firstName: record.firstName,
			lastName: record.lastName,
			email: record.email,
			role: record.role,
			createdAt: new Date(record.created),
			updatedAt: new Date(record.updated),
		};
	} catch (error) {
		console.error("Failed to create user:", error);
		throw error;
	}
}
