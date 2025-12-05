"use client";

import { useRouter } from "next/navigation";

export default function Home() {
	const router = useRouter();

	return (
		<div className="w-full flex flex-col items-center justify-center gap-2 transition-colors duration-300">
			<button
				onClick={() => router.push("/sign-in")}
				className="outline outline-dashed p-2 mt-2 hover:cursor-pointer"
			>
				Go to Login
			</button>
		</div>
	);
}
