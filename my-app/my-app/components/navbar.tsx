"use client";

import type React from "react";

import {
  Bell,
  MessageSquare,
  Search,
  Home,
  Users,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export function Navbar() {
  const [userAuth, setUserAuth] = useState(0);

  return (
    <nav className="sticky top-0 hidden md:block z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              C
            </div>
            <span className="hidden sm:inline">CompanyHub</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink
              href="/feed"
              icon={<Home className="h-4 w-4" />}
              label="Feed"
            />
            <NavLink
              href="/people"
              icon={<Users className="h-4 w-4" />}
              label="People"
            />
            <NavLink
              href="/messages"
              icon={<MessageSquare className="h-4 w-4" />}
              label="Messages"
            />
            <NavLink
              href="/discover"
              icon={<Compass className="h-4 w-4" />}
              label="Discover"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          {/* User Menu */}
          {userAuth === 1 && (
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium leading-none">Alex Johnson</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Product Team
                </p>
              </div>
              <Image
                width={36}
                height={36}
                src="/professional-avatar.png"
                alt="User avatar"
                className="h-9 w-9 rounded-full"
              />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
