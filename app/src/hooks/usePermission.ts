import { useMemo, useState, useEffect } from "react";
import pb from "@/lib/pocketbase";
import { Permission, ROLE_PRESETS } from "../config/permissions";

export function usePermission() {
	const [model, setModel] = useState(pb.authStore.model);

	useEffect(() => {
		pb.collection("Archive_users")
			.authRefresh()
			.then((res) => {
				setModel(res.record);
			})
			.catch(() => {
				pb.authStore.clear();
				setModel(null);
			});
	}, []);

	const permissions: Permission[] = useMemo(() => {
		if (!model) return [];
		if (model.role === "admin")
			return Object.keys(ROLE_PRESETS.admin) as Permission[];
		return model.permissions ?? ROLE_PRESETS[model.role] ?? [];
	}, [model]);

	const can = (permission: Permission): boolean => {
		if (!model) return false;
		if (model.role === "admin") return true;
		return permissions.includes(permission); // reuse memo
	};

	const isExpired = (): boolean => {
		if (!model?.expiresAt) return false;
		return new Date(model.expiresAt) < new Date();
	};

	const isActive = (): boolean => {
		if (!model) return false;
		return model.isActive !== false && !isExpired();
	};

	return { can, isExpired, isActive, permissions, role: model?.role };
}
