// core/use-cases/ensureUserIsAuthenticated.ts
import pb from "../../infrastructure/auth/pocketbaseClient";

export const ensureUserIsAuthenticated = (): boolean => {
	return pb.authStore.isValid;
};
