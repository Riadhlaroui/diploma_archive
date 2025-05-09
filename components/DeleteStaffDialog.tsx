"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Search, X, ShieldUser } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getUsers } from "@/app/src/services/userService";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "../app/src/core/domain/entities/User";
import { Separator } from "./ui/separator";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const DeleteStaffDialog = ({ open, onOpenChange }: Props) => {
	const [staffList, setStaffList] = useState<User[]>([]);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		if (open) {
			getUsers().then(setStaffList).catch(console.error);
		}
	}, [open]);

	console.log("staffList", staffList);

	const toggleCheck = (id: string) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
		);
	};

	const filteredStaff = staffList.filter((user) =>
		`${user.firstName} ${user.lastName} ${user.email}`
			.toLowerCase()
			.includes(searchTerm.toLowerCase())
	);

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
				<Dialog.Content
					className="w-full max-w-lg fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-md shadow-lg"
					onPointerDownOutside={(e) => e.preventDefault()}
				>
					<Dialog.Title className="text-xl font-semibold">
						Delete Staff Member
					</Dialog.Title>
					<Dialog.Close className="absolute top-2 right-2 text-gray-500 hover:text-black hover:cursor-pointer transition-colors duration-200">
						<X />
					</Dialog.Close>

					<div className="mt-4 w-full relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
						<input
							type="text"
							placeholder="Search for a staff member"
							className="w-full border border-gray-300 rounded-md p-2 pl-10 focus:outline-none"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					<div className="mt-4 max-h-[300px] overflow-y-auto space-y-2">
						{filteredStaff.length === 0 ? (
							<p className="text-sm text-gray-500">No staff found.</p>
						) : (
							filteredStaff.map((user) => (
								<div
									key={user.id}
									className="flex items-center gap-4 p-3 border shadow-sm  rounded-md"
								>
									<Checkbox
										className=" hover:cursor-pointer"
										checked={selectedIds.includes(user.id)}
										onCheckedChange={() => toggleCheck(user.id)}
									/>
									<div className="flex-1">
										<div className="flex flex-row items-center-safe gap-1.5">
											<p className="text-[18px] font-semibold text-gray-800">
												{user.firstName} {user.lastName}
											</p>

											{user.role === "admin" && (
												<ShieldUser className=" w-5 h-5 text-[#55e734]" />
											)}
										</div>
										<span className=" text-gray-400 text-sm">
											Role: {user.role}
										</span>
									</div>
								</div>
							))
						)}
					</div>
					<Separator className=" mt-1.5" />
					<div className="flex justify-end gap-3 mt-4">
						<Dialog.Close asChild>
							<button
								type="button"
								className="bg-gray-300 text-[#363636] font-semibold px-4 py-2 rounded-[3px] hover:cursor-pointer transition-colors duration-200"
							>
								Cancel
							</button>
						</Dialog.Close>
						<button
							type="submit"
							className="bg-[#363636] text-white px-4 font-semibold py-2 rounded-[3px] hover:bg-gray-900 hover:cursor-pointer transition-colors duration-200"
						>
							Delete Staff
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default DeleteStaffDialog;
