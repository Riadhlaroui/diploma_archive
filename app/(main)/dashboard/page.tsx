"use client";

import { Search } from "lucide-react";
import Form from "next/form";
import React, { useEffect } from "react";
import pb from "@/lib/pocketbase";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const Dashboard = () => {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            if (!pb.authStore.isValid) {
                console.log("User not authenticated, redirecting...");
                router.push("/sign-in");
            }
        };

        checkAuth(); // ✅ runs safely in the client after component mounts
    }, []);

    return (
        <div className="w-full flex flex-col items-center justify-center gap-2 transition-colors duration-300">
            <div className="top-0 right-0 absolute p-4">
                <ThemeToggle />
            </div>
            this the dashboard page
            <Form action={""} className="flex items-center justify-center w-full">
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
            </Form>
            <div className="w-full h-full border"></div>
        </div>
    );
};

export default Dashboard;