"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
	const router = useRouter();

	return (
		<div className="w-full flex flex-col items-center justify-center gap-2 transition-colors duration-300">
			This is the home page
			<button
				onClick={() => router.push("/sign-in")}
				className="outline outline-dashed p-2 mt-2 hover:cursor-pointer"
			>
				Go to Login
			</button>
		</div>
	);
}
