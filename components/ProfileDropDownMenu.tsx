"use client";
import {
	Cloud,
	Github,
	LifeBuoy,
	LogOut,
	Mail,
	MessageSquare,
	PlusCircle,
	Settings,
	User,
	User2,
	Users,
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
import { getUserInfo, clearAurthStore } from "../utils/getUserInfo";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

export function ProfileDropDownMenu({ isCollapsed }: { isCollapsed: boolean }) {
	const [showLogoutDialog, setShowLogoutDialog] = useState(false);
	const [isClient, setIsClient] = useState(false);

	const router = useRouter();

	const { t } = useTranslation();

	const user = getUserInfo();

	useEffect(() => {
		// Ensure we're rendering on the client
		setIsClient(true);
	}, []);

	if (!isClient) return null; // Return nothing during SSR to prevent hydration issues
	if (!user) return <p>Not logged in</p>;

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
					<div className="flex items-center gap-3 w-full p-1 rounded-sm outline-dashed outline-2 border-[0px] bg-muted transition-colors">
						{isCollapsed && <User2 className=" opacity-90 w-[24px] h-[24px]" />}
						{!isCollapsed && (
							<>
								<CircleUserRound className="ml-1.5 size-[2rem] flex-shrink-0 opacity-90" />
								<div className=" flex flex-col items-start">
									<p className=" font-semibold">{user.userName}</p>
									<span className="text-sm opacity-65 truncate max-w-fit overflow-hidden text-ellipsis whitespace-nowrap cursor-default">
										{user.email}
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
						<DropdownMenuItem>
							<User />
							<span>{t("profile.profile")}</span>
						</DropdownMenuItem>
						<DropdownMenuItem>
							<Settings />
							<span>{t("profile.settings")}</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem>
							<Users />
							<span>{t("profile.team")}</span>
						</DropdownMenuItem>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								<span>{t("profile.addUser")}</span>
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent>
									<DropdownMenuItem>
										<Mail />
										<span>{t("profile.team")}</span>
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
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						<Github />
						<span>GitHub</span>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<LifeBuoy />
						<span>Support</span>
					</DropdownMenuItem>
					<DropdownMenuItem disabled>
						<Cloud />
						<span>API</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => setShowLogoutDialog(true)}>
						<LogOut />
						<span>{t("profile.logout")}</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

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
								variant="outline"
								onClick={() => setShowLogoutDialog(false)}
							>
								{t("profile.cancel")}
							</Button>
							<Button variant="destructive" onClick={handleLogout}>
								{t("profile.logout")}
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
