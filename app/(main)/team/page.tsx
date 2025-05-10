"use client";

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
import { Button } from "@/components/ui/button";

import { RefreshCcw } from "lucide-react";

const StaffList = () => {
	return (
		<div className="flex flex-col h-full mt-10 p-6 rounded-xl shadow-lg">
			<div className="flex gap-2 mb-4 items-center">
				<h3 className="text-2xl font-semibold">Staff List</h3>
				<Button className="w-fit hover:cursor-pointer bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2">
					<RefreshCcw />
				</Button>
			</div>
			<Table className="text-sm rounded-xl shadow-lg bg-white dark:bg-zinc-900">
				<TableHeader>
					<TableRow>
						<TableHead>Id</TableHead>
						<TableHead>First name</TableHead>
						<TableHead>Last name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>role</TableHead>
						<TableHead>created</TableHead>
					</TableRow>
				</TableHeader>
			</Table>
		</div>
	);
};

export default StaffList;
