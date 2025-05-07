// userService.ts

import pb from "@/lib/pocketbase";
import { User } from "../core/domain/entities/User";

type createUserInput = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	passwordConfirm?: string; // ✅ Add this field
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
			phone: record.phone,
			createdAt: new Date(record.created),
			updatedAt: new Date(record.updated),
		};
	} catch {
		return null;
	}
}

export async function createUser(data: createUserInput): Promise<User | null> {
	try {
		const record = await pb.collection("Archive_users").create({
			...data,
			passwordConfirm: data.password,
		});

		console.log("User record:", record);
		return {
			id: record.id,
			firstName: record.firstName,
			lastName: record.lastName,
			email: record.email,
			phone: record.phone,
			role: record.role,
			createdAt: new Date(record.created),
			updatedAt: new Date(record.updated),
		};
	} catch (error) {
		console.error("Error response from PocketBase:", error);
		throw error;
	}
}

export async function getCurrentUserRole(): Promise<"admin" | "staff" | null> {
	try {
		const record = pb.authStore.model;
		if (!record) return null;

		return record.role as "admin" | "staff";
	} catch {
		return null;
	}
}
