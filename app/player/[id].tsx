import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
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

  // Create video player with expo-video
  const player = useVideoPlayer(currentVideo.hlsUrl, (player) => {
    player.muted = false;
    player.volume = 1.0;
    player.play();
  });

  // Listen to player events
  useEffect(() => {
    if (!player) return;

    const statusSubscription = player.addListener("statusChange", (payload) => {
      if (payload.status === "error") {
        setError("Failed to play video");
      }
    });

    const endSubscription = player.addListener("playToEnd", () => {
      if (isBinge && sectionVideos.length > 0) {
        const nextIndex = currentIndex + 1;
        if (nextIndex < sectionVideos.length) {
          const nextVideo = sectionVideos[nextIndex];
          setCurrentIndex(nextIndex);
          setCurrentVideo({
            title: nextVideo.title,
            hlsUrl: nextVideo.hls_link,
          });
        } else {
          setIsAllDone(true);
        }
      } else if (!isBinge) {
        // Loop video when not in binge mode
        player.currentTime = 0;
        player.play();
      }
    });

    return () => {
      statusSubscription.remove();
      endSubscription.remove();
    };
  }, [player, isBinge, sectionVideos, currentIndex]);

  // Fetch section videos for navigation (both binge and single mode)
  useEffect(() => {
    if (sectionKey) {
      listVideosByCategory(sectionKey).then((videos) => {
        setSectionVideos(videos);
      });
    }
  }, [sectionKey]);

  // Update player source when video changes
  useEffect(() => {
    if (player && currentVideo.hlsUrl) {
      player.replace(currentVideo.hlsUrl);
      player.play();
    }
  }, [currentVideo.hlsUrl]);

  const handleClose = useCallback(() => {
    if (player) {
      player.pause();
    }
    router.back();
  }, [router, player]);

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
    setIsAllDone(false);
  }, [sectionVideos]);

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" hidden />
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleClose}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isAllDone) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" hidden />
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.centerContainer}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>All Done!</Text>
          <Text style={styles.doneSubtitle}>
            You've watched all {sectionVideos.length} videos
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleRestart}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.buttonText}>Watch Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleClose}>
            <Text style={styles.secondaryButtonText}>Back to Stream</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden />

      {/* Full screen video player */}
      <VideoView
        player={player}
        style={styles.fullScreenVideo}
        contentFit="contain"
        nativeControls
        allowsFullscreen
        allowsPictureInPicture
      />

      {/* Close button - moved to left to avoid volume control overlap */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Video title overlay */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {currentVideo.title}
        </Text>
        {sectionVideos.length > 1 && (
          <Text style={styles.progress}>
            {currentIndex + 1} of {sectionVideos.length}
          </Text>
        )}
      </View>

      {/* Navigation controls - always show when videos available */}
      {sectionVideos.length > 1 && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <Ionicons
              name="play-skip-back"
              size={24}
              color={currentIndex === 0 ? "#6B7280" : "#fff"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              currentIndex >= sectionVideos.length - 1 && styles.navButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={currentIndex >= sectionVideos.length - 1}
          >
            <Ionicons
              name="play-skip-forward"
              size={24}
              color={currentIndex >= sectionVideos.length - 1 ? "#6B7280" : "#fff"}
            />
          </TouchableOpacity>
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
  fullScreenVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    position: "absolute",
    top: 50,
    left: 70,
    right: 16,
    zIndex: 100,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  progress: {
    fontSize: 12,
    color: "#E5E7EB",
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  centerContainer: {
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
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  controls: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    zIndex: 100,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  nextButton: {
    backgroundColor: "#8B5CF6",
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  doneEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  doneTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  doneSubtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    marginBottom: 32,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  secondaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  secondaryButtonText: {
    color: "#9CA3AF",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
});
