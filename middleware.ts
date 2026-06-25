// middleware.ts

import { NextRequest, NextResponse } from "next/server";

// In-memory store: ip -> { count, firstRequest }
const attempts = new Map<string, { count: number; firstAt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 15 minutes

export function middleware(req: NextRequest) {
	// Only protect the login endpoint
	if (req.nextUrl.pathname !== "/api/auth/login") {
		return NextResponse.next();
	}

	const ip =
		req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
		req.headers.get("x-real-ip") ??
		"unknown";

	const now = Date.now();
	const entry = attempts.get(ip);

	// First attempt or window expired — reset
	if (!entry || now - entry.firstAt > WINDOW_MS) {
		attempts.set(ip, { count: 1, firstAt: now });
		return NextResponse.next();
	}

	// Within window — increment
	entry.count++;

	if (entry.count > MAX_ATTEMPTS) {
		const retryAfter = Math.ceil((entry.firstAt + WINDOW_MS - now) / 1000);
		return NextResponse.json(
			{ error: "TOO_MANY_ATTEMPTS" },
			{
				status: 429,
				headers: { "Retry-After": String(retryAfter) },
			},
		);
	}

	return NextResponse.next();
}

export const config = {
	matcher: "/api/auth/login",
};
