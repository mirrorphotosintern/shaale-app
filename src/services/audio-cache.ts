import * as FileSystem from "expo-file-system/legacy";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

const CACHE_DIR = FileSystem.cacheDirectory + "audio/";

async function ensureCacheDir() {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

function urlToFilename(url: string): string {
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

export async function resolveAudioPath(url: string): Promise<string> {
  const cached = await getCachedPath(url);
  if (cached) return cached;
  return downloadToCache(url);
}

export async function predownloadAudio(urls: string[]): Promise<void> {
  await ensureCacheDir();
  for (const url of urls) {
    try {
      const cached = await getCachedPath(url);
      if (!cached) await downloadToCache(url);
    } catch (_) {}
  }
}

let currentPlayer: ReturnType<typeof createAudioPlayer> | null = null;
let audioModeSet = false;

export async function playCachedAudio(url: string): Promise<void> {
  try {
    if (currentPlayer) {
      currentPlayer.pause();
      currentPlayer.release();
      currentPlayer = null;
    }

    if (!audioModeSet) {
      await setAudioModeAsync({ playsInSilentMode: true });
      audioModeSet = true;
    }

    const localUri = await resolveAudioPath(url);
    const player = createAudioPlayer({ uri: localUri });
    currentPlayer = player;
    player.play();
  } catch (_) {}
}
