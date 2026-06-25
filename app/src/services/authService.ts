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
		const res = await fetch("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		const data = await res.json();

		if (res.status === 429) {
			return { success: false, errorKey: ERROR_KEYS.TOO_MANY_ATTEMPTS };
		}

		if (!res.ok) {
			if (res.status === 400)
				return { success: false, errorKey: ERROR_KEYS.INVALID_CREDENTIALS };
			if (res.status === 404)
				return { success: false, errorKey: ERROR_KEYS.NOT_FOUND };
			return { success: false, errorKey: ERROR_KEYS.UNKNOWN_ERROR };
		}

		// Save into pb exactly as the SDK normally would
		pb.authStore.save(data.token, data.record);

		console.log("baseUrl:", pb.baseURL);
		console.log("isValid:", pb.authStore.isValid);
		console.log("token:", pb.authStore.token?.slice(0, 30));
		console.log("all localStorage keys:", Object.keys(localStorage));

		const user = data.record;

		if (user.isActive === false) {
			pb.authStore.clear();
			return { success: false, errorKey: ERROR_KEYS.ACCOUNT_DISABLED };
		}

		if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
			pb.authStore.clear();
			return { success: false, errorKey: ERROR_KEYS.ACCOUNT_EXPIRED };
		}

		return { success: true };
	} catch {
		return { success: false, errorKey: ERROR_KEYS.UNKNOWN_ERROR };
	}
}
