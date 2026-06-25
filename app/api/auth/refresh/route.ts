// app/api/auth/refresh/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const authHeader = req.headers.get("authorization");

	if (!authHeader) {
		return NextResponse.json({ error: "No token provided" }, { status: 401 });
	}

	const pbRes = await fetch(
		`${process.env.PB_URL}/api/collections/Archive_users/auth-refresh`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: authHeader,
			},
		},
	);

	const data = await pbRes.json();
	return NextResponse.json(data, { status: pbRes.status });
}
