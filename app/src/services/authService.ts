// application/services/authService.ts
import { ensureUserIsAuthenticated } from "../core/use-cases/ensureUserIsAuthenticated";
import pb from "@/lib/pocketbase";

type AuthCheckResult =
	| { success: true }
	| {
			success: false;
			reason: "disabled" | "expired" | "invalid_credentials" | "unknown";
	  };

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
			return { success: false, reason: "disabled" };
		}

		if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
			pb.authStore.clear();
			return { success: false, reason: "expired" };
		}

		return { success: true };
	} catch (error: any) {
		if (error?.status === 400) {
			return { success: false, reason: "invalid_credentials" };
		}
		return { success: false, reason: "unknown" };
	}
}
