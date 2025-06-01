// app/(main)/layout.tsx
"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/theme-provider";

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { i18n } = useTranslation();
	const [dir, setDir] = useState<"ltr" | "rtl">("ltr");
	const [defaultOpen, setDefaultOpen] = useState<boolean>(true); // fallback default

	useEffect(() => {
		// Set text direction based on language
		const direction = i18n.language === "ar" ? "rtl" : "ltr";
		document.documentElement.dir = direction;
		setDir(direction);

		// Read sidebar state from localStorage instead of cookies
		const savedState = localStorage.getItem("sidebar_state");
		if (savedState !== null) {
			setDefaultOpen(savedState === "true");
		}
	}, [i18n.language]);

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<AppSidebar />
			<main className="w-full min-h-screen flex flex-col" dir={dir}>
				<SidebarTrigger />
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</main>
		</SidebarProvider>
	);
}
