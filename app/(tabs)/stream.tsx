// Stream screen - displays videos in a 2-column grid with vertical thumbnails
// Uses FlatList with numColumns={2} for reliable grid layout

import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native";
import { listVideosByCategory } from "../../src/services/videos";
import { StreamVideo, VideoCategory, SectionState } from "../../src/types/videos";

// Calculate dimensions for 2-column grid with vertical thumbnails
const SCREEN_WIDTH = Dimensions.get("window").width;
const SECTION_HORIZONTAL_MARGIN = 12;
const GRID_HORIZONTAL_PADDING = 12;
const GAP_BETWEEN_ITEMS = 12;

// Available width inside the grid = screen - section margins (24) - grid padding (24)
const AVAILABLE_WIDTH = SCREEN_WIDTH - (SECTION_HORIZONTAL_MARGIN * 2) - (GRID_HORIZONTAL_PADDING * 2);
// Each item width = (available - gap) / 2
const ITEM_WIDTH = Math.floor((AVAILABLE_WIDTH - GAP_BETWEEN_ITEMS) / 2);
// Vertical aspect ratio (9:16) means height = width * (16/9)
const ITEM_HEIGHT = Math.floor(ITEM_WIDTH * (16 / 9));

console.log("[Stream] Layout dimensions:", {
  screenWidth: SCREEN_WIDTH,
  availableWidth: AVAILABLE_WIDTH,
  itemWidth: ITEM_WIDTH,
  itemHeight: ITEM_HEIGHT,
  twoItemsWithGap: ITEM_WIDTH * 2 + GAP_BETWEEN_ITEMS,
});

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface VideoThumbnailProps {
  video: StreamVideo;
  onPress: () => void;
}

function VideoThumbnail({ video, onPress }: VideoThumbnailProps) {
  return (
    <TouchableOpacity
      style={styles.thumbnailTouchable}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageWrapper}>
        {video.thumbnailUrl ? (
          <Image
            source={{ uri: video.thumbnailUrl }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="play" size={32} color="#9CA3AF" />
          </View>
        )}
        {/* Play button overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={20} color="#fff" />
          </View>
        </View>
        {/* Duration badge */}
        {video.durationSeconds && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(video.durationSeconds)}
            </Text>
          </View>
        )}
        {/* Pro badge */}
        {video.tier === "pro" && (
          <View style={styles.proBadge}>
            <Text style={styles.proText}>PRO</Text>
          </View>
        )}
      </View>
      <Text style={styles.videoTitle} numberOfLines={2}>
        {video.title}
      </Text>
    </TouchableOpacity>
  );
}

interface VideoSectionProps {
  section: SectionState;
  onToggle: () => void;
  onVideoPress: (video: StreamVideo) => void;
  onBingeWatch: () => void;
}

