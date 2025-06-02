"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { CircleNotch } from "@phosphor-icons/react";

export function Navbar() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 text-xl font-semibold">
          <CircleNotch size={28} weight="bold" className="text-indigo-600" />
          <span className="text-slate-900 dark:text-slate-50">SocialSync</span>
        </Link>

        {/* Right side */}
        <div className="hidden md:flex items-center space-x-4">
          {!loading && !session && (
            <button
              onClick={() => signIn("google")}
              className="h-9 px-4 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
            >
              Login / Sign Up
            </button>
          )}
          {!loading && session && (
            <button
              onClick={() => signOut()}
              className="h-9 px-4 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Mobile Auth button */}
        <div className="md:hidden">
          {!loading && !session && (
            <button
              onClick={() => signIn("google")}
              className="h-8 px-3 rounded-md bg-indigo-600 text-white text-xs"
            >
              Login
            </button>
          )}
          {!loading && session && (
            <button
              onClick={() => signOut()}
              className="h-8 px-3 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
} 