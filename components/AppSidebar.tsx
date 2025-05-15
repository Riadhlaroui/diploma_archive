"use client";
import "@/lib/i18n";
import { useTranslation } from "react-i18next";

import {
	Home,
	Inbox,
	MoreHorizontal,
	Search,
	Settings,
	University,
	UsersRound,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

import { ProfileDropDownMenu } from "./ProfileDropDownMenu";
import { ConnectionStatus } from "./ConnectionStatus";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";

import StudentFormDialog from "./StudentFormDialog";

export function AppSidebar() {
	const { t } = useTranslation();
	const { state } = useSidebar(); // 'collapsed' or 'expanded'
	const isCollapsed = state === "collapsed";

	const [openAddStudentDialog, setOpenAddStudentDialog] = useState(false);

	// Menu items (translated)
	const items = [
		{
			title: t("sidebar.home"),
			url: "/dashboard",
			icon: Home,
		},
		{
			title: t("sidebar.inbox"),
			url: "/inbox",
			icon: Inbox,
		},
		{
			title: t("sidebar.search"),
			url: "#",
			icon: Search,
		},
		{
			title: t("sidebar.settings"),
			url: "/settings",
			icon: Settings,
		},
	];

	const FacultiesContent = [
		{
			title: "Faculties",
			url: "/faculties",
			icon: University,
		},
	];

	return (
		<Sidebar collapsible="icon">
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>
						{t("sidebar.application") || "Application"}
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Manage Faculties</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{FacultiesContent.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>
						{t("sidebar.manageStudents") || "Manage Students"}
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem className="flex justify-between items-center">
								<SidebarMenuButton asChild className="flex-1">
									<a href="/students" className="flex items-center gap-2">
										<UsersRound />
										<span>{t("sidebar.students")}</span>
									</a>
								</SidebarMenuButton>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<SidebarMenuAction>
											<MoreHorizontal />
										</SidebarMenuAction>
									</DropdownMenuTrigger>
									<DropdownMenuContent side="right" align="start">
										<DropdownMenuItem
											className=" hover:cursor-pointer"
											onClick={() => setOpenAddStudentDialog(true)}
										>
											<span>Add Student</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				{!isCollapsed && <ConnectionStatus />}
				<SidebarMenu>
					<SidebarMenuItem>
						<ProfileDropDownMenu isCollapsed={isCollapsed} />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<StudentFormDialog
				isOpen={openAddStudentDialog}
				onClose={() => setOpenAddStudentDialog(false)}
			/>
		</Sidebar>
	);
}
