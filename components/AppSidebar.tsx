"use client";
import "@/lib/i18n";
import { useTranslation } from "react-i18next";

import { Home, Inbox, Search, Settings, UsersRound } from "lucide-react";

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

export function AppSidebar() {
	const { t } = useTranslation();
	const { state } = useSidebar(); // 'collapsed' or 'expanded'
	const isCollapsed = state === "collapsed";

	// Menu items (translated)
	const items = [
		{
			title: t("sidebar.home"),
			url: "dashboard",
			icon: Home,
		},
		{
			title: t("sidebar.inbox"),
			url: "inbox",
			icon: Inbox,
		},
		{
			title: t("sidebar.search"),
			url: "#",
			icon: Search,
		},
		{
			title: t("sidebar.settings"),
			url: "settings",
			icon: Settings,
		},
	];

	const studentContent = [
		{
			title: t("sidebar.students"),
			url: "#",
			icon: UsersRound,
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
					<SidebarGroupLabel>
						{t("sidebar.manageStudents") || "Manage Students"}
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{studentContent.map((item) => (
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
			</SidebarContent>

			<SidebarFooter>
				{!isCollapsed && <ConnectionStatus />}
				<SidebarMenu>
					<SidebarMenuItem>
						<ProfileDropDownMenu isCollapsed={isCollapsed} />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
