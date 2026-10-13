"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, Activity, Sparkles, BookOpen } from "lucide-react";
import { DottedMap } from "@/components/ui/dotted-map";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { healthQueryOptions } from "@/lib/api/queries";

const BANGLADESH_GLOBAL_MARKERS = [
  { lat: 23.8103, lng: 90.4125, size: 0.9, pulse: true }, // Dhaka
  { lat: 22.3569, lng: 91.7832, size: 0.6, pulse: true }, // Chittagong
  { lat: 24.3745, lng: 88.6042, size: 0.6, pulse: true }, // Rajshahi
  { lat: 24.8949, lng: 91.8687, size: 0.6, pulse: true }, // Sylhet
  { lat: 22.8456, lng: 89.5403, size: 0.5, pulse: true }, // Khulna
  { lat: 24.7471, lng: 90.4203, size: 0.5, pulse: true }, // Mymensingh
  { lat: 25.7439, lng: 89.2752, size: 0.5, pulse: true }, // Rangpur
  { lat: 22.701, lng: 90.3535, size: 0.5, pulse: true },  // Barisal
  { lat: 28.6139, lng: 77.209, size: 0.4 },              // New Delhi
  { lat: 51.5074, lng: -0.1278, size: 0.4 },             // London
  { lat: 40.7128, lng: -74.006, size: 0.4 },             // New York
  { lat: 1.3521, lng: 103.8198, size: 0.4 },             // Singapore
  { lat: 25.2048, lng: 55.2708, size: 0.4 },             // Dubai
];

export function OnlinePresenceCard() {
  const { data: health } = useQuery({
    ...healthQueryOptions(),
    refetchInterval: 15_000,
  });

  const onlineUsers = health?.onlineUsers ?? 1;
  const totalStudents = health?.totalUsers ?? 1;
  const totalQuestions = health?.totalQuestions ?? 606691;

  return (
    <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl">
      <div className="absolute -right-16 -top-16 size-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 size-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold tracking-tight">লাইভ স্টুডেন্ট নেটওয়ার্ক</CardTitle>
            <Badge variant="outline" className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              লাইভ
            </Badge>
          </div>
          <CardDescription>
            দেশজুড়ে শিক্ষার্থীরা এখন paws.academy-তে অনুশীলন করছে
          </CardDescription>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/60 px-4 py-2 backdrop-blur-md shadow-xs">
            <Users className="size-4 text-emerald-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium">বর্তমানে অনলাইনে</span>
              <span className="text-lg font-bold text-foreground leading-none">
                {onlineUsers.toLocaleString()} জন
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        <div className="relative flex h-64 sm:h-72 w-full items-center justify-center overflow-hidden rounded-2xl border border-border/50 bg-muted/20 p-2">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary),0.05),transparent_70%)] pointer-events-none" />
          <DottedMap
            className="size-full text-foreground/20 dark:text-foreground/20"
            dotColor="currentColor"
            markerColor="#10b981"
            dotRadius={0.16}
            mapSamples={3800}
            pulse
            markers={BANGLADESH_GLOBAL_MARKERS}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/40 p-3 backdrop-blur-xs">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">সিস্টেম স্ট্যাটাস</p>
              <p className="text-sm font-semibold text-foreground">১০০% অপটিমাইজড</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/40 p-3 backdrop-blur-xs">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Users className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">নিবন্ধিত শিক্ষার্থী</p>
              <p className="text-sm font-semibold text-foreground">{totalStudents.toLocaleString()} জন</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/40 p-3 backdrop-blur-xs">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <BookOpen className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">প্রশ্নব্যাংক সংগ্রহ</p>
              <p className="text-sm font-semibold text-foreground">{totalQuestions.toLocaleString()} টি</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
