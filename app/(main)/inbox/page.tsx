"use client";

import { RefreshCcw, Check, Copy, Loader2 } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import React, { useEffect, useState } from "react";
import { getInbox, InboxRecord } from "@/app/src/services/userService";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const AuditLogTable = () => {
	const { t, i18n } = useTranslation();

	const isRtl = i18n.language === "ar";

	const [page, setPage] = useState(1);
	const [logs, setLogs] = useState<InboxRecord[]>([]);
	const [totalPages, setTotalPages] = useState(1);
	const [copiedId, setCopiedId] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	const fetchData = async () => {
		try {
			setError(null);
			setLoading(true);
			const result = await getInbox(page);
			setLogs(result.items);
			setTotalPages(result.totalPages);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			console.error("Failed to fetch inbox:", err);
			setError(t("auditLogs.fetchError") || "Failed to load logs.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [page]);

	return (
		<div className="flex flex-col h-full mt-10 p-6 rounded-xl shadow-lg">
			<div className="flex gap-2 mb-4 items-center">
				<h3 className="text-2xl font-semibold">{t("auditLogs.title")}</h3>
				<Button
					onClick={fetchData}
					className="w-fit hover:cursor-pointer bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2"
				>
					{loading ? (
						<Loader2 className="animate-spin text-black dark:text-white" />
					) : (
						<RefreshCcw className="text-black dark:text-white" />
					)}
				</Button>
			</div>

			{error && (
				<div className="mb-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 p-3 rounded-md">
					{error}
				</div>
			)}

			<Table className="text-sm rounded-xl shadow-lg bg-white dark:bg-zinc-900">
				<TableHeader>
					<TableRow>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("auditLogs.action")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("auditLogs.userId")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("auditLogs.targetType")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("auditLogs.targetId")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("auditLogs.timestamp")}
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<TableRow>
							<TableCell colSpan={5} className="text-center py-6">
								<Loader2 className="mx-auto animate-spin text-gray-500" />
								<span className="text-sm text-gray-500 mt-2 block">
									{t("auditLogs.loading")}
								</span>
							</TableCell>
						</TableRow>
					) : logs.length > 0 ? (
						logs.map((log) => (
							<TableRow key={log.id}>
								<TableCell>
									<span
										className={cn(
											"inline-block rounded-full px-3 py-1 text-sm font-semibold capitalize",
											log.action.startsWith("create")
												? "bg-green-100 text-green-800"
												: log.action.startsWith("delete")
												? "bg-red-100 text-red-800"
												: log.action.startsWith("update")
												? "bg-yellow-100 text-yellow-800"
												: "bg-gray-100 text-gray-800"
										)}
									>
										{t(`actions.${log.action}`, {
											defaultValue: log.action.replace(/_/g, " "),
										})}
									</span>
								</TableCell>

								<TableCell className="text-gray-700">
									<span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-medium">
										{log.userEmail}
									</span>
								</TableCell>

								<TableCell>{log.targetType}</TableCell>

								<TableCell>
									<span className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-sm font-medium">
										{log.targetId}
										{copiedId === log.targetId ? (
											<Check size={14} className="text-green-600" />
										) : (
											<button
												onClick={() => {
													navigator.clipboard.writeText(log.targetId);
													setCopiedId(log.targetId);
													setTimeout(() => setCopiedId(""), 1500);
												}}
												title={t("auditLogs.copy")}
												className="hover:text-blue-500"
											>
												<Copy size={14} className=" hover:cursor-pointer" />
											</button>
										)}
									</span>
								</TableCell>

								<TableCell>
									{new Date(log.timestamp).toLocaleString()}
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={5} className="text-center py-6 text-gray-500">
								{t("auditLogs.noLogs")}
							</TableCell>
						</TableRow>
					)}
				</TableBody>
				<TableFooter>
					<TableRow>
						<TableCell colSpan={5} className="text-center py-3">
							<div className="flex items-center justify-center gap-4">
								<Button
									variant="outline"
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1}
									className=" hover:cursor-pointer"
								>
									{t("pagination.previous")}
								</Button>
								<span className="text-sm">
									{t("pagination.pageOf", { page, totalPages })}
								</span>
								<Button
									variant="outline"
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									disabled={page === totalPages}
									className=" hover:cursor-pointer"
								>
									{t("pagination.next")}
								</Button>
							</div>
						</TableCell>
					</TableRow>
				</TableFooter>
			</Table>
		</div>
	);
};

export default AuditLogTable;
