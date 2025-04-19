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
import { useState } from "react";
import { CircleUserRound } from "lucide-react";

export function ProfileDropDownMenu({ isCollapsed }: { isCollapsed: boolean }) {
	const [showLogoutDialog, setShowLogoutDialog] = useState(false);

	const handleLogout = () => {
		console.log("User logged out.");
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
									<p className=" font-semibold">Riadh</p>
									<span className="text-sm opacity-65 truncate max-w-fit overflow-hidden text-ellipsis whitespace-nowrap cursor-default">
										coolEmail@gmail.com
									</span>
								</div>
							</>
						)}
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-full min-w-[15rem]">
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem>
							<User />
							<span>Profile</span>
						</DropdownMenuItem>
						<DropdownMenuItem>
							<Settings />
							<span>Settings</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem>
							<Users />
							<span>Team</span>
						</DropdownMenuItem>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								<span>Add user</span>
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent>
									<DropdownMenuItem>
										<Mail />
										<span>Email</span>
									</DropdownMenuItem>
									<DropdownMenuItem>
										<MessageSquare />
										<span>Message</span>
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
						<span>Log out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Logout Dialog */}
			{showLogoutDialog && (
				<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
					<div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 max-w-sm w-full space-y-4 text-center">
						<h2 className="text-lg font-semibold">Confirm Log Out</h2>
						<p className="text-sm text-zinc-600 dark:text-zinc-400">
							Are you sure you want to log out? You will need to log in again to
							access your account.
						</p>
						<div className="flex justify-center gap-4 pt-4">
							<Button
								variant="outline"
								onClick={() => setShowLogoutDialog(false)}
							>
								Cancel
							</Button>
							<Button variant="destructive" onClick={handleLogout}>
								Log out
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
