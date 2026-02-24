import AsyncStorage from "@react-native-async-storage/async-storage"
import { JourneyProgress, GundaState } from "../types/journey"

const STORAGE_KEY = "journey_progress_v1"

const DEFAULT_PROGRESS: JourneyProgress = {
  completedLevels: [],
  currentLevel: 1,
  gundaState: "egg",
  totalCoins: 0,
  lastActiveDate: new Date().toISOString(),
  lastNotifiedDate: new Date().toISOString(),
  ajjiLettersSeen: [],
}

function computeGundaState(completedLevels: number[]): GundaState {
  const count = completedLevels.length
  if (count >= 15) return "flying"
  if (count >= 10) return "growing"
  if (count >= 3) return "hatchling"
  return "egg"
}

export async function loadProgress(): Promise<JourneyProgress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PROGRESS }
    return JSON.parse(raw) as JourneyProgress
  } catch {
    return { ...DEFAULT_PROGRESS }
  }
}

export async function saveProgress(progress: JourneyProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // silently fail — progress is best-effort
  }
}

export async function completeLevel(
  level: number,
  coinsEarned: number
): Promise<JourneyProgress> {
  const progress = await loadProgress()

  if (!progress.completedLevels.includes(level)) {
    progress.completedLevels.push(level)
    progress.totalCoins += coinsEarned
  }

  progress.currentLevel = Math.min(
    progress.completedLevels.length + 1,
    15
  )
  progress.gundaState = computeGundaState(progress.completedLevels)
  progress.lastActiveDate = new Date().toISOString()

  await saveProgress(progress)
  return progress
}

export async function markAjjiLetterSeen(milestoneLevel: number): Promise<void> {
  const progress = await loadProgress()
  if (!progress.ajjiLettersSeen.includes(milestoneLevel)) {
    progress.ajjiLettersSeen.push(milestoneLevel)
    await saveProgress(progress)
  }
}

export async function resetProgress(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY)
}

export function isLevelUnlocked(
  level: number,
  completedLevels: number[]
): boolean {
  if (level === 1) return true
  return completedLevels.includes(level - 1)
}
