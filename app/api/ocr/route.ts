// app/api/ocr/route.ts
// Secure server-side proxy to Anthropic Vision API for student document OCR.

import { NextRequest, NextResponse } from "next/server";

// app/api/ocr/route.ts

const OCR_SYSTEM_PROMPT = `You are an expert OCR assistant specializing in Algerian university student documents.
Documents may be in Arabic, French, or both languages.

Extract ALL of the following student fields from the provided documents.
Return ONLY a valid JSON object — no markdown, no explanation, no extra text.

{
  "matricule":      "student registration number — numeric string, typically 8–12 digits",
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

export async function POST(request: NextRequest) {
	try {
		const apiKey = process.env.ANTHROPIC_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "ANTHROPIC_API_KEY not configured" },
				{ status: 500 },
			);
		}

		const body = await request.json();
		const files: { data: string; mediaType: string }[] = body.files ?? [];

		if (!files.length) {
			return NextResponse.json({ error: "No files provided" }, { status: 400 });
		}

		// Build the content array — images + PDFs + the instruction text
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const content: any[] = [];

		for (const file of files.slice(0, 5)) {
			if (file.mediaType === "application/pdf") {
				content.push({
					type: "document",
					source: {
						type: "base64",
						media_type: "application/pdf",
						data: file.data,
					},
				});
			} else if (file.mediaType.startsWith("image/")) {
				content.push({
					type: "image",
					source: {
						type: "base64",
						media_type: file.mediaType,
						data: file.data,
					},
				});
			}
		}

		content.push({ type: "text", text: OCR_SYSTEM_PROMPT });

		const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": apiKey,
				"anthropic-version": "2023-06-01",
			},
			body: JSON.stringify({
				model: "claude-sonnet-4-20250514",
				max_tokens: 1024,
				messages: [{ role: "user", content }],
			}),
		});

		if (!anthropicRes.ok) {
			const errText = await anthropicRes.text();
			console.error("Anthropic API error:", errText);
			return NextResponse.json(
				{ error: `Anthropic API error ${anthropicRes.status}` },
				{ status: 502 },
			);
		}

		const data = await anthropicRes.json();
		const rawText = data.content
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.map((c: any) => (c.type === "text" ? c.text : ""))
			.join("");

		// Strip accidental markdown fences and parse
		const clean = rawText.replace(/```json|```/g, "").trim();
		const parsed = JSON.parse(clean);

		return NextResponse.json(parsed);
	} catch (err) {
		console.error("OCR route error:", err);
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
