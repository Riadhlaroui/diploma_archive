// components/ConnectionStatus.tsx
"use client";

import { useTranslation } from "react-i18next";

import { CheckCircle, XCircle } from "lucide-react"; 
import { usePocketBaseStatus } from "@/hooks/usePocketBaseStatus";

export function ConnectionStatus() {
  const isOnline = usePocketBaseStatus('http://192.168.1.10:8090');

    const { t } = useTranslation();

  return (
    <div
      className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md
        ${isOnline ? 'bg-green-100 dark:bg-green-500 dark:text-green-100 text-green-700' : 'bg-red-100 text-red-700'}
      `}
    >
      {isOnline ? (
        <>
          <CheckCircle className="dark:text-green-100 text-green-600 w-5 h-5" />
          <span>{t("sidebar.connected")}</span>
        </>
      ) : (
        <>
          <XCircle className="text-red-600 w-5 h-5" />
          <span>{t("sidebar.disconnected")}</span>
        </>
      )}
    </div>
  );
}
