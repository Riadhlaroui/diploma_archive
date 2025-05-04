"use client";
import "@/lib/i18n"; // ✅ Forces i18n to initialize
import { useTranslation } from "react-i18next";

import { Search } from "lucide-react";
import React, { useEffect } from "react";
import pb from "@/lib/pocketbase";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const [checkingAuth, setCheckingAuth] = React.useState(true);

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.replace("/sign-in");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const switchLanguage = (lang: "en" | "fr") => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as "en" | "fr" | null;
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  if (checkingAuth) return <Skeleton className="w-full h-full" />;

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 p-4 transition-colors duration-300">

      <div className="absolute top-0 right-0 p-4">
        <ThemeToggle />
      </div>

      <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>

      <form action="" className="flex items-center justify-center w-full">
        <input
          name="query"
          placeholder={t("dashboard.searchPlaceholder")}
          className="border p-3 w-[40%] h-[2.5rem] focus:outline-none"
        />
        <button
          type="submit"
          className="border-b border-t border-r p-2 h-[2.5rem] rounded-r-lg"
        >
          <Search />
        </button>
      </form>

      <div className="w-full h-full border">{/* content area */}</div>
    </div>
  );
};

export default Dashboard;
