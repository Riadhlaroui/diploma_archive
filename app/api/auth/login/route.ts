// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const { email, password } = await req.json();

	const pbRes = await fetch(
		`${process.env.PB_URL}/api/collections/Archive_users/auth-with-password`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ identity: email, password }),
		},
	);

	const data = await pbRes.json();
	return NextResponse.json(data, { status: pbRes.status });
}
