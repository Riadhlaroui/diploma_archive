import { ensureUserIsAuthenticated } from "../core/use-cases/ensureUserIsAuthenticated";
import pb from "@/lib/pocketbase";
import { ERROR_KEYS, ErrorKey } from "@/lib/constants/errors";

interface AuthCheckResult {
	success: boolean;
	errorKey?: ErrorKey;
}

export function checkAuthOrRedirect(
	router: ReturnType<typeof import("next/navigation").useRouter>,
) {
	if (!ensureUserIsAuthenticated()) {
		router.replace("/sign-in");
	}
}

export async function checkAndLogin(
	email: string,
	password: string,
): Promise<AuthCheckResult> {
	try {
		const auth = await pb
			.collection("Archive_users")
			.authWithPassword(email, password);

		const user = auth.record;

		if (user.isActive === false) {
			pb.authStore.clear();
			return { success: false, errorKey: ERROR_KEYS.ACCOUNT_DISABLED };
		}

		if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
			pb.authStore.clear();
			return { success: false, errorKey: ERROR_KEYS.ACCOUNT_EXPIRED };
		}

		return { success: true };
	} catch (error: any) {
		if (error?.status === 400) {
			return { success: false, errorKey: ERROR_KEYS.INVALID_CREDENTIALS };
		}
		if (error?.status === 404) {
			return { success: false, errorKey: ERROR_KEYS.NOT_FOUND };
		}
		if (error?.status === 429) {
			return { success: false, errorKey: ERROR_KEYS.TOO_MANY_ATTEMPTS };
		}
		return { success: false, errorKey: ERROR_KEYS.UNKNOWN_ERROR };
	}
}