function VideoSection({
  section,
  onToggle,
  onVideoPress,
  onBingeWatch,
}: VideoSectionProps) {
  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader} onPress={onToggle}>
        <View>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionCount}>
            {section.videos.length} videos
          </Text>
        </View>
        <View style={styles.sectionActions}>
          {section.isExpanded && section.videos.length > 0 && (
            <TouchableOpacity
              style={styles.bingeButton}
              onPress={(e) => {
                e.stopPropagation();
                onBingeWatch();
              }}
            >
              <Text style={styles.bingeButtonText}>Binge Watch</Text>
            </TouchableOpacity>
          )}
          <Ionicons
            name={section.isExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color="#9CA3AF"
          />
        </View>
      </TouchableOpacity>

      {section.isExpanded && (
        <View style={styles.videoGrid}>
          {section.videos.length > 0 ? (
            // Group videos into pairs for 2-column layout
            Array.from({ length: Math.ceil(section.videos.length / 2) }).map((_, rowIndex) => {
              const video1 = section.videos[rowIndex * 2];
              const video2 = section.videos[rowIndex * 2 + 1];
              return (
                <View key={rowIndex} style={styles.videoRow}>
                  <View style={styles.thumbnailWrapper}>
                    <VideoThumbnail
                      video={video1}
                      onPress={() => onVideoPress(video1)}
                    />
                  </View>
                  {video2 && (
                    <View style={styles.thumbnailWrapper}>
                      <VideoThumbnail
                        video={video2}
                        onPress={() => onVideoPress(video2)}
                      />
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <Text style={styles.noVideosText}>No videos yet</Text>
          )}
        </View>
      )}
    </View>
  );
}

export default function StreamScreen() {
  const router = useRouter();
  const [sections, setSections] = useState<SectionState[]>([
    { title: "Rhymes", key: "rhymes", videos: [], isExpanded: true },
    { title: "Stories", key: "stories", videos: [], isExpanded: true },
    { title: "Numbers", key: "numbers", videos: [], isExpanded: true },
    { title: "Letters", key: "letters", videos: [], isExpanded: true },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      setError(null);
      const [rhymes, stories, numbers, letters] = await Promise.all([
        listVideosByCategory("rhymes"),
        listVideosByCategory("stories"),
        listVideosByCategory("numbers"),
        listVideosByCategory("letters"),
      ]);

      setSections((prev) =>
        prev.map((s) => {
          const videos =
            s.key === "rhymes"
              ? rhymes
              : s.key === "stories"
              ? stories
              : s.key === "numbers"
              ? numbers
              : letters;
          return { ...s, videos };
        })
      );
    } catch (err) {
      console.error("[Stream] Error fetching videos:", err);
      setError(err instanceof Error ? err.message : "Failed to load videos");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchVideos();
  }, [fetchVideos]);

  const toggleSection = useCallback((key: VideoCategory) => {
    setSections((prev) =>
      prev.map((s) =>
        s.key === key ? { ...s, isExpanded: !s.isExpanded } : s
      )
    );
  }, []);

  const handleVideoPress = useCallback(
    (video: StreamVideo, sectionKey: VideoCategory) => {
      const section = sections.find((s) => s.key === sectionKey);
      const videoIndex = section?.videos.findIndex((v) => v.id === video.id) ?? 0;

      router.push({
        pathname: "/player/[id]",
        params: {
          id: video.id,
          hlsUrl: video.hls_link,
          title: video.title,
          sectionKey,
          videoIndex: videoIndex.toString(),
          isBinge: "false",
        },
      });
    },
    [router, sections]
  );

  const handleBingeWatch = useCallback(
    (sectionKey: VideoCategory) => {
      const section = sections.find((s) => s.key === sectionKey);
      if (!section || section.videos.length === 0) return;

      const firstVideo = section.videos[0];
      router.push({
        pathname: "/player/[id]",
        params: {
          id: firstVideo.id,
          hlsUrl: firstVideo.hls_link,
          title: firstVideo.title,
          sectionKey,
          videoIndex: "0",
          isBinge: "true",
        },
      });
    },
    [router, sections]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchVideos}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#4F46E5"
          />
        }
      >
        {sections.map((section) => (
          <VideoSection
            key={section.key}
            section={section}
            onToggle={() => toggleSection(section.key)}
            onVideoPress={(video) => handleVideoPress(video, section.key)}
            onBingeWatch={() => handleBingeWatch(section.key)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#9CA3AF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#4F46E5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  section: {
    marginBottom: 16,
    backgroundColor: "#1F2937",
    marginHorizontal: SECTION_HORIZONTAL_MARGIN,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  sectionCount: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  sectionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bingeButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bingeButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  videoGrid: {
    paddingHorizontal: GRID_HORIZONTAL_PADDING,
    paddingBottom: 16,
  },
  videoRow: {
    flexDirection: "row",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  thumbnailWrapper: {
    width: ITEM_WIDTH,
    flexShrink: 0,
    flexGrow: 0,
  },
  thumbnailTouchable: {
    width: "100%",
  },
  imageWrapper: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#374151",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#374151",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  proBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
  videoTitle: {
    marginTop: 8,
    fontSize: 12,
    color: "#E5E7EB",
    textAlign: "center",
  },
  noVideosText: {
    color: "#9CA3AF",
    textAlign: "center",
    width: "100%",
    paddingVertical: 20,
  },
});
