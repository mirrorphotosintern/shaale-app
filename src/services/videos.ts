import Papa from "papaparse";
import { StreamVideo, VideoCategory } from "../types/videos";

// Cache for videos to avoid repeated fetches
let videosCache: StreamVideo[] | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// CSV URL from Supabase Storage - same as web app
const VIDEOS_CSV_URL =
  "https://ufmwnqllgqrfkdfahptv.supabase.co/storage/v1/object/public/videos_csv/videos-template.csv";

interface CSVRow {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  category: string;
  cloudflare_uid: string;
  playback_id: string;
  duration_seconds?: string;
  thumbnail_url?: string;
  is_published?: string;
  sort_order?: string;
  created_at?: string;
  updated_at?: string;
  tier?: string;
  hls_link?: string;
}

function parseCSVRow(row: CSVRow): StreamVideo | null {
  // Skip if required fields are missing
  if (!row.title || !row.category || !row.cloudflare_uid || !row.playback_id) {
    return null;
  }

  // Validate category
  if (!["letters", "rhymes", "stories", "numbers"].includes(row.category)) {
    return null;
  }

  const tierValue = row.tier?.toLowerCase() === "pro" ? "pro" : "free";
  const isPublished = row.is_published
    ? row.is_published.toLowerCase() === "true"
    : true;

  return {
    id: row.id || Math.random().toString(36).substring(7),
    userId: row.user_id || null,
    title: row.title,
    description: row.description || null,
    category: row.category as VideoCategory,
    cloudflareUid: row.cloudflare_uid,
    playbackId: row.playback_id,
    durationSeconds: row.duration_seconds
      ? parseInt(row.duration_seconds, 10)
      : null,
    thumbnailUrl: row.thumbnail_url || null,
    isPublished,
    sortOrder: row.sort_order ? parseInt(row.sort_order, 10) : 0,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    tier: tierValue,
    hls_link: row.hls_link || "",
  };
}

export async function fetchVideosFromCSV(): Promise<StreamVideo[]> {
  // Check cache first
  const now = Date.now();
  if (videosCache && now - lastCacheTime < CACHE_DURATION) {
    return videosCache;
  }

  console.log("[VideosCSV] Fetching from:", VIDEOS_CSV_URL);

  const response = await fetch(VIDEOS_CSV_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch videos CSV: ${response.status} ${response.statusText}`
    );
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const videos: StreamVideo[] = [];

        for (const row of results.data) {
          const video = parseCSVRow(row);
          if (video) {
            videos.push(video);
          }
        }

        // Cache the results
        videosCache = videos;
        lastCacheTime = now;

        console.log(`[VideosCSV] Loaded ${videos.length} videos successfully`);
        resolve(videos);
      },
      error: (error: Error) => {
        console.error("[VideosCSV] Parse error:", error);
        reject(error);
      },
    });
  });
}

export async function listVideosByCategory(
  category: VideoCategory
): Promise<StreamVideo[]> {
  const allVideos = await fetchVideosFromCSV();

  return allVideos
    .filter((v) => v.category === category && v.isPublished)
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder ||
        a.createdAt.getTime() - b.createdAt.getTime()
    );
}

export async function getAllVideos(): Promise<StreamVideo[]> {
  return fetchVideosFromCSV();
}
