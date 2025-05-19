// In lib/direction-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type DirectionContextType = {
	isRTL: boolean;
};

const DirectionContext = createContext<DirectionContextType>({ isRTL: false });

export const DirectionProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { i18n } = useTranslation();
	const [isRTL, setIsRTL] = useState(i18n.language === "ar");

	useEffect(() => {
		const handleLanguageChange = () => {
			setIsRTL(i18n.language === "ar");
		};

		i18n.on("languageChanged", handleLanguageChange);
		return () => {
			i18n.off("languageChanged", handleLanguageChange);
		};
	}, [i18n]);

	return (
		<DirectionContext.Provider value={{ isRTL }}>
			{children}
		</DirectionContext.Provider>
	);
};

export const useDirection = () => useContext(DirectionContext);
