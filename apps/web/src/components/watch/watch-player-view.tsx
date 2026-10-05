"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Award,
  Bookmark,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  DocumentText,
  Eye,
  FileCheck,
  Play,
  Pulse,
  Send,
  Share,
  VerifiedBadge,
} from "@/components/icons";
import { PageLoading } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WatchCard } from "@/components/watch/watch-card";
import {
  useWatchComments,
  useWatchMutations,
  useWatchPlaylist,
  useWatchVideo,
} from "@/hooks/use-watch";
import { EMPTY_WATCH_VIDEOS } from "@/lib/consts/empty";
import { cn } from "@/lib/utils";

export function WatchPlayerView() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const videoId = params?.id ? decodeURIComponent(params.id) : "";
  const listParam = searchParams?.get("list") || undefined;

  const playerRef = useRef<HTMLIFrameElement | null>(null);

  // 1. Live Synced Video State & Comments via useWatch hooks
  const { data: videoData, isLoading: isVideoLoading } = useWatchVideo(videoId);
  const { data: commentsData } = useWatchComments(videoId);
  const { data: playlistData } = useWatchPlaylist(listParam || "");
  const { syncProgress, toggleInteraction, postComment, toggleCommentLike, recordView } =
    useWatchMutations(videoId);

  const video = videoData?.video;
  const userProgress = videoData?.userProgress;
  const userInteraction = videoData?.userInteraction;
  const playlist = playlistData?.playlist;
  const playlistVideos = playlistData?.videos ?? EMPTY_WATCH_VIDEOS;
  const relatedVideos = EMPTY_WATCH_VIDEOS;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [resumed, setResumed] = useState(false);

  // Sync state from server data
  useEffect(() => {
    if (userInteraction) {
      setIsLiked(userInteraction.isLiked);
      setIsSaved(userInteraction.isSaved);
    }
  }, [userInteraction]);

  // Register view on mount
  useEffect(() => {
    recordView();
  }, [recordView]);

  // Progress heartbeat
  useEffect(() => {
    if (!video) return;
    let currentSeconds = userProgress?.lastPositionSeconds ?? 0;
    const interval = setInterval(() => {
      if (isPlaying) {
        currentSeconds += 5;
        syncProgress.mutate({
          lastPositionSeconds: currentSeconds,
          durationSeconds: video.durationSeconds || 600,
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, video, syncProgress, userProgress]);

  // Resume toast
  useEffect(() => {
    if (userProgress && userProgress.lastPositionSeconds > 10 && !resumed) {
      setResumed(true);
      const mins = Math.floor(userProgress.lastPositionSeconds / 60);
      const secs = userProgress.lastPositionSeconds % 60;
      toast.info(`পূর্বের দেখা স্থান থেকে শুরু করা হচ্ছে (${mins}:${secs.toString().padStart(2, "0")})`);
    }
  }, [userProgress, resumed]);

  if (isVideoLoading) {
    return <PageLoading />;
  }

  if (!video) {
    return (
      <div className="py-24 text-center text-muted-foreground flex flex-col items-center gap-2">
        <Play className="size-10 opacity-30 stroke-[1.5]" />
        <p className="font-medium text-sm">ভিডিও পাওয়া যায়নি</p>
      </div>
    );
  }

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("ভিডিওর লিঙ্ক কপি করা হয়েছে!");
      } catch {
        toast.error("লিঙ্ক কপি করা যায়নি");
      }
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    postComment.mutate(
      { content: newComment.trim() },
      {
        onSuccess: () => {
          setNewComment("");
          toast.success("মন্তব্য প্রকাশ করা হয়েছে");
        },
      },
    );
  };

  const startSeconds = userProgress?.lastPositionSeconds ?? 0;
  const commentsList = commentsData?.comments ?? [];

  return (
    <div className="max-w-[1700px] mx-auto w-full pb-20 px-2 sm:px-4 lg:px-6">
      {/* Back button */}
      <div className="py-3">
        <Link
          href={playlist ? `/watch/playlist/${playlist.slug || playlist.id}` : "/watch"}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>{playlist ? `প্লেলিস্ট: ${playlist.title}` : "সব ভিডিওতে ফিরে যান"}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Player, Video Info, Channel, Description, Comments */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* YouTube Video Embed Container */}
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-black border border-border/60 shadow-lg">
            <iframe
              ref={playerRef}
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&start=${startSeconds}&rel=0&modestbranding=1&enablejsapi=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
              onLoad={() => setIsPlaying(true)}
            />
          </div>

          {/* Title & Stats */}
          <div className="flex flex-col gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
              {video.title}
            </h1>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-border/60 pb-4">
              {/* Channel Info */}
              {video.channel && (
                <div className="flex items-center justify-between sm:justify-start gap-3">
                  <Link
                    href={`/watch/channel/${(video.channel.handle || "").replace("@", "")}`}
                    className="relative size-11 shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted hover:opacity-90 transition-opacity"
                  >
                    {video.channel.avatar ? (
                      <Image
                        src={video.channel.avatar}
                        alt={video.channel.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center bg-primary/20 text-primary text-xs font-bold">
                        {(video.channel.name || "C").charAt(0)}
                      </div>
                    )}
                  </Link>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/watch/channel/${(video.channel.handle || "").replace("@", "")}`}
                        className="font-bold text-sm text-foreground hover:underline transition-all"
                      >
                        {video.channel.name}
                      </Link>
                      {video.channel.verified && <VerifiedBadge className="size-4 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{video.channel.subscribers}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={isSubscribed ? "secondary" : "default"}
                    onClick={() => {
                      setIsSubscribed(!isSubscribed);
                      toast.success(isSubscribed ? "সাবস্ক্রিপশন বাতিল করা হয়েছে" : "সাবস্ক্রাইব করা হয়েছে!");
                    }}
                    className="ml-2 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    {isSubscribed ? "সাবস্ক্রাইবড" : "সাবস্ক্রাইব"}
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const next = !isLiked;
                    setIsLiked(next);
                    toggleInteraction.mutate({ isLiked: next });
                  }}
                  className={cn(
                    "rounded-xl gap-1.5 text-xs font-medium cursor-pointer border-border/80",
                    isLiked && "bg-rose-500/10 text-rose-600 border-rose-500/30",
                  )}
                >
                  <Pulse className={cn("size-3.5", isLiked && "text-rose-600")} />
                  <span>{isLiked ? "পছন্দ হয়েছে" : video.likes}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const next = !isSaved;
                    setIsSaved(next);
                    toggleInteraction.mutate({ isSaved: next });
                    toast.success(next ? "ভিডিওটি সেভ করা হয়েছে" : "সংরক্ষণ থেকে সরানো হয়েছে");
                  }}
                  className={cn(
                    "rounded-xl gap-1.5 text-xs font-medium cursor-pointer border-border/80",
                    isSaved && "bg-primary/10 text-primary border-primary/30",
                  )}
                >
                  <Bookmark className="size-3.5" />
                  <span>{isSaved ? "সেভড" : "সেভ"}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="rounded-xl gap-1.5 text-xs font-medium cursor-pointer border-border/80"
                >
                  <Share className="size-3.5" />
                  <span>শেয়ার</span>
                </Button>

                <Link
                  href="/exam/custom"
                  className="inline-flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-medium border border-border/80 text-primary hover:bg-primary/5 transition-colors"
                >
                  <FileCheck className="size-3.5" />
                  <span>কুইজ নিন</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="rounded-2xl bg-muted/40 p-4 border border-border/60 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-xs font-medium text-foreground/80">
              <span className="flex items-center gap-1">
                <Eye className="size-3.5 text-muted-foreground" />
                {video.views}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5 text-muted-foreground" />
                {video.publishedAt}
              </span>
            </div>

            <p
              className={cn(
                "text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed",
                !showFullDesc && "line-clamp-3",
              )}
            >
              {video.description}
            </p>

            <button
              type="button"
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer self-start"
            >
              <span>{showFullDesc ? "কম দেখান" : "সম্পূর্ণ পড়ুন"}</span>
              {showFullDesc ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>
          </div>

          {/* Realtime Synced Comments Section */}
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <DocumentText className="size-4 text-primary" />
                মন্তব্য ({commentsList.length})
              </h3>
            </div>

            {/* Add Comment Box */}
            <form onSubmit={handleAddComment} className="flex flex-col gap-2.5">
              <Textarea
                placeholder="ভিডিওটি সম্পর্কে আপনার মতামত লিখুন..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] rounded-2xl bg-card border-border/80 text-xs sm:text-sm resize-none focus-visible:ring-primary"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newComment.trim() || postComment.isPending}
                  className="rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Send className="size-3.5 mr-1" />
                  {postComment.isPending ? "পোস্ট হচ্ছে..." : "মন্তব্য প্রকাশ করুন"}
                </Button>
              </div>
            </form>

            {/* Comments List */}
            <div className="flex flex-col gap-3 mt-2">
              {commentsList.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 p-3 rounded-2xl bg-card border border-border/50"
                >
                  <div className="relative size-8 shrink-0 overflow-hidden rounded-full border border-border/40 bg-muted">
                    {comment.author.avatar ? (
                      <Image
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center bg-primary/20 text-primary text-xs font-bold">
                        {comment.author.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground truncate">
                          {comment.author.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {comment.createdAt}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCommentLike.mutate(comment.id)}
                        className={cn(
                          "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md hover:bg-muted cursor-pointer transition-colors",
                          comment.isLikedByUser
                            ? "text-rose-500 font-semibold"
                            : "text-muted-foreground",
                        )}
                      >
                        <Pulse className="size-3" />
                        <span>{comment.likesCount}</span>
                      </button>
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Playlist Queue or Related Videos */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {playlist && playlistVideos.length > 0 ? (
            <div className="flex flex-col gap-3 rounded-2xl bg-card border border-border/70 p-4 shadow-xs">
              <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                <div className="relative size-12 shrink-0 rounded-xl overflow-hidden bg-muted border border-border/40">
                  <Image
                    src={playlist.customCover}
                    alt={playlist.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[10px] font-semibold text-primary flex items-center gap-1">
                    <BookOpen className="size-3" />
                    প্লেলিস্ট কিউ
                  </span>
                  <Link
                    href={`/watch/playlist/${playlist.slug || playlist.id}`}
                    className="font-bold text-xs text-foreground truncate hover:text-primary transition-colors"
                  >
                    {playlist.title}
                  </Link>
                  <span className="text-[11px] text-muted-foreground">
                    {playlistVideos.findIndex((v) => v.id === video.id) + 1} /{" "}
                    {playlistVideos.length} টি ভিডিও
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
                {playlistVideos.map((pVid, idx) => {
                  const isCurrent = pVid.id === video.id;
                  return (
                    <Link
                      key={pVid.id}
                      href={`/watch/${pVid.id}?list=${playlist.id}`}
                      className={cn(
                        "flex items-center gap-2.5 p-2 rounded-xl transition-colors",
                        isCurrent
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted/50 border border-transparent",
                      )}
                    >
                      <span className="text-[11px] font-mono font-bold text-muted-foreground w-4 text-center shrink-0">
                        {isCurrent ? (
                          <Play className="size-3 text-primary fill-current mx-auto" />
                        ) : (
                          idx + 1
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-xs font-medium line-clamp-1",
                            isCurrent ? "text-primary font-bold" : "text-foreground",
                          )}
                        >
                          {pVid.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {pVid.channel.name} • {pVid.duration}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Award className="size-4 text-primary" />
                  সম্পর্কিত ভিডিও
                </h3>
                <span className="text-xs text-muted-foreground">
                  {relatedVideos.length} টি ভিডিও
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {relatedVideos.map((item) => (
                  <WatchCard key={item.id} video={item} layout="list" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
