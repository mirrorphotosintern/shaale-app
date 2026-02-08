import { create } from "zustand";

export interface WordMastery {
  kannada: string;
  english?: string;
  source: string;
  learnedAt: number;
}

export interface DialogData {
  npc: string;
  npcKannada: string;
  kannada: string;
  english: string;
  words: string[];
}

export type PetStage = "none" | "gubbi" | "garuda" | "gandaberunda";

interface QuestState {
  // Game state
  isLoaded: boolean;
  currentArea: number;
  playerPosition: { x: number; y: number };

  // Dialog
  activeDialog: DialogData | null;

  // Player progress
  wordsLearned: WordMastery[];
  petStage: PetStage;
  petXp: number;
  totalXp: number;

  // Actions
  setLoaded: (loaded: boolean) => void;
  setDialog: (dialog: DialogData | null) => void;
  learnWord: (word: WordMastery) => void;
  setPosition: (pos: { x: number; y: number }) => void;
  addXp: (amount: number) => void;
  dismissDialog: () => void;
}

export const useQuestStore = create<QuestState>((set, get) => ({
  isLoaded: false,
  currentArea: 1,
  playerPosition: { x: 240, y: 400 },
  activeDialog: null,
  wordsLearned: [],
  petStage: "none",
  petXp: 0,
  totalXp: 0,

  setLoaded: (loaded) => set({ isLoaded: loaded }),

  setDialog: (dialog) => set({ activeDialog: dialog }),

  learnWord: (word) => {
    const existing = get().wordsLearned;
    if (!existing.find((w) => w.kannada === word.kannada)) {
      set({ wordsLearned: [...existing, word] });
    }
  },

  setPosition: (pos) => set({ playerPosition: pos }),

  addXp: (amount) => {
    const newXp = get().totalXp + amount;
    const newPetXp = get().petXp + amount;
    let petStage = get().petStage;
    if (newPetXp >= 2000) petStage = "gandaberunda";
    else if (newPetXp >= 500) petStage = "garuda";
    else if (newPetXp >= 10) petStage = "gubbi";
    set({ totalXp: newXp, petXp: newPetXp, petStage });
  },

  dismissDialog: () => set({ activeDialog: null }),
}));
