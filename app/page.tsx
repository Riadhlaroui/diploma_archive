"use client";

import { BackgroundPaths } from "@/components/ui/background-paths";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function Home() {
	const router = useRouter();
	const { t, i18n } = useTranslation();

	return (
		<main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
			<div className="absolute inset-0 z-0">
				<BackgroundPaths />
			</div>

			<div className="relative z-10 flex flex-col items-center gap-4">
				<div
					className="inline-block group relative bg-linear-to-b from-black/10 to-white/10 
                        dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg 
                        overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
				>
					<button
						onClick={() => router.push("/sign-in")}
						className="rounded-[1.15rem] px-8 py-3 text-lg font-semibold backdrop-blur-md 
                            bg-white/95 hover:bg-white dark:bg-black/95 dark:hover:bg-black 
                            text-black dark:text-white transition-all duration-300 
                            group-hover:-translate-y-0.5 border border-black/10 dark:border-white/10
                            hover:shadow-md dark:hover:shadow-neutral-800/50"
					>
						<span className="opacity-90 group-hover:opacity-100 transition-opacity">
							{t("GoToLogin")}
						</span>
						<span
							className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                                transition-all duration-300"
						>
							→
						</span>
					</button>
				</div>
			</div>
		</main>
	);
}
