// application/services/authService.ts
import { ensureUserIsAuthenticated } from "../core/use-cases/ensureUserIsAuthenticated";

export function checkAuthOrRedirect(
	router: ReturnType<typeof import("next/navigation").useRouter>
) {
	if (!ensureUserIsAuthenticated()) {
		router.replace("/sign-in");
	}
}
