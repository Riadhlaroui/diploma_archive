// app/layout.tsx or app/(main)/layout.tsx
import { cookies } from "next/headers";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/theme-provider";
import i18n from "@/lib/i18n"; // Import your i18n setup

export default async function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = await cookies();
	const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

	const currentLang = i18n.language;
	const dir = currentLang === "ar" ? "rtl" : "ltr"; // RTL for Arabic, LTR otherwise

	return (
		<html lang={currentLang} dir={dir}>
			{" "}
			{/* Set the dir attribute */}
			<SidebarProvider defaultOpen={defaultOpen}>
				<AppSidebar />
				<main className="w-full min-h-screen flex flex-col">
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
		</html>
	);
}
