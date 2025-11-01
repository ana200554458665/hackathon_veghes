"use client";

import type React from "react";

import { Home, Users, Compass, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function MobileFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around px-4 py-3">
        <FooterLink
          href="/feed"
          icon={<Home className="h-5 w-5" />}
          label="Feed"
        />
        <FooterLink
          href="/people"
          icon={<Users className="h-5 w-5" />}
          label="People"
        />
        <FooterLink
          href="/profile"
          icon={<User className="h-5 w-5" />}
          label="Profile"
        />
        <FooterLink
          href="/discover"
          icon={<Compass className="h-5 w-5" />}
          label="Discover"
        />
        <FooterLink
          href="/messages"
          icon={<MessageSquare className="h-5 w-5" />}
          label="Messages"
        />
      </div>
    </footer>
  );
}

function FooterLink({
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
      className="flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
