"use client";

import React, { useState } from "react";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import pb from "@/lib/pocketbase";
import { toast } from "sonner";

export default function SignUp() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); // Add this line
    try {
      toast.success("Login succeeded.");
      console.log("We good.");
    } catch (err) {
      toast.error("Login Failed.");
      console.log("We not good vro.");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen overflow-hidden">
      <div className=" fixed top-0 left-0 z-50 p-2">
        <span>Select your language</span>
      </div>
      <div className=" fixed top-0 right-0 z-50 p-2">
        <ThemeToggle />
      </div>
      <form onSubmit={handleSignUp}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-[1rem]">
          <h1 className=" text-2xl font-bold italic">Welcome back!</h1>

          <div className="flex flex-col gap-[0.7rem]">
            <div className="relative ">
              <input
                type="email"
                id="Email"
                className="peer w-full h-[4rem] bg-[#D7DDE3] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-md px-3 pt-6 pb-2 focus:outline-none"
                placeholder=""
                onChange={(e) => setEmail(e.target.value)}
              />
              <label
                htmlFor="email"
                className="absolute top-2 left-3 text-[#697079] text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white"
              >
                Email
                <span className="text-[#D81212]">*</span>
              </label>
            </div>

            <div className="relative w-[25rem]">
              <input
                type={isPasswordVisible ? "text" : "password"}
                id="password"
                className="peer w-full bg-[#D7DDE3] h-[4rem] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-md px-3 pt-6 pb-2 focus:outline-none placeholder-transparent"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <label
                htmlFor="email"
                className="absolute top-2 left-3 text-[#697079] text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white"
              >
                password
                <span className="text-[#D81212]">*</span>
              </label>
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {isPasswordVisible ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <Button className="font-semibold h-[4rem] text-[1rem] w-full dark:bg-[#E9E9E9] cursor-pointer">
            Sign Up
          </Button>

          <span className="text-center mt-3">
            Already have an account?{" "}
            <Link href="/sign-up" className="text-blue-500 hover:underline">
              Log in
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
}
