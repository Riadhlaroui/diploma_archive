"use client";

import React, { useState } from "react";
import { recognizeImage, recognizePDF } from "../app/src/shared/utils/ocr";

export default function OCRUploader() {
	const [logs, setLogs] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		setIsLoading(true);
		setLogs([]); // Clear previous logs

		const files = Array.from(e.target.files);

		for (const file of files) {
			try {
				setLogs((prev) => [...prev, `Processing: ${file.name}...`]);
				let text = "";

				if (file.type === "application/pdf") {
					text = await recognizePDF(file);
				} else if (file.type.startsWith("image/")) {
					text = await recognizeImage(file);
				} else {
					setLogs((prev) => [
						...prev,
						`Skipped ${file.name} (unsupported format)`,
					]);
					continue;
				}

				// Output the result
				setLogs((prev) => [
					...prev,
					`✅ Result for ${file.name}:\n${text.slice(0, 100)}...`,
				]); // Showing first 100 chars
			} catch (err) {
				console.error(err);
				setLogs((prev) => [...prev, `❌ Error reading ${file.name}`]);
			}
		}
		setIsLoading(false);
	};

	return (
		<div className="p-4 space-y-4">
			<input
				type="file"
				multiple
				accept="image/*,.pdf"
				onChange={handleFiles}
				className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
			/>

			{isLoading && (
				<p className="text-blue-500 animate-pulse">Scanning documents...</p>
			)}

			<div className="bg-gray-100 p-4 rounded h-64 overflow-y-auto whitespace-pre-wrap font-mono text-xs">
				{logs.map((log, i) => (
					<div key={i} className="mb-2 border-b border-gray-200 pb-2">
						{log}
					</div>
				))}
			</div>
		</div>
	);
}
