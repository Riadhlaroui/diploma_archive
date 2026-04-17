// app/api/ocr-gemini/route.ts
import { NextRequest, NextResponse } from "next/server";

const OCR_SYSTEM_PROMPT = `You are an expert OCR assistant specializing in Algerian university student documents.
Documents may be in Arabic, French, or both languages.

Extract ALL of the following student fields from the provided documents.
Return ONLY a valid JSON object — no markdown, no explanation, no extra text.

{
  "matricule":      "student registration number — the N° d'inscription field. May start with letters like UN followed by digits. Extract the full value as-is.",
  "firstName":      "first name / الاسم / prénom — use Latin script if available, otherwise transliterate from Arabic",
  "lastName":       "family name / اللقب / nom de famille — Latin script preferred",
  "dateOfBirth":    "date of birth in YYYY-MM-DD format",
  "enrollmentYear": "4-digit year the student first enrolled or registered",
  "graduationYear": "4-digit year the student graduated or completed their degree"
}

Sources to look for each field:
- matricule:      enrollment certificate, student card, any official header
- firstName/lastName: student card, ID copy, any official document header
- dateOfBirth:    national ID copy, birth certificate extract, student card
- enrollmentYear: first-year registration certificate, first transcript header
- graduationYear: diploma, final transcript, graduation attestation

Rules:
- Cross-reference across ALL provided documents — different docs may carry different fields
- If a field appears in multiple documents and values conflict, prefer the official diploma or student card
- If a field is genuinely absent from all documents, return null — do NOT guess or infer
- Return ONLY the JSON object, nothing else`;

// Model to use — flash-lite has 30 req/min vs flash's 10 req/min on free tier
const GEMINI_MODEL =
	process.env.NODE_ENV === "production"
		? "gemini-2.0-flash"
		: "gemini-2.0-flash-lite";

