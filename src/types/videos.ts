export type VideoCategory = "letters" | "rhymes" | "stories" | "numbers";

export type VideoTier = "free" | "pro";

export interface StreamVideo {
  id: string;
  userId: string | null;
  title: string;
  description: string | null;
  category: VideoCategory;
  cloudflareUid: string;
  playbackId: string;
  durationSeconds: number | null;
  thumbnailUrl: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  tier: VideoTier;
  hls_link: string;
}

export interface SectionState {
  title: string;
  key: VideoCategory;
  videos: StreamVideo[];
  isExpanded: boolean;
}
