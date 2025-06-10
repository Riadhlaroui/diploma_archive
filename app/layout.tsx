// app/layout.tsx
import "../lib/i18n";

import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider"; // ✅ import

const cairo = Cairo({
	subsets: ["arabic", "latin"],
	variable: "--font-cairo",
	display: "swap",
});

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Archive",
	description: "Student documents archive",
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = await cookies();
	const lang = cookieStore.get("lang")?.value || "en";
	const isRTL = lang === "ar";

	return (
		<html
			lang={lang}
			dir={isRTL ? "rtl" : "ltr"}
			className={`${inter.variable} ${cairo.variable}`}
			suppressHydrationWarning
		>
			<body className="font-sans">
				<ThemeProvider
					attribute="class"
					defaultTheme="light" // ✅ default to light
					enableSystem={false} // ✅ force light as default
					disableTransitionOnChange
				>
					{children}
					<Toaster richColors />
				</ThemeProvider>
			</body>
		</html>
	);
}
