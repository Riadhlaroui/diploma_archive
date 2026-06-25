import { useState, useEffect, useRef } from "react";
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
	const [lockoutSeconds, setLockoutSeconds] = useState(0);

	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

	// Countdown timer
	useEffect(() => {
		if (lockoutSeconds <= 0) {
			if (timerRef.current) clearInterval(timerRef.current);
			return;
		}

		timerRef.current = setInterval(() => {
			setLockoutSeconds((prev) => {
				if (prev <= 1) {
					clearInterval(timerRef.current!);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [lockoutSeconds]);

	function switchLanguage(lang: "en" | "fr" | "ar") {
		i18n.changeLanguage(lang);
		localStorage.setItem("lang", lang);
	}

	function togglePasswordVisibility() {
		setIsPasswordVisible((prev) => !prev);
	}

	// Format seconds as mm:ss
	function formatCountdown(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	}

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault();

		// Block submission while locked out
		if (lockoutSeconds > 0) return;

		setIsLoading(true);

		const result = await checkAndLogin(email, password);

		if (!result.success && result.errorKey) {
			if (result.errorKey === ERROR_KEYS.TOO_MANY_ATTEMPTS) {
				setLockoutSeconds(10 * 60); // 15 minutes in seconds
			}
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
		email,
		setEmail,
		password,
		setPassword,
		isLoading,
		isPasswordVisible,
		checkingAuth,
		lockoutSeconds,
		formatCountdown,
		t,
		i18n,
		switchLanguage,
		togglePasswordVisibility,
		handleLogin,
	};
}
