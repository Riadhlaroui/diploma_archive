"use client";
import {
	Cloud,
	Github,
	LifeBuoy,
	LogOut,
	PlusCircle,
	Settings,
	User as UserIcon,
	User2,
	Users,
	UserRoundPlus,
	UserRoundX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { CircleUserRound } from "lucide-react";
import { clearAurthStore } from "../app/src/shared/utils/getUserInfo";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import AddStaffDialog from "./AddStaffDialog";
import DeleteStaffDialog from "./DeleteStaffDialog";
import { getCurrentUser } from "@/app/src/services/userService";
import { User } from "@/app/src/core/domain/entities/User";

export function ProfileDropDownMenu({ isCollapsed }: { isCollapsed: boolean }) {
	const [showLogoutDialog, setShowLogoutDialog] = useState(false);

	const [openAddDialog, setOpenAddDialog] = useState(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

	const [isClient, setIsClient] = useState(false);

	const [user, setUser] = useState<User | null>(null);

	const router = useRouter();

	const { t } = useTranslation();

	//The older way to get user info
	//const user2 = getUserInfo();

	// The newer way to get user info using the getCurrentUser function
	useEffect(() => {
		// Ensure we're rendering on the client
		setIsClient(true);
		getCurrentUser().then(setUser);
	}, []);

	if (!isClient) return null; // Return nothing during SSR to prevent hydration issues
	if (!user) return <p className="w-full">Not logged in</p>;

	const handleLogout = () => {
		console.log("User logged out.");
		clearAurthStore();
		router.push("/");
		setShowLogoutDialog(false);
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<div className="flex items-center gap-3 w-full p-1 rounded-sm outline-dashed outline-2 border-[0px] bg-muted transition-colors hover:cursor-pointer">
						{isCollapsed && <User2 className=" opacity-90 w-[24px] h-[24px]" />}
						{!isCollapsed && (
							<>
								<CircleUserRound className="ml-1.5 size-[2rem] flex-shrink-0 opacity-90" />
								<div className=" flex flex-col items-start">
									<div className="flex items-start gap-1">
										<p className=" font-semibold">{user?.firstName}</p>
										<p className=" font-semibold">{user?.lastName}</p>
									</div>
									<span className="text-sm opacity-65 truncate max-w-fit overflow-hidden text-ellipsis whitespace-nowrap cursor-default">
										{user?.email}
									</span>
								</div>
							</>
						)}
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-full min-w-[15rem]">
					<DropdownMenuLabel>{t("profile.myAccount")}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem
							className=" hover:cursor-pointer"
							onClick={() => router.push("/profile")}
						>
							<UserIcon />
							<span>{t("profile.profile")}</span>
						</DropdownMenuItem>
						<DropdownMenuItem className=" hover:cursor-pointer">
							<Settings />
							<span>{t("profile.settings")}</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					{user?.role !== "staff" && (
						<DropdownMenuGroup>
							<DropdownMenuItem className=" hover:cursor-pointer">
								<Users />
								<span>{t("profile.team")}</span>
							</DropdownMenuItem>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger className=" hover:cursor-pointer">
									<span>{t("profile.addUser")}</span>
								</DropdownMenuSubTrigger>
								<DropdownMenuPortal>
									<DropdownMenuSubContent>
										<DropdownMenuItem
											className="hover:cursor-pointer"
											onClick={() => setOpenAddDialog(true)}
										>
											<UserRoundPlus />
											<span>{t("profile.addMember")}</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className=" hover:cursor-pointer"
											onClick={() => setOpenDeleteDialog(true)}
										>
											<UserRoundX />
											<span>{t("profile.deleteMember")}</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem>
											<PlusCircle />
											<span>More...</span>
										</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>
						</DropdownMenuGroup>
					)}

					<DropdownMenuSeparator />
					<DropdownMenuItem className=" hover:cursor-pointer">
						<Github />
						<span>GitHub</span>
					</DropdownMenuItem>
					<DropdownMenuItem className=" hover:cursor-pointer">
						<LifeBuoy />
						<span>Support</span>
					</DropdownMenuItem>
					<DropdownMenuItem disabled>
						<Cloud />
						<span>API</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="hover:cursor-pointer"
						onClick={() => setShowLogoutDialog(true)}
					>
						<LogOut />
						<span>{t("profile.logout")}</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Add Staff Dialog */}
			<AddStaffDialog open={openAddDialog} onOpenChange={setOpenAddDialog} />

			{/* Delete Staff Dialog */}
			<DeleteStaffDialog
				open={openDeleteDialog}
				onOpenChange={setOpenDeleteDialog}
			/>

			{/* Logout Dialog */}
			{showLogoutDialog && (
				<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
					<div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 max-w-sm w-full space-y-4 text-center">
						<h2 className="text-lg font-semibold">
							{t("profile.logoutConfirm")}
						</h2>
						<p className="text-sm text-zinc-600 dark:text-zinc-400">
							{t("profile.logoutMessage")}
						</p>
						<div className="flex justify-center gap-4 pt-4">
							<Button
								className=" hover:cursor-pointer"
								variant="outline"
								onClick={() => setShowLogoutDialog(false)}
							>
								{t("profile.cancel")}
							</Button>
							<Button
								className="hover:cursor-pointer"
								variant="destructive"
								onClick={handleLogout}
							>
								{t("profile.logout")}
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