const GEMINI_URL = (apiKey: string) =>
	`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(
	url: string,
	body: object,
	retries = 4,
): Promise<Response> {
	let lastError: Error | null = null;

	for (let attempt = 0; attempt < retries; attempt++) {
		console.log(`  [Gemini] Attempt ${attempt + 1}/${retries}…`);

		let res: Response;
		try {
			res = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
		} catch (networkErr) {
			lastError =
				networkErr instanceof Error
					? networkErr
					: new Error(String(networkErr));
			const waitMs = Math.pow(2, attempt) * 1000;
			console.warn(
				`  [Gemini] Network error on attempt ${attempt + 1} — retrying in ${waitMs}ms:`,
				lastError.message,
			);
			await sleep(waitMs);
			continue;
		}

		console.log(`  [Gemini] HTTP ${res.status}`);

		if (res.status !== 429 && res.status < 500) return res;

		if (res.status === 429) {
			const retryAfterHeader = res.headers.get("Retry-After");
			const waitMs = retryAfterHeader
				? Number(retryAfterHeader) * 1000
				: 60_000;
			console.warn(
				`  [Gemini] 429 rate limit — waiting ${Math.round(waitMs / 1000)}s before attempt ${attempt + 2}`,
			);
			await sleep(waitMs);
			lastError = new Error("HTTP 429");
			continue;
		}

		const waitMs = Math.pow(2, attempt) * 1000;
		console.warn(
			`  [Gemini] ${res.status} server error — retrying in ${waitMs}ms`,
		);
		await sleep(waitMs);
		lastError = new Error(`HTTP ${res.status}`);
	}

	throw lastError ?? new Error("Gemini request failed after retries");
}

export async function POST(request: NextRequest) {
	const requestId = Math.random().toString(36).slice(2, 8); // short ID to match req/res in logs
	console.log(`\n[OCR ${requestId}] ▶ Request received`);

	try {
		const apiKey = process.env.GEMINI_API_KEY;
		if (!apiKey) {
			console.error(`[OCR ${requestId}] ❌ GEMINI_API_KEY not set`);
			return NextResponse.json(
				{ error: "GEMINI_API_KEY not configured" },
				{ status: 500 },
			);
		}

		const body = await request.json();
		const files: { data: string; mediaType: string }[] = body.files ?? [];
		console.log(
			`[OCR ${requestId}] 📎 ${files.length} file(s) received — types: [${files.map((f) => f.mediaType).join(", ")}]`,
		);

		if (!files.length) {
			return NextResponse.json({ error: "No files provided" }, { status: 400 });
		}

		const parts: object[] = [];
		let skipped = 0;

		for (const file of files) {
			if (
				file.mediaType === "application/pdf" ||
				file.mediaType.startsWith("image/")
			) {
				parts.push({
					inline_data: { mime_type: file.mediaType, data: file.data },
				});
			} else {
				console.warn(
					`[OCR ${requestId}] ⚠️  Skipping unsupported type: ${file.mediaType}`,
				);
				skipped++;
			}
		}

		console.log(
			`[OCR ${requestId}] 📤 Sending ${parts.length - 0} file part(s) to Gemini (${skipped} skipped) using model: ${GEMINI_MODEL}`,
		);

		parts.push({ text: OCR_SYSTEM_PROMPT });

		let geminiRes: Response;
		try {
			geminiRes = await fetchWithRetry(GEMINI_URL(apiKey), {
				contents: [{ parts }],
				generationConfig: { temperature: 0, maxOutputTokens: 512 },
			});
		} catch (retryErr) {
			console.error(`[OCR ${requestId}] ❌ All retries exhausted:`, retryErr);
			return NextResponse.json(
				{
					error:
						retryErr instanceof Error ? retryErr.message : "Gemini unavailable",
				},
				{ status: 502 },
			);
		}

		if (!geminiRes.ok) {
			const errText = await geminiRes.text();
			console.error(
				`[OCR ${requestId}] ❌ Gemini error ${geminiRes.status}:`,
				errText,
			);
			if (geminiRes.status === 429) {
				return NextResponse.json(
					{
						error:
							"OCR rate limit reached — reduce concurrency or wait a moment",
					},
					{ status: 429 },
				);
			}
			return NextResponse.json(
				{ error: `Gemini API error ${geminiRes.status}` },
				{ status: 502 },
			);
		}

		const data = await geminiRes.json();
		const candidate = data.candidates?.[0];

		if (!candidate) {
			console.error(
				`[OCR ${requestId}] ❌ No candidates returned. Full response:`,
				JSON.stringify(data),
			);
			return NextResponse.json(
				{ error: "Gemini returned no result — document may be unreadable" },
				{ status: 422 },
			);
		}

		const rawText: string =
			candidate.content?.parts
				?.map((p: { text?: string }) => p.text ?? "")
				.join("") ?? "";

		console.log(`[OCR ${requestId}] 📥 Raw Gemini output:`, rawText);

		if (!rawText.trim()) {
			console.error(`[OCR ${requestId}] ❌ Empty response text`);
			return NextResponse.json(
				{ error: "Gemini returned empty text" },
				{ status: 422 },
			);
		}

		const clean = rawText.replace(/```json|```/g, "").trim();

		let parsed: Record<string, unknown>;
		try {
			parsed = JSON.parse(clean);
		} catch {
			console.error(
				`[OCR ${requestId}] ❌ JSON parse failed. Raw text was:`,
				clean,
			);
			return NextResponse.json(
				{ error: "Gemini response was not valid JSON" },
				{ status: 422 },
			);
		}

		// Normalise "null" strings → actual null
		for (const key of Object.keys(parsed)) {
			if (parsed[key] === "null" || parsed[key] === "") parsed[key] = null;
		}

		console.log(`[OCR ${requestId}] ✅ Parsed result:`, parsed);
		console.log(`[OCR ${requestId}] ◀ Done\n`);

		return NextResponse.json(parsed);
	} catch (err) {
		console.error(`[OCR ${requestId}] 💥 Unhandled error:`, err);
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
