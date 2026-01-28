// components/ConfirmDialog.tsx
"use client";

import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

interface ConfirmDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description?: string;
}

export default function ConfirmDialog({
	open,
	onClose,
	onConfirm,
	title,
	description,
}: ConfirmDialogProps) {
	const { t } = useTranslation();

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md shadow-lg">
				<h2 className="text-lg font-semibold mb-2">{title}</h2>
				{description && (
					<p className="text-sm text-gray-600 mb-4">{description}</p>
				)}
				<div className="flex justify-end gap-2">
					<Button
						variant="ghost"
						onClick={onClose}
						className="hover:bg-gray-200 dark:hover:bg-zinc-800 hover:cursor-pointer border"
					>
						{t("common.cancel")}
					</Button>
					<Button
						variant="destructive"
						onClick={onConfirm}
						className="hover:bg-red-600 hover:cursor-pointer"
					>
						{t("common.delete")}
					</Button>
				</div>
			</div>
		</div>
	);
}
