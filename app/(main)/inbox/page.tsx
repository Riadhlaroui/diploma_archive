"use client";

import { RefreshCcw, ClipboardCopyIcon, Check, Copy } from "lucide-react";

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

const AuditLogTable = () => {
	const [page, setPage] = useState(1);
	const [logs, setLogs] = useState<InboxRecord[]>([]);
	const [totalPages, setTotalPages] = useState(1);

	const [copiedId, setCopiedId] = useState("");

	const fetchData = async () => {
		const result = await getInbox(page);
		setLogs(result.items);
		setTotalPages(result.totalPages);
	};

	useEffect(() => {
		fetchData();
	}, [page]);

	return (
		<div className="flex flex-col h-full mt-10 p-6 rounded-xl shadow-lg">
			<div className="flex gap-2  mb-4">
				<h3 className="text-2xl font-semibold mb-4">Audit Logs</h3>
				<Button
					onClick={fetchData}
					className="w-fit hover:cursor-pointer bg-transparent  hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2"
				>
					<RefreshCcw className="text-black dark:text-white" />
				</Button>
			</div>

			<Table className="text-sm rounded-xl shadow-lg bg-white dark:bg-zinc-900">
				<TableHeader>
					<TableRow>
						<TableHead>Action</TableHead>
						<TableHead>User ID</TableHead>
						<TableHead>Target Type</TableHead>
						<TableHead>Target ID</TableHead>
						<TableHead>Timestamp</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{logs.map((log) => (
						<TableRow key={log.id}>
							<TableCell>
								<span
									className={cn(
										"inline-block rounded-full px-3 py-1 text-sm font-semibold capitalize",
										log.action.startsWith("create")
											? "bg-green-100 rounded-md text-green-800"
											: log.action.startsWith("delete")
											? "bg-red-100 text-red-800"
											: log.action.startsWith("update")
											? "bg-yellow-100 text-yellow-800"
											: "bg-gray-100 text-gray-800"
									)}
								>
									{log.action.replace(/_/g, " ")}
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
											title="Copy"
											className="hover:text-blue-500"
										>
											<Copy size={14} />
										</button>
									)}
								</span>
							</TableCell>

							<TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
						</TableRow>
					))}
				</TableBody>
				<TableFooter>
					<TableRow>
						<TableCell colSpan={5} className="text-center py-3">
							<div className="flex items-center justify-center gap-4">
								<Button
									variant="outline"
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1}
								>
									Previous
								</Button>
								<span className="text-sm">
									Page {page} of {totalPages}
								</span>
								<Button
									variant="outline"
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									disabled={page === totalPages}
								>
									Next
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
