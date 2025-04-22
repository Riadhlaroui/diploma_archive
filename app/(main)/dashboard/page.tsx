"use client";

import { Search } from "lucide-react";
import Form from "next/form";
import React, { useEffect } from "react";
import pb from "@/lib/pocketbase";
import { redirect, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = React.useState(true);

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.replace("/sign-in");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) return <Skeleton className="w-full h-full" />;

  return (
    <div className="w-full flex flex-col items-center justify-center gap-2 transition-colors duration-300">
      <div className="top-0 right-0 absolute p-4">
        <ThemeToggle />
      </div>
      this the dashboard page
      <form action={""} className="flex items-center justify-center w-full">
        <input
          name="query"
          className=" border p-3 w-[40%] h-[2.5rem] focus:outline-none"
        />
        <button
          type="submit"
          className=" border-b border-t border-r p-2 h-[2.5rem] rounded-r-lg"
        >
          {" "}
          <Search />
        </button>
      </form>
      <div className="w-full h-full border"></div>
    </div>
  );
};

export default Dashboard;
