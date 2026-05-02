import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { toast } from "sonner";
import { checkAndLogin } from "@/app/src/services/authService";
import { useTranslation } from "react-i18next";
import { ERROR_KEYS } from "@/lib/constants/errors";

export function useSignInForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [checkingAuth, setCheckingAuth] = useState(true);

	const router = useRouter();
	const { t, i18n } = useTranslation();

	// Auth redirect check
	useEffect(() => {
		if (pb.authStore.isValid) {
			router.replace("/dashboard");
		} else {
			setCheckingAuth(false);
		}
	}, [router]);

	useEffect(() => {
		const savedLang = localStorage.getItem("lang") as "en" | "fr" | null;
		if (savedLang && savedLang !== i18n.language) {
			i18n.changeLanguage(savedLang);
		}
	}, [i18n]);

	function switchLanguage(lang: "en" | "fr" | "ar") {
		i18n.changeLanguage(lang);
		localStorage.setItem("lang", lang);
	}

	function togglePasswordVisibility() {
		setIsPasswordVisible((prev) => !prev);
	}

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault();
		setIsLoading(true);

		const result = await checkAndLogin(email, password);

		if (!result.success && result.errorKey) {
			toast.error(t(result.errorKey));
		}

		if (result.success) {
			router.push("/dashboard");
			toast.success(t("sign-in.success"));
			return;
		}

		setIsLoading(false);
	}

	return {
		// State
		email,
		setEmail,
		password,
		setPassword,
		isLoading,
		isPasswordVisible,
		checkingAuth,
		// i18n
		t,
		i18n,
		switchLanguage,
		// Handlers
		togglePasswordVisibility,
		handleLogin,
	};
}
