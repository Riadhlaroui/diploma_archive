import { useEffect } from "react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { toast } from "sonner";

export function useSessionGuard() {
	const router = useRouter();

	useEffect(() => {
		const validate = async () => {
			// Not logged in at all
			if (!pb.authStore.isValid) {
				router.replace("/sign-in");
				return;
			}

			try {
				// Fetch fresh data from server — overrides any localStorage tampering
				const { record } = await pb.collection("Archive_users").authRefresh();

				// Account disabled
				if (record.isActive === false) {
					pb.authStore.clear();
					toast.error("Your account has been disabled.");
					router.replace("/sign-in");
					return;
				}

				// Account expired
				if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
					pb.authStore.clear();
					toast.error("Your account has expired. Contact an administrator.");
					router.replace("/sign-in");
					return;
				}
			} catch {
				// Token invalid or server error
				pb.authStore.clear();
				router.replace("/sign-in");
			}
		};

		validate();

		// Re-check every 5 minutes while the app is open
		const interval = setInterval(validate, 5 * 60 * 1000);
		return () => clearInterval(interval);
	}, [router]);
}
