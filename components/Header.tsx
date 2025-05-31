"use client";
import Link from "next/link";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export default function Header() {
  // Placeholder: Replace with real user/role logic
  const [role] = useState<"admin" | "candidate" | null>(null);
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-white via-blue-50 to-purple-100 border-b border-border shadow-sm">
      {/* Left: Logo */}
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl bg-gradient-to-r from-blue-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm tracking-tight select-none">
          hirelah ai
        </span>
      </Link>
      {/* Center: Navigation (conditional) */}
      <nav className="hidden md:flex gap-6">
        {role === "admin" && (
          <>
            <Link href="/recruiter/dashboard" className="hover:text-accent">Dashboard</Link>
            <Link href="/recruiter/jobs" className="hover:text-accent">My Jobs</Link>
            <Link href="/recruiter/talent-pool" className="hover:text-accent">Talent Pool</Link>
            <Link href="/recruiter/interviews" className="hover:text-accent">Interviews</Link>
          </>
        )}
        {role === "candidate" && (
          <Link href="/candidate/profile" className="hover:text-accent">My Profile</Link>
        )}
      </nav>
      {/* Right: User Avatar (dropdown placeholder) */}
      <div className="flex items-center gap-2">
      <SignedOut>
  <div className="flex gap-4">
    <SignInButton>
      <button className="px-4 py-2 rounded-xl border border-accent text-accent hover:bg-accent hover:text-white transition">
        Sign In
      </button>
    </SignInButton>
    <SignUpButton>
      <button className="px-4 py-2 rounded-xl bg-accent text-white hover:opacity-90 transition">
        Sign Up
      </button>
    </SignUpButton>
  </div>
</SignedOut>

<SignedIn>
  <UserButton/>
</SignedIn>
      </div>
    </header>
  );
} 