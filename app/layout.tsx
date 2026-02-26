// app/layout.tsx
import "../lib/i18n/i18n";

import type { Metadata } from "next";
import { Cairo, Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";

const cairo = Cairo({
	subsets: ["arabic", "latin"],
	variable: "--font-cairo",
	display: "swap",
});

const ibmArabic = IBM_Plex_Sans_Arabic({
	weight: ["300", "400", "500", "700"], // IBM Plex requires explicit weights
	subsets: ["arabic"],
	variable: "--font-ibm-arabic",
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
		<html lang={lang} dir={isRTL ? "rtl" : "ltr"} suppressHydrationWarning>
			<body
				className={`
                    ${cairo.variable} ${inter.variable}  ${ibmArabic}
                    ${isRTL ? "font-ibm-arabic" : "font-sans"}
                    antialiased overflow-x-hidden
                `}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem={false}
					disableTransitionOnChange
				>
					{children}
					<Toaster richColors />
				</ThemeProvider>
			</body>
		</html>
	);
}
