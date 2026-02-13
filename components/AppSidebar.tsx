"use client";
import "@/lib/i18n/i18n";
import { useTranslation } from "react-i18next";
import { Home, Inbox, Settings, University, UsersRound } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { ProfileDropDownMenu } from "./ProfileDropDownMenu";
import { ConnectionStatus } from "./ConnectionStatus";
import { useState, useEffect } from "react";
import StudentFormDialog from "./StudentFormDialog";
import pb from "@/lib/pocketbase";

export function AppSidebar() {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.language === "ar";
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";
	const [openAddStudentDialog, setOpenAddStudentDialog] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		// Check if user is authenticated and has admin role
		const checkAdminStatus = () => {
			if (pb.authStore.isValid) {
				const user = pb.authStore.model;
				setIsAdmin(user?.role === "admin");
			}
		};

		checkAdminStatus();

		// Listen to auth changes
		pb.authStore.onChange(() => {
			checkAdminStatus();
		});

		return () => {
			pb.authStore.onChange(() => {});
		};
	}, []);

	// Base menu items
	const baseItems = [
		{
			title: t("sidebar.home"),
			url: "/dashboard",
			icon: Home,
		},

		{
			title: t("sidebar.settings"),
			url: "/settings",
			icon: Settings,
		},
	];

	// Add inbox only for admin
	const items = isAdmin
		? [
				...baseItems,
				{
					title: t("sidebar.inbox"),
					url: "/inbox",
					icon: Inbox,
				},
			]
		: baseItems;

	const studentContent = [
		{
			title: t("sidebar.students"),
			url: "/students",
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

	return (
		<Sidebar collapsible="icon" side={isRtl ? "right" : "left"}>
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
								<SidebarMenuItem
									key={item.title}
									className="flex justify-between items-center"
								>
									<SidebarMenuButton asChild>
										<a href={item.url} className="flex items-center gap-2">
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
