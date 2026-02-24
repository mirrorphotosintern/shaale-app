import { JourneyScreen } from "../../../types/journey"
import TextScreen from "./TextScreen"
import QuizScreen from "./QuizScreen"
import ImageQuizScreen from "./ImageQuizScreen"
import ImageAnswerQuizScreen from "./ImageAnswerQuizScreen"
import VideoScreen from "./VideoScreen"

interface Props {
  screen: JourneyScreen
  onNext: () => void
  onAnswer?: (isCorrect: boolean) => void
}

export default function ScreenRenderer({ screen, onNext, onAnswer }: Props) {
  switch (screen.type) {
    case "text":
    case "finish":
      return <TextScreen screen={screen} onNext={onNext} />

    case "quiz":
      return <QuizScreen screen={screen} onNext={onNext} onAnswer={onAnswer} />

    case "image-question-quiz":
      return <ImageQuizScreen screen={screen} onNext={onNext} onAnswer={onAnswer} />

    case "image-answer-quiz":
      return <ImageAnswerQuizScreen screen={screen} onNext={onNext} onAnswer={onAnswer} />

    case "video":
      return <VideoScreen screen={screen} onNext={onNext} />

    default:
      return <TextScreen screen={screen} onNext={onNext} />
  }
}
