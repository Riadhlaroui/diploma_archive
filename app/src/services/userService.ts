// userService.ts

import pb from "@/lib/pocketbase";
import { User } from "../core/domain/entities/User";

type createUserInput = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	passwordConfirm?: string;
	role: "admin" | "staff";
	phone: string;
};

export type InboxRecord = {
	id: string;
	action: string;
	userEmail: string;
	targetType: string;
	targetId: string;
	timestamp: string;
};

export async function getCurrentUser(): Promise<User | null> {
	try {
		const record = pb.authStore.model;
		if (!record) return null;

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

		const currentUser = pb.authStore.model;

		if (currentUser) {
			await pb.collection("Archive_inbox").create({
				action: "create_user",
				userEmail: currentUser.email,
				targetType: "user",
				targetId: record.id,
				timestamp: new Date().toISOString(),
				details: {
					createdUserEmail: record.email,
					role: record.role,
				},
			});
		}

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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error("Error response from PocketBase:", error?.response || error);
		throw error;
	}
}

export async function getInbox(page = 1, perPage = 16) {
	try {
		const result = await pb
			.collection("Archive_inbox")
			.getList<InboxRecord>(page, perPage, { sort: "-created" });
		return result;
	} catch (error) {
		console.error("Failed to fetch audit logs:", error);
		return {
			items: [],
			page: 1,
			perPage,
			totalPages: 1,
			totalItems: 0,
		};
	}
}

export async function getUsers() {
	try {
		const records = await pb.collection("Archive_users").getFullList({
			sort: "-created",
		});

		return records.map((record) => ({
			id: record.id,
			firstName: record.firstName,
			lastName: record.lastName,
			email: record.email,
			phone: record.phone,
			role: record.role,
			createdAt: new Date(record.created),
			updatedAt: new Date(record.updated),
		}));

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error("Error response from PocketBase:", error?.response || error);
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
