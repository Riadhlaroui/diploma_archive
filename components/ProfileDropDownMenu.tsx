"use client";

import {
	LogOut,
	Settings,
	User as UserIcon,
	User2,
	Users,
	UserRoundPlus,
	UserRoundX,
	ChevronRight,
	MoreVertical,
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
import { clearAurthStore } from "../app/src/shared/utils/getUserInfo";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import AddStaffDialog from "./StaffComponents/AddStaffDialog";
import DeleteStaffDialog from "./StaffComponents/DeleteStaffDialog";
import { getCurrentUser } from "@/app/src/services/userService";
import { User } from "@/app/src/core/domain/entities/User";

export function ProfileDropDownMenu({ isCollapsed }: { isCollapsed: boolean }) {
	const { i18n, t } = useTranslation();
	const isRtl = i18n.language === "ar";
	const router = useRouter();

	const [showLogoutDialog, setShowLogoutDialog] = useState(false);
	const [openAddDialog, setOpenAddDialog] = useState(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [isClient, setIsClient] = useState(false);
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		setIsClient(true);
		getCurrentUser().then(setUser);
	}, []);

	if (!isClient) return null;
	if (!user) return null;

	const handleLogout = () => {
		console.log("User logged out.");
		clearAurthStore();
		router.push("/");
		setShowLogoutDialog(false);
	};

	// Helper to get initials
	const initials =
		`${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();

	return (
		<>
			<DropdownMenu dir={isRtl ? "rtl" : "ltr"}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className={`w-full h-auto p-2 flex items-center gap-3 justify-start transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isCollapsed ? "justify-center px-2" : ""
							}`}
					>
						<div className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full items-center justify-center bg-muted border border-border">
							<span className="font-medium text-xs">
								{initials || <User2 className="h-4 w-4" />}
							</span>
						</div>

						{!isCollapsed && (
							<div className="flex flex-col items-start text-sm leading-tight max-w-[150px]">
								<span className="font-semibold truncate w-full">
									{user.firstName} {user.lastName}
								</span>
								<span className="text-xs text-muted-foreground truncate w-full">
									{user.email}
								</span>
							</div>
						)}
						{!isCollapsed && (
							<MoreVertical className="ml-auto h-4 w-4 text-muted-foreground/50" />
						)}
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
					align={isRtl ? "end" : "start"}
					side={isCollapsed ? "right" : "bottom"}
					sideOffset={8}
				>
					<div className="flex items-center gap-2 p-2">
						<div className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full items-center justify-center bg-muted border border-border">
							<span className="font-medium text-xs">
								{initials || <User2 className="h-4 w-4" />}
							</span>
						</div>
						<div className="flex flex-col space-y-0.5 leading-none">
							<p className="font-semibold text-sm">
								{user.firstName} {user.lastName}
							</p>
							<p className="text-xs text-muted-foreground truncate w-[160px]">
								{user.email}
							</p>
						</div>
					</div>

					<DropdownMenuSeparator />

					<DropdownMenuGroup>
						<DropdownMenuItem
							onClick={() => router.push("/profile")}
							className="gap-2 cursor-pointer"
						>
							<UserIcon className="size-4 text-muted-foreground" />
							<span>{t("profile.profile")}</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => router.push("/settings")}
							className="gap-2 cursor-pointer"
						>
							<Settings className="size-4 text-muted-foreground" />
							<span>{t("profile.settings")}</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />


					{user?.role !== "staff" && (
						<DropdownMenuGroup>
							<DropdownMenuItem
								className="gap-2 cursor-pointer"
								onClick={() => router.replace("/team")}
							>
								<Users className="size-4 text-muted-foreground" />
								<span>{t("profile.team")}</span>
							</DropdownMenuItem>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger className="gap-2 cursor-pointer">
									<UserRoundPlus className="size-4 text-muted-foreground" />
									<span>{t("profile.addUser")}</span>
								</DropdownMenuSubTrigger>

								<DropdownMenuPortal>
									<DropdownMenuSubContent>
										<DropdownMenuItem
											className="gap-2 cursor-pointer"
											onClick={() => setOpenAddDialog(true)}
										>
											<UserRoundPlus className="size-4 text-muted-foreground" />
											<span>{t("profile.addMember")}</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="gap-2 cursor-pointer text-destructive focus:text-destructive"
											onClick={() => setOpenDeleteDialog(true)}
										>
											<UserRoundX className="size-4" />
											<span>{t("profile.deleteMember")}</span>
										</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>
						</DropdownMenuGroup>
					)}

					<DropdownMenuSeparator />

					<DropdownMenuItem
						className="gap-2 cursor-pointer text-destructive focus:text-destructive"
						onClick={() => setShowLogoutDialog(true)}
					>
						<LogOut className="size-4" />
						<span>{t("profile.logout")}</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Dialogs */}
			<AddStaffDialog open={openAddDialog} onOpenChange={setOpenAddDialog} />
			<DeleteStaffDialog
				open={openDeleteDialog}
				onOpenChange={setOpenDeleteDialog}
			/>

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
