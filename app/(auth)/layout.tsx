// app/(auth)/layout.tsx
import { ThemeProvider } from "@/components/theme-provider";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="min-h-screen flex items-center justify-center">
			<ThemeProvider
				attribute="class"
				defaultTheme="light" // ✅ Set default to light
				enableSystem={false} // ❌ Disable system theme if you want light as true default
				disableTransitionOnChange
			>
				{children}
			</ThemeProvider>
		</main>
	);
}
