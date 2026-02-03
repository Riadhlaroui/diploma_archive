// userService.ts

import pb from "@/lib/pocketbase";
import { User } from "../core/domain/entities/User";

export type UserRole = "admin" | "staff";

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

export interface UserList {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: UserRole;
	phone: string;
	createdAt: string;
	updatedAt?: string;
}

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
	} catch (error) {
		console.error("Error fetching current user:", error);
		return null;
	}
}

export async function createUser(data: createUserInput): Promise<User | null> {
	try {
		const record = await pb.collection("Archive_users").create({
			...data,
			passwordConfirm: data.password,
			emailVisibility: true,
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
		console.error(
			"Error response from PocketBase: Error in creating user",
			error?.response || error,
		);
		throw error;
	}
}

export async function getInbox(page = 1, perPage = 13) {
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

export async function getUsersList(
	page = 1,
	perPage = 13,
	searchTerm: string = "",
) {
	try {
		const filter = searchTerm
			? `firstName ~ "${searchTerm}" || lastName ~ "${searchTerm}" || email ~ "${searchTerm}"`
			: "";

		const result = await pb.collection("Archive_users").getList(page, perPage, {
			sort: "-created",
			filter,
		});

		const users: UserList[] = result.items.map((item) => ({
			id: item.id,
			firstName: item.firstName,
			lastName: item.lastName,
			email: item.email,
			role: item.role,
			phone: item.phone,
			createdAt: item.created,
			updatedAt: item.updated,
		}));

		return {
			items: users,
			page: result.page,
			perPage: result.perPage,
			totalPages: result.totalPages,
			totalItems: result.totalItems,
		};
	} catch (error) {
		console.error("Failed to fetch users:", error);
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
		console.error(
			"Error response from PocketBase: Getting list of users",
			error?.response || error,
		);
		throw error;
	}
}

export async function deleteUsers(userIds: string[]): Promise<void> {
	try {
		// Delete users one by one (PocketBase doesn't support batch delete natively)
		await Promise.all(
			userIds.map((id) => pb.collection("Archive_users").delete(id)),
		);
	} catch (error) {
		console.error("Error deleting users:", error);
		throw error;
	}
}

export async function deleteUser(id: string): Promise<void> {
	try {
		await pb.collection("Archive_users").delete(id);

		const currentUser = pb.authStore.model;

		if (currentUser) {
			await pb.collection("Archive_inbox").create({
				action: "delete_user",
				userEmail: currentUser.email,
				targetType: "user",
				targetId: id,
				timestamp: new Date().toISOString(),
			});
		}
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

export async function updateUser(
	id: string,
	data: Partial<createUserInput>,
): Promise<User | null> {
	try {
		const updatedRecord = await pb.collection("Archive_users").update(id, data);

		const currentUser = pb.authStore.model;

		if (currentUser) {
			await pb.collection("Archive_inbox").create({
				action: "update_user",
				userEmail: currentUser.email,
				targetType: "user",
				targetId: id,
				timestamp: new Date().toISOString(),
				details: {
					updatedFields: Object.keys(data),
					updatedUserEmail: updatedRecord.email,
				},
			});
		}

		return {
			id: updatedRecord.id,
			firstName: updatedRecord.firstName,
			lastName: updatedRecord.lastName,
			email: updatedRecord.email,
			phone: updatedRecord.phone,
			role: updatedRecord.role,
			createdAt: new Date(updatedRecord.created),
			updatedAt: new Date(updatedRecord.updated),
		};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error(
			"Error updating user:",
			error?.response?.data || error.message || error,
		);
		throw error;
	}
}
