"use client";

import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

type Props = {
	value: string;
	onChange: (value: string) => void;
	showHint?: boolean;
};

export function PhoneInput({ value, onChange, showHint = true }: Props) {
	const { t } = useTranslation();
	const refs = useRef<(HTMLInputElement | null)[]>([]);

	const digits = value.replace(/\D/g, "").slice(0, 10).split("");
	while (digits.length < 10) digits.push("");

	const update = (newDigits: string[]) => {
		onChange(newDigits.join(""));
	};

	const handleKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
		idx: number,
	) => {
		if (e.key === "Backspace") {
			e.preventDefault();
			if (digits[idx] !== "") {
				const d = [...digits];
				d[idx] = "";
				update(d);
			} else if (idx > 0) {
				const d = [...digits];
				d[idx - 1] = "";
				update(d);
				refs.current[idx - 1]?.focus();
			}
		}
		if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
		if (e.key === "ArrowRight" && idx < 9) refs.current[idx + 1]?.focus();
	};

	const handleInput = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
		const char = e.target.value.replace(/\D/g, "").slice(-1);
		const d = [...digits];
		d[idx] = char;
		update(d);
		if (char && idx < 9) refs.current[idx + 1]?.focus();
	};

	const handlePaste = (e: React.ClipboardEvent, idx: number) => {
		e.preventDefault();
		const text = e.clipboardData.getData("text").replace(/\D/g, "");
		const d = [...digits];
		text.split("").forEach((c, i) => {
			if (idx + i < 10) d[idx + i] = c;
		});
		update(d);
		const next = Math.min(idx + text.length, 9);
		refs.current[next]?.focus();
	};

	// Groups: [0,1] - [2,3,4] - [5,6,7] - [8,9]
	const groups = [
		[0, 1],
		[2, 3, 4],
		[5, 6, 7],
		[8, 9],
	];

	const box = (idx: number) => (
		<input
			key={idx}
			ref={(el) => {
				refs.current[idx] = el;
			}}
			type="text"
			inputMode="numeric"
			maxLength={1}
			value={digits[idx]}
			onKeyDown={(e) => handleKeyDown(e, idx)}
			onChange={(e) => handleInput(e, idx)}
			onPaste={(e) => handlePaste(e, idx)}
			className={`w-7 h-8 text-center text-sm font-medium border rounded-md outline-none transition-all
        ${
					digits[idx]
						? "border-green-500 bg-green-50 text-green-900"
						: "border-gray-200 bg-white text-gray-900"
				}
        focus:border-green-500 focus:ring-2 focus:ring-green-100
      `}
		/>
	);

	return (
		<div dir="ltr">
			<div className="flex items-center gap-1">
				{groups.map((group, gi) => (
					<>
						{gi > 0 && (
							<span
								key={`sep-${gi}`}
								className="text-gray-300 text-sm select-none"
							>
								-
							</span>
						)}
						<div key={`g-${gi}`} className="flex gap-0.5">
							{group.map((idx) => box(idx))}
						</div>
					</>
				))}
			</div>
			{showHint && (
				<p className="text-xs text-gray-400 mt-1.5">{t("profile.phoneHint")}</p>
			)}
		</div>
	);
}
