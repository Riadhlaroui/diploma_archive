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
import { useRouter } from "next/navigation";

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

	const studentContent = [
		{
			title: t("sidebar.students"),
			url: "/manageStudents/studentList",
			icon: UsersRound,
		},
	];

	const FacultiesContent = [
		{
			title: t("sidebar.faculties"),
			url: "/faculties",
			icon: University,
		},
	];

	const router = useRouter();

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
					<SidebarGroupLabel>{t("sidebar.manageFaculties")}</SidebarGroupLabel>
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
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<SidebarMenuAction>
												<MoreHorizontal className="hover:cursor-pointer" />
											</SidebarMenuAction>
										</DropdownMenuTrigger>
										<DropdownMenuContent side="right" align="start">
											<DropdownMenuItem
												className="hover:cursor-pointer"
												onClick={() => console.log("Add new faculty")}
											>
												<span>{t("faculties.addFaculty")}</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
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
							{studentContent.map((item) => (
								<SidebarMenuItem
									key={item.title}
									className="flex justify-between items-center"
								>
									<SidebarMenuButton asChild className="flex-1">
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<SidebarMenuAction>
												<MoreHorizontal className=" hover:cursor-pointer" />
											</SidebarMenuAction>
										</DropdownMenuTrigger>
										<DropdownMenuContent side="right" align="start">
											<DropdownMenuItem
												className=" hover:cursor-pointer"
												onClick={() => router.push("/manageStudents")}
											>
												<span>Add Student</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</SidebarMenuItem>
							))}
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
