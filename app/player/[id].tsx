import { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { listVideosByCategory } from "../../src/services/videos";
import { StreamVideo, VideoCategory } from "../../src/types/videos";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    hlsUrl: string;
    title: string;
    sectionKey: string;
    videoIndex: string;
    isBinge: string;
  }>();

  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(
    parseInt(params.videoIndex || "0", 10)
  );
  const [sectionVideos, setSectionVideos] = useState<StreamVideo[]>([]);
  const [currentVideo, setCurrentVideo] = useState({
    title: params.title || "Video",
    hlsUrl: params.hlsUrl || "",
  });
  const [isAllDone, setIsAllDone] = useState(false);

  const isBinge = params.isBinge === "true";
  const sectionKey = params.sectionKey as VideoCategory;

  // Fetch section videos for binge watching
  useEffect(() => {
    if (isBinge && sectionKey) {
      listVideosByCategory(sectionKey).then((videos) => {
        setSectionVideos(videos);
      });
    }
  }, [isBinge, sectionKey]);

  const handlePlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        if (status.error) {
          console.error("[Player] Playback error:", status.error);
          setError("Failed to load video");
        }
        return;
      }

      setIsLoading(false);
      setIsPlaying(status.isPlaying);

      // Handle video end
      if (status.didJustFinish && !status.isLooping) {
        if (isBinge && sectionVideos.length > 0) {
          const nextIndex = currentIndex + 1;
          if (nextIndex < sectionVideos.length) {
            // Play next video
            const nextVideo = sectionVideos[nextIndex];
            setCurrentIndex(nextIndex);
            setCurrentVideo({
              title: nextVideo.title,
              hlsUrl: nextVideo.hls_link,
            });
            setIsLoading(true);
          } else {
            // All videos done
            setIsAllDone(true);
          }
        }
      }
    },
    [isBinge, sectionVideos, currentIndex]
  );

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handlePlayPause = useCallback(async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  }, [isPlaying]);

  const handleNext = useCallback(() => {
    if (sectionVideos.length === 0) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex < sectionVideos.length) {
      const nextVideo = sectionVideos[nextIndex];
      setCurrentIndex(nextIndex);
      setCurrentVideo({
        title: nextVideo.title,
        hlsUrl: nextVideo.hls_link,
      });
      setIsLoading(true);
      setIsAllDone(false);
    }
  }, [currentIndex, sectionVideos]);

  const handlePrevious = useCallback(() => {
    if (sectionVideos.length === 0) return;

    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      const prevVideo = sectionVideos[prevIndex];
      setCurrentIndex(prevIndex);
      setCurrentVideo({
        title: prevVideo.title,
        hlsUrl: prevVideo.hls_link,
      });
      setIsLoading(true);
      setIsAllDone(false);
    }
  }, [currentIndex, sectionVideos]);

  const handleRestart = useCallback(() => {
    if (sectionVideos.length === 0) return;

    setCurrentIndex(0);
    setCurrentVideo({
      title: sectionVideos[0].title,
      hlsUrl: sectionVideos[0].hls_link,
    });
    setIsLoading(true);
    setIsAllDone(false);
  }, [sectionVideos]);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleClose}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isAllDone) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.allDoneContainer}>
          <Text style={styles.allDoneEmoji}>🎉</Text>
          <Text style={styles.allDoneTitle}>All Done!</Text>
          <Text style={styles.allDoneSubtitle}>
            You've watched all {sectionVideos.length} videos
          </Text>
          <View style={styles.allDoneButtons}>
            <TouchableOpacity
              style={styles.restartButton}
              onPress={handleRestart}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.restartButtonText}>Watch Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleClose}
            >
              <Text style={styles.backButtonText}>Back to Stream</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Video title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {currentVideo.title}
        </Text>
        {isBinge && sectionVideos.length > 0 && (
          <Text style={styles.progress}>
            {currentIndex + 1} of {sectionVideos.length}
          </Text>
        )}
      </View>

      {/* Video player */}
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: currentVideo.hlsUrl }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          useNativeControls
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onError={(error) => {
            console.error("[Player] Video error:", error);
            setError("Failed to play video");
          }}
        />

        {/* Loading overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </View>

      {/* Navigation controls for binge watch */}
      {isBinge && sectionVideos.length > 0 && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <Ionicons
              name="play-skip-back"
              size={24}
              color={currentIndex === 0 ? "#6B7280" : "#fff"}
            />
            <Text
              style={[
                styles.navButtonText,
                currentIndex === 0 && styles.navButtonTextDisabled,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              currentIndex >= sectionVideos.length - 1 &&
                styles.navButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={currentIndex >= sectionVideos.length - 1}
          >
            <Text
              style={[
                styles.navButtonText,
                currentIndex >= sectionVideos.length - 1 &&
                  styles.navButtonTextDisabled,
              ]}
            >
              Next
            </Text>
            <Ionicons
              name="play-skip-forward"
              size={24}
              color={
                currentIndex >= sectionVideos.length - 1 ? "#6B7280" : "#fff"
              }
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Binge mode indicator */}
      {isBinge && (
        <View style={styles.bingeIndicator}>
          <Text style={styles.bingeText}>Auto-advance enabled</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 80,
    zIndex: 100,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  progress: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
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
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  nextButton: {
    backgroundColor: "#4F46E5",
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  navButtonTextDisabled: {
    color: "#6B7280",
  },
  bingeIndicator: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bingeText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  allDoneContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  allDoneEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  allDoneTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  allDoneSubtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    marginBottom: 32,
  },
  allDoneButtons: {
    gap: 12,
  },
  restartButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  restartButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  backButtonText: {
    color: "#9CA3AF",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
});
