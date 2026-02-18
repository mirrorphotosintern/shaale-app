// Audio cache - disabled (native module incompatible with iOS 26 beta)
// Will re-enable when expo-av releases iOS 26 support

/** Pre-download a list of URLs silently in the background */
export async function predownloadAudio(_urls: string[]): Promise<void> {}

/** Play audio from URL (currently disabled) */
export async function playCachedAudio(_url: string): Promise<void> {}

/** Resolve audio path (currently disabled) */
export async function resolveAudioPath(_url: string): Promise<string> {
  return "";
}
