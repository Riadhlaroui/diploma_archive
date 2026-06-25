import pb from "@/lib/pocketbase";

export function getUserInfo() {
	return pb.authStore.record;
}

export function isAuthenticated() {
	return pb.authStore.isValid;
}

export function getToken() {
	return pb.authStore.token;
}

export function getUserId() {
	return pb.authStore.record?.id ?? null;
}

export function clearAurthStore() {
	return pb.authStore.clear();
}
