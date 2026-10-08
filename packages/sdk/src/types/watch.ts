export interface WatchChannel {
  id?: string;
  name: string;
  handle: string;
  avatar: string;
  banner?: string | null;
  subscribers: number;
  subscribersCount?: number;
  isSubscribed?: boolean;
  videoCount: number;
  verified?: boolean;
  description: string;
  joinedAt?: string | null;
  links?: { title: string; url: string }[];
}

export interface WatchVideo {
  type?: "video";
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  channel: {
    name: string;
    handle: string;
    avatar: string;
    subscribers: number;
    subscribersCount?: number;
    isSubscribed?: boolean;
    verified?: boolean;
  };
  category?: string;
  duration: string;
  durationSeconds?: number;
  views?: string;
  viewsCount?: number;
  likes?: string;
  likesCount?: number;
  publishedAt: string;
  tags?: string[];
  commentsCount?: string | number;
  customThumbnail?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  comments?: {
    id: string;
    author: string;
    avatar: string;
    date: string;
    content: string;
    likes: number;
  }[];
}

export interface WatchPlaylist {
  type: "playlist";
  id: string;
  slug: string;
  title: string;
  description: string;
  customCover: string;
  category?: string;
  createdAt: string;
  videoIds: string[];
  channelName: string;
  channelHandle?: string | null;
}

export type WatchFeedItem = (WatchVideo & { type?: "video" }) | WatchPlaylist;

export interface WatchUserProgress {
  lastPositionSeconds: number;
  durationSeconds: number;
  completed: boolean;
}

export interface WatchUserInteraction {
  isLiked: boolean;
  isSaved: boolean;
}

export interface WatchCommentItem {
  id: string;
  videoId: string;
  content: string;
  likesCount: number;
  parentId?: string | null;
  createdAt: string;
  author: {
    id?: string;
    name: string;
    avatar: string;
  };
  isLikedByUser: boolean;
}
