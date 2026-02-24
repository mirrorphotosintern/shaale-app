// TypeScript types for the Gundana Yatre journey system

export type ScreenType =
  | "text"
  | "quiz"
  | "image-question-quiz"
  | "image-answer-quiz"
  | "finish"
  | "video"

export type AnimationType =
  | "swipe-right"
  | "swipe-left"
  | "fade-in"
  | "fade-out"
  | "zoom-in"
  | "zoom-out"
  | "slide-up"
  | "slide-down"

export type ConditionType = "must" | "finish" | [string | number, "correct" | "wrong"]

export interface QuizContent {
  question: string
  options: string[]
  correct_answer: string | string[]
}

export interface ImageQuestionQuizContent {
  image: string
  question: string
  options: string[]
  correct_answer: string | string[]
}

export interface ImageAnswerQuizContent {
  question: string
  options: string[] // Image URLs
  correct_answer: string | string[]
}

export interface VideoContent {
  title: string
  description: string
  videoUrl: string | null
  duration?: string
}

export interface JourneyScreen {
  screen: number
  condition: ConditionType
  type: ScreenType
  content: string | QuizContent | ImageQuestionQuizContent | ImageAnswerQuizContent | VideoContent
  button?: string
  animation: AnimationType
  coin?: number
}

export interface JourneyLevel {
  screens: JourneyScreen[]
}

export interface LevelConfig {
  level: number
  letter: string
  chapter: string        // Short chapter name shown on map card
  topics: string         // Topics summary
  narrative: string      // Story hook text
  milestone: boolean     // L5, L10, L15 get gold border
  milestoneMessage?: string // Shown at milestone celebrations
  phase: 1 | 2 | 3
}

export type GundaState = "egg" | "hatchling" | "growing" | "flying"

export interface JourneyProgress {
  completedLevels: number[]
  currentLevel: number
  gundaState: GundaState
  totalCoins: number
  lastActiveDate: string        // ISO date string
  lastNotifiedDate: string
  ajjiLettersSeen: number[]     // which milestone letters shown
}
