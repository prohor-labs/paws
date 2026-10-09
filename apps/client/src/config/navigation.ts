import {
  Briefcase,
  CheckCircle,
  DocumentText,
  FileCheck,
  Home,
  Play,
  ShieldCheck,
  Tag,
  User,
  Users,
} from "@/components/icons";
import type { NavItem } from "@/types";

export type { NavItem };

export const USER_NAV_ITEMS: readonly NavItem[] = [
  {
    name: "ড্যাশবোর্ড",
    path: "/dashboard",
    icon: Home,
  },
  {
    name: "কাস্টম পরীক্ষা",
    path: "/exam/custom",
    icon: FileCheck,
  },
  {
    name: "প্রশ্নব্যাংক",
    path: "/qb",
    icon: DocumentText,
  },
  {
    name: "ভিডিও ক্লাস",
    path: "/watch",
    icon: Play,
  },
  {
    name: "প্রোফাইল",
    path: "/profile",
    icon: User,
  },
] as const;

export const MENTOR_NAV_ITEMS: readonly NavItem[] = [
  {
    name: "ড্যাশবোর্ড",
    path: "/admin",
    icon: ShieldCheck,
  },
  {
    name: "অর্ডারসমূহ",
    path: "/admin/orders",
    icon: Briefcase,
  },
  {
    name: "প্রশ্নব্যাংক",
    path: "/qb",
    icon: DocumentText,
  },
  {
    name: "খাতা মূল্যায়ন",
    path: "/evaluations",
    icon: CheckCircle,
  },
  {
    name: "কুপন",
    path: "/admin/coupons",
    icon: Tag,
  },
  {
    name: "এনরোলমেন্ট",
    path: "/admin/enrollments",
    icon: Users,
  },
] as const;

export const ADMIN_NAV_ITEMS: readonly NavItem[] = [
  {
    name: "ড্যাশবোর্ড",
    path: "/admin",
    icon: ShieldCheck,
  },
  {
    name: "অর্ডারসমূহ",
    path: "/admin/orders",
    icon: Briefcase,
  },
  {
    name: "প্রশ্নব্যাংক",
    path: "/qb",
    icon: DocumentText,
  },
  {
    name: "খাতা মূল্যায়ন",
    path: "/evaluations",
    icon: CheckCircle,
  },
  {
    name: "কুপন",
    path: "/admin/coupons",
    icon: Tag,
  },
  {
    name: "এনরোলমেন্ট",
    path: "/admin/enrollments",
    icon: Users,
  },
] as const;
