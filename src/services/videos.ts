import { StreamVideo, VideoCategory } from "../types/videos";
import { STREAM_VIDEOS } from "../data/stream-videos";

export async function fetchVideosFromCSV(): Promise<StreamVideo[]> {
  return STREAM_VIDEOS;
}

export async function listVideosByCategory(
  category: VideoCategory
): Promise<StreamVideo[]> {
  return STREAM_VIDEOS.filter(
    (v) => v.category === category && v.isPublished
  ).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getAllVideos(): Promise<StreamVideo[]> {
  return STREAM_VIDEOS;
}
