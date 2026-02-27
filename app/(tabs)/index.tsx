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
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/hooks/useAuthSafe";
import { listVideosByCategory } from "../../src/services/videos";
import { StreamVideo, VideoCategory, SectionState } from "../../src/types/videos";
import { useSubscription } from "../../src/hooks/useSubscription";

const SECTION_MARGIN = 12;
const GRID_PADDING = 12;
const GRID_GAP = 12;
const PORTRAIT_RATIO = 16 / 9;

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface VideoThumbnailProps {
  video: StreamVideo;
  onPress: () => void;
  width: number;
  isLastInRow?: boolean;
}

function VideoThumbnail({ video, onPress, width, isLastInRow }: VideoThumbnailProps) {
  return (
    <TouchableOpacity
      style={[styles.thumbnail, { width, marginRight: isLastInRow ? 0 : GRID_GAP }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.thumbnailImageContainer, { height: Math.floor(width * PORTRAIT_RATIO) }]}>
        {video.thumbnailUrl ? (
          <Image
            source={{ uri: video.thumbnailUrl }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={{ fontSize: 32, color: "#9CA3AF" }}>▶</Text>
          </View>
        )}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Text style={{ fontSize: 18, color: "#fff", marginLeft: 2 }}>▶</Text>
          </View>
        </View>
        {video.durationSeconds != null && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(video.durationSeconds)}</Text>
          </View>
        )}
        {video.tier === "pro" && (
          <View style={styles.proBadge}>
            <Text style={styles.proText}>PRO</Text>
          </View>
        )}
      </View>
      <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
    </TouchableOpacity>
  );
}

interface VideoSectionProps {
  section: SectionState;
  onToggle: () => void;
  onVideoPress: (video: StreamVideo) => void;
  onBingeWatch: () => void;
  thumbnailWidth: number;
}

function VideoSection({ section, onToggle, onVideoPress, onBingeWatch, thumbnailWidth }: VideoSectionProps) {
  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader} onPress={onToggle}>
        <View>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionCount}>{section.videos.length} videos</Text>
        </View>
        <View style={styles.sectionActions}>
          {section.isExpanded && section.videos.length > 0 && (
            <TouchableOpacity
              style={styles.bingeButton}
              onPress={(e) => { e.stopPropagation(); onBingeWatch(); }}
            >
              <Text style={styles.bingeButtonText}>Binge Watch</Text>
            </TouchableOpacity>
          )}
          <Text style={{ fontSize: 20, color: "#9CA3AF" }}>
            {section.isExpanded ? "▲" : "▼"}
          </Text>
        </View>
      </TouchableOpacity>

      {section.isExpanded && (
        <View style={styles.videoGrid}>
          {section.videos.length > 0 ? (
            section.videos.map((video, index) => (
              <VideoThumbnail
                key={video.id}
                video={video}
                onPress={() => onVideoPress(video)}
                width={thumbnailWidth}
                isLastInRow={index % 2 === 1}
              />
            ))
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
  const { isSignedIn } = useAuth();
  const { isPro, presentPaywall } = useSubscription();
  const { width: screenWidth } = useWindowDimensions();
  const thumbnailWidth = Math.floor(
    (screenWidth - SECTION_MARGIN * 2 - GRID_PADDING * 2 - GRID_GAP) / 2
  );

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
            s.key === "rhymes" ? rhymes
            : s.key === "stories" ? stories
            : s.key === "numbers" ? numbers
            : letters;
          return { ...s, videos };
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load videos");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchVideos();
  }, [fetchVideos]);

  const toggleSection = useCallback((key: VideoCategory) => {
    setSections((prev) => prev.map((s) => s.key === key ? { ...s, isExpanded: !s.isExpanded } : s));
  }, []);

  const handleVideoPress = useCallback(
    async (video: StreamVideo, sectionKey: VideoCategory) => {
      if (video.tier === "pro") {
        if (!isSignedIn) {
          router.push("/sign-in");
          return;
        }
        if (!isPro) {
          await presentPaywall();
          return;
        }
      }
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
    [router, sections, isSignedIn, isPro, presentPaywall]
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
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.errorContainer}>
          <Text style={{ fontSize: 48 }}>!</Text>
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
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#8B5CF6" />
        }
      >
        {sections.map((section) => (
          <VideoSection
            key={section.key}
            section={section}
            onToggle={() => toggleSection(section.key)}
            onVideoPress={(video) => handleVideoPress(video, section.key)}
            onBingeWatch={() => handleBingeWatch(section.key)}
            thumbnailWidth={thumbnailWidth}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  scrollView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#9CA3AF" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  errorText: { marginTop: 12, fontSize: 16, color: "#9CA3AF", textAlign: "center" },
  retryButton: { marginTop: 16, backgroundColor: "#8B5CF6", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: "#fff", fontWeight: "600" },
  section: { marginBottom: 16, backgroundColor: "#1F2937", marginHorizontal: SECTION_MARGIN, borderRadius: 12, overflow: "hidden" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  sectionCount: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  sectionActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  bingeButton: { backgroundColor: "#8B5CF6", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  bingeButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  videoGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: GRID_PADDING, paddingBottom: 16, justifyContent: "flex-start" },
  thumbnail: { marginBottom: 12 },
  thumbnailImageContainer: { width: "100%", borderRadius: 8, overflow: "hidden", backgroundColor: "#374151" },
  thumbnailImage: { width: "100%", height: "100%" },
  placeholderImage: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "#374151" },
  playOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  playButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.3)", justifyContent: "center", alignItems: "center" },
  durationBadge: { position: "absolute", bottom: 4, right: 4, backgroundColor: "rgba(0,0,0,0.8)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  durationText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  proBadge: { position: "absolute", top: 4, left: 4, backgroundColor: "#8B5CF6", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  proText: { color: "#fff", fontSize: 9, fontWeight: "bold" },
  videoTitle: { marginTop: 8, fontSize: 12, color: "#E5E7EB", textAlign: "center" },
  noVideosText: { color: "#9CA3AF", textAlign: "center", width: "100%", paddingVertical: 20 },
});
