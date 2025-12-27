// app/(main)/layout.tsx
"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
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

			{/* REPLACE <main> with <SidebarInset> */}
			<SidebarInset>
				<header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
				</header>

				{/* Wrap children in a div that fills the remaining height */}
				<div className="flex flex-1 flex-col">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
