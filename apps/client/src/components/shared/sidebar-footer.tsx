"use client";

import Link from "next/link";
import { User as UserIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSession } from "@/lib/auth";

export function SidebarFooter() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="w-8 h-px bg-border/60" />

      <Tooltip>
        <TooltipTrigger render={<div />}>
          <ThemeToggle />
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          থিম পরিবর্তন
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href="/profile"
              className="flex items-center justify-center size-10 rounded-lg hover:bg-muted transition-colors overflow-hidden outline-none"
            />
          }
        >
          <Avatar className="size-8 shrink-0 border border-border">
            <AvatarImage src={user?.image || undefined} alt={user?.name || "ব্যবহারকারী"} />
            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
              {user?.name?.[0] || <UserIcon size={14} />}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          প্রোফাইল
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
