import pb from "@/lib/pocketbase";
import { User } from "../core/domain/entities/User";
import { Permission, ROLE_PRESETS } from "../config/permissions";

export type UserRole = "admin" | "staff";

type createUserInput = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	passwordConfirm?: string;
	role: UserRole;
	phone: string;
	isActive?: boolean;
	expiresAt?: string | null;
	permissions?: Permission[];
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
	isActive: boolean;
	expiresAt: string | null;
	permissions: Permission[];
	createdAt: string;
	updatedAt?: string;
}

export function isAccountExpired(expiresAt: string | null): boolean {
	if (!expiresAt) return false;
	return new Date(expiresAt) < new Date();
}

export function hasPermission(
	user: UserList | null,
	permission: Permission,
): boolean {
	if (!user) return false;
	if (user.role === "admin") return true;
	return user.permissions.includes(permission);
}

export function isAccountActive(user: UserList | null): boolean {
	if (!user) return false;
	if (!user.isActive) return false;
	if (isAccountExpired(user.expiresAt)) return false;
	return true;
}

export async function validateSession(): Promise<{
	valid: boolean;
	reason?: "not_authenticated" | "account_disabled" | "account_expired";
}> {
	if (!pb.authStore.isValid || !pb.authStore.model) {
		return { valid: false, reason: "not_authenticated" };
	}

	const model = pb.authStore.model;

	if (model.isActive === false) {
		pb.authStore.clear();
		return { valid: false, reason: "account_disabled" };
	}

	if (model.expiresAt && new Date(model.expiresAt) < new Date()) {
		pb.authStore.clear();
		return { valid: false, reason: "account_expired" };
	}

	return { valid: true };
}

export async function createUser(data: createUserInput): Promise<User | null> {
	const permissions = data.permissions ?? ROLE_PRESETS[data.role] ?? [];

	const record = await pb.collection("Archive_users").create({
		...data,
		passwordConfirm: data.password,
		emailVisibility: true,
		isActive: data.isActive ?? true,
		expiresAt: data.expiresAt ?? null,
		permissions,
	});

	console.log("Created user: ", record);

	const currentUser = pb.authStore.model;
	if (currentUser) {
		await pb.collection("Archive_inbox").create({
			action: "create_user",
			userEmail: currentUser.email,
			targetType: "user",
			targetId: record.id,
			timestamp: new Date().toISOString(),
			details: { createdUserEmail: record.email, role: record.role },
		});
	}

	return mapRecord(record);
}

export async function updateUser(
	id: string,
	data: Partial<createUserInput>,
): Promise<User | null> {
	const updated = await pb.collection("Archive_users").update(id, data);

	const currentUser = pb.authStore.model;
	if (currentUser) {
		await pb.collection("Archive_inbox").create({
			action: "update_user",
			userEmail: currentUser.email,
			targetType: "user",
			targetId: id,
			timestamp: new Date().toISOString(),
			details: { updatedFields: Object.keys(data) },
		});
	}

	return mapRecord(updated);
}

export async function getUsers(): Promise<UserList[]> {
	const records = await pb.collection("Archive_users").getFullList({
		sort: "-created",
	});
	return records.map(mapUserList);
}

export async function getUsersList(page = 1, perPage = 13, searchTerm = "") {
	const filter = searchTerm
		? `firstName ~ "${searchTerm}" || lastName ~ "${searchTerm}" || email ~ "${searchTerm}"`
		: "";

	const result = await pb
		.collection("Archive_users")
		.getList(page, perPage, { sort: "-created", filter });

	return {
		items: result.items.map(mapUserList),
		page: result.page,
		perPage: result.perPage,
		totalPages: result.totalPages,
		totalItems: result.totalItems,
	};
}

export async function deleteUser(id: string): Promise<void> {
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
}

export async function toggleUserActive(
	id: string,
	isActive: boolean,
): Promise<void> {
	await pb.collection("Archive_users").update(id, { isActive });

	const currentUser = pb.authStore.model;
	if (currentUser) {
		await pb.collection("Archive_inbox").create({
			action: isActive ? "enable_user" : "disable_user",
			userEmail: currentUser.email,
			targetType: "user",
			targetId: id,
			timestamp: new Date().toISOString(),
		});
	}
}

export async function getCurrentUser(): Promise<UserList | null> {
	const model = pb.authStore.model;
	if (!model) return null;
	return mapUserList(model);
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

function mapRecord(r: any): User {
	return {
		id: r.id,
		firstName: r.firstName,
		lastName: r.lastName,
		email: r.email,
		role: r.role,
		phone: r.phone,
		createdAt: new Date(r.created),
		updatedAt: new Date(r.updated),
	};
}

function mapUserList(item: any): UserList {
	return {
		id: item.id,
		firstName: item.firstName,
		lastName: item.lastName,
		email: item.email,
		role: item.role,
		phone: item.phone,
		isActive: item.isActive ?? true,
		expiresAt: item.expiresAt || null,
		permissions: item.permissions ?? ROLE_PRESETS[item.role] ?? [],
		createdAt: item.created,
		updatedAt: item.updated,
	};
}
