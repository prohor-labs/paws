"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  Bookmark,
  ChevronRight,
  Clock,
  InfoCircle,
  Lock,
  Logout,
  Sliders,
  User,
} from "@/components/icons";
import { useConfirm } from "@/components/shared";
import { signOut, useSession } from "@/lib/sdk";
import { cn } from "@/lib/utils";

const EditProfileDialog = dynamic(
  () => import("@/components/profile/edit-profile-dialog").then((m) => m.EditProfileDialog),
  { ssr: false },
);

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  onClick?: () => void;
  iconBg: string;
  tag?: string;
  isDestructive?: boolean;
}

function MenuItem({
  icon: Icon,
  label,
  href,
  onClick,
  iconBg,
  tag,
  isDestructive = false,
}: MenuItemProps) {
  const content = (
    <div className="p-3.5 sm:p-4 flex items-center justify-between transition-colors hover:bg-muted/40 active:bg-muted/60 outline-none cursor-pointer">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "size-9 sm:size-10 rounded-xl flex items-center justify-center text-white shadow-2xs shrink-0",
            iconBg,
          )}
        >
          <Icon className="size-4.5 sm:size-5" />
        </div>
        <span
          className={cn(
            "font-semibold text-xs sm:text-sm",
            isDestructive ? "text-destructive" : "text-foreground",
          )}
        >
          {label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {tag && (
          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-lg">
            {tag}
          </span>
        )}
        <ChevronRight className="size-4 text-muted-foreground/60" />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block border-b border-border/50 last:border-0">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left border-b border-border/50 last:border-0 bg-transparent p-0"
    >
      {content}
    </button>
  );
}

function MenuSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card shadow-xs rounded-2xl w-full overflow-hidden border border-border/80 mb-4">
      {children}
    </div>
  );
}

export function AppPreferences() {
  const router = useRouter();
  const { data: session } = useSession();
  const confirm = useConfirm();
  const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false);

  const handleLogout = async () => {
    const ok = await confirm({
      title: "লগ আউট নিশ্চিতকরণ",
      description: "আপনি কি নিশ্চিত যে আপনি আপনার অ্যাকাউন্ট থেকে লগ আউট করতে চান?",
      confirmText: "হ্যাঁ, লগ আউট করুন",
      cancelText: "বাতিল",
      variant: "destructive",
    });

    if (ok) {
      await signOut();
      router.replace("/login");
    }
  };

  return (
    <div className="w-full flex flex-col">
      <MenuSection>
        <MenuItem
          icon={User}
          label="ব্যক্তিগত তথ্য পরিবর্তন"
          onClick={() => setIsEditProfileOpen(true)}
          iconBg="bg-rose-500"
        />
        <MenuItem
          icon={Sliders}
          label="কাস্টম পরীক্ষা সেটিংস"
          href="/exam/custom"
          iconBg="bg-violet-500"
        />
      </MenuSection>

      <MenuSection>
        <MenuItem
          icon={Clock}
          label="কাস্টম পরীক্ষা ও ইতিহাস"
          href="/exam/custom"
          iconBg="bg-indigo-500"
        />
        <MenuItem icon={Bookmark} label="সংরক্ষিত প্রশ্ন ও বুকমার্ক" href="/qb" iconBg="bg-emerald-500" />
      </MenuSection>

      <MenuSection>
        <MenuItem
          icon={InfoCircle}
          label="Paws Academy সম্পর্কে"
          href="/qb"
          iconBg="bg-fuchsia-500"
        />
        <MenuItem icon={Lock} label="গোপনীয়তা নীতি ও শর্তাবলী" href="/qb" iconBg="bg-cyan-600" />
      </MenuSection>

      <MenuSection>
        <MenuItem
          icon={Logout}
          label="লগ আউট"
          onClick={handleLogout}
          iconBg="bg-slate-800 dark:bg-slate-700"
          isDestructive
        />
      </MenuSection>

      <EditProfileDialog
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        currentName={session?.user?.name || ""}
      />
    </div>
  );
}
