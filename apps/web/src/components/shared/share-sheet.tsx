"use client";

import * as React from "react";
import { Copy, Global, Send, Share } from "@/components/icons";
import { ActionSheet, type ActionSheetGroup } from "@/components/shared/action-sheet";
import { getSocialShareUrl, type ShareOptions, shareContent } from "@/lib/share";

export interface ShareSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  description?: string;
  url: string;
  shareTitle?: string;
  shareText?: string;
}

/**
 * Threads-styled ShareSheet built on ActionSheet.
 * Clean, grouped social & direct sharing actions.
 */
export function ShareSheet({
  open = false,
  onOpenChange = () => {},
  trigger,
  title = "শেয়ার করুন",
  description = "লিংক কপি করে অথবা সোশ্যাল মিডিয়ায় শেয়ার করুন",
  url,
  shareTitle = "Paws Academy",
  shareText,
}: ShareSheetProps) {
  const [canNativeShare, setCanNativeShare] = React.useState(false);

  React.useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanNativeShare(true);
    }
  }, []);

  const sharePayload: ShareOptions = React.useMemo(
    () => ({
      url,
      title: typeof title === "string" ? title : shareTitle,
      text: shareText || shareTitle,
    }),
    [url, title, shareTitle, shareText],
  );

  const shareGroups: ActionSheetGroup[] = React.useMemo(() => {
    const primaryGroup: ActionSheetGroup = {
      items: [
        {
          icon: Copy,
          label: "লিংক কপি করুন",
          description: "সরাসরি ক্লিপবোর্ডে কপি করুন",
          onClick: () => {
            shareContent({ ...sharePayload, text: undefined });
          },
        },
      ],
    };

    if (canNativeShare) {
      primaryGroup.items.unshift({
        icon: Share,
        label: "ডিভাইস অ্যাপসে শেয়ার করুন",
        description: "মোবাইলের নিজস্ব শেয়ার মেন্যু খুলুন",
        onClick: () => {
          shareContent(sharePayload);
        },
      });
    }

    const socialGroup: ActionSheetGroup = {
      items: [
        {
          icon: Send,
          label: "হোয়াটসঅ্যাপে পাঠান",
          description: "WhatsApp চ্যাট বা গ্রুপে শেয়ার করুন",
          onClick: () => {
            window.open(
              getSocialShareUrl("whatsapp", sharePayload),
              "_blank",
              "noopener,noreferrer",
            );
          },
        },
        {
          icon: Send,
          label: "টেলিগ্রামে পাঠান",
          description: "Telegram চ্যানেলে বা মেসেজে শেয়ার করুন",
          onClick: () => {
            window.open(
              getSocialShareUrl("telegram", sharePayload),
              "_blank",
              "noopener,noreferrer",
            );
          },
        },
        {
          icon: Global,
          label: "ফেসবুকে শেয়ার করুন",
          description: "Facebook ফিড বা গ্রুপে শেয়ার করুন",
          onClick: () => {
            window.open(
              getSocialShareUrl("facebook", sharePayload),
              "_blank",
              "noopener,noreferrer",
            );
          },
        },
        {
          icon: Global,
          label: "এক্সে পোস্ট করুন (X / Twitter)",
          description: "টুইট আকারে শেয়ার করুন",
          onClick: () => {
            window.open(getSocialShareUrl("x", sharePayload), "_blank", "noopener,noreferrer");
          },
        },
      ],
    };

    return [primaryGroup, socialGroup];
  }, [sharePayload, canNativeShare]);

  return (
    <ActionSheet
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={title}
      description={description}
      groups={shareGroups}
    />
  );
}
