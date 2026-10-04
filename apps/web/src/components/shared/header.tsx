"use client";

import Image from "next/image";
import Link from "next/link";
import { User as UserIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/sdk";

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header
      className="flex md:hidden sticky top-0 z-40 w-full items-center justify-between border-b border-border bg-card/95 px-3 backdrop-blur-md transition-colors duration-200 sm:px-5"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        height: "calc(3.5rem + env(safe-area-inset-top, 0px))",
      }}
    >
      <Link
        href="/"
        className="flex cursor-pointer items-center gap-2 select-none"
        aria-label="Home"
      >
        <Image
          src="/icons/paws-logo.png"
          alt="Paws Academy"
          width={28}
          height={28}
          className="size-7 object-contain invert dark:invert-0"
        />
        <span className="font-bold text-base tracking-tight text-foreground">Paws Academy</span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
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
