// app/(auth)/layout.tsx
import { ThemeProvider } from "@/components/theme-provider";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="min-h-screen flex items-center justify-center">
			<ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
				{children}
			</ThemeProvider>
		</main>
	);
}
