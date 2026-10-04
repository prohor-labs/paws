"use client";

import Link from "next/link";
import { PawsLogo, User as UserIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/sdk";

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header
      className="relative flex md:hidden sticky top-0 z-40 w-full items-center justify-between border-b border-border bg-card/95 px-3 backdrop-blur-md transition-colors duration-200 sm:px-5"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        height: "calc(3.5rem + env(safe-area-inset-top, 0px))",
      }}
    >
      {/* Left: Theme Toggle */}
      <div className="flex items-center">
        <ThemeToggle />
      </div>

      {/* Centered Logo Icon */}
      <Link
        href="/"
        className="absolute left-1/2 -translate-x-1/2 flex cursor-pointer items-center justify-center p-1.5 transition-transform hover:scale-105 active:scale-95 select-none"
        aria-label="Home"
      >
        <PawsLogo className="size-7 text-foreground" />
      </Link>

      {/* Right: Profile Avatar */}
      <div className="flex items-center">
        <Link href="/profile" aria-label="প্রোফাইল">
          <Avatar className="size-7 cursor-pointer border border-border">
            <AvatarImage src={user?.image || undefined} alt={user?.name || "ব্যবহারকারী"} />
            <AvatarFallback className="bg-primary/10 text-[11px] font-bold text-primary">
              {user?.name?.[0] || <UserIcon size={14} />}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
