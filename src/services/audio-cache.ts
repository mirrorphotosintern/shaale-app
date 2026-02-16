import * as FileSystem from "expo-file-system/legacy";
import { Audio } from "expo-av";

const CACHE_DIR = FileSystem.cacheDirectory + "audio/";

// Ensure cache directory exists
async function ensureCacheDir() {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

function urlToFilename(url: string): string {
  // Use just the filename portion of the URL as the cache key
  return url.split("/").pop()!.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function getCachedPath(url: string): Promise<string | null> {
  const filename = urlToFilename(url);
  const localPath = CACHE_DIR + filename;
  const info = await FileSystem.getInfoAsync(localPath);
  return info.exists ? localPath : null;
}

async function downloadToCache(url: string): Promise<string> {
  await ensureCacheDir();
  const filename = urlToFilename(url);
  const localPath = CACHE_DIR + filename;
  await FileSystem.downloadAsync(url, localPath);
  return localPath;
}

/** Returns local path — downloading if needed */
export async function resolveAudioPath(url: string): Promise<string> {
  const cached = await getCachedPath(url);
  if (cached) return cached;
  return downloadToCache(url);
}

/** Pre-download a list of URLs silently in the background */
export async function predownloadAudio(urls: string[]): Promise<void> {
  await ensureCacheDir();
  for (const url of urls) {
    try {
      const cached = await getCachedPath(url);
      if (!cached) await downloadToCache(url);
    } catch (_) {
      // silently skip failures
    }
  }
}

// ─── Singleton sound player ───────────────────────────────────────────────────
let currentSound: Audio.Sound | null = null;

export async function playCachedAudio(url: string): Promise<void> {
  try {
    // Stop anything currently playing
    if (currentSound) {
      await currentSound.stopAsync().catch(() => {});
      await currentSound.unloadAsync().catch(() => {});
      currentSound = null;
    }

    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

    const localUri = await resolveAudioPath(url);
    const { sound } = await Audio.Sound.createAsync({ uri: localUri });
    currentSound = sound;
    await sound.playAsync();

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        if (currentSound === sound) currentSound = null;
      }
    });
  } catch (_) {}
}
