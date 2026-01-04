/**
 * Kannada language utilities for akshara segmentation and matra handling
 * This file contains functions to split Kannada words into aksharas (syllables)
 */

// Unicode ranges and constants for Kannada
// Layout: 5 letters per row, first column of each row is Ka, Cha, Ta, Ta (retroflex), Pa, etc.
// Grouped by varga (family) - each row starts with the main consonant
export const KANNADA_CONSONANTS = [
  "ಕ", "ಖ", "ಗ", "ಘ", "ಙ",  // Row 1: Ka varga - ka, kha, ga, gha, nga
  "ಚ", "ಛ", "ಜ", "ಝ", "ಞ",  // Row 2: Cha varga - cha, chha, ja, jha, nya
  "ತ", "ಥ", "ದ", "ಧ", "ನ",  // Row 3: Ta varga - ta, tha, da, dha, na
  "ಟ", "ಠ", "ಡ", "ಢ", "ಣ",  // Row 4: Ta (retroflex) varga - Ta, Tha, Da, Dha, Na
  "ಪ", "ಫ", "ಬ", "ಭ", "ಮ",  // Row 5: Pa varga - pa, pha, ba, bha, ma
  "ಯ", "ರ", "ಲ", "ವ", "ಶ",  // Row 6: Antastha + Ushma - ya, ra, la, va, sha
  "ಷ", "ಸ", "ಹ", "ಳ"        // Row 7: Remaining Ushma - sha, sa, ha, la (4 letters)
];

export const KANNADA_INDEPENDENT_VOWELS = [
  "ಅ", "ಆ", "ಇ", "ಈ", "ಉ", "ಊ", "ಋ",
  "ಎ", "ಏ", "ಐ", "ಒ", "ಓ", "ಔ"
];

// Mapping of matras (vowel signs) to their corresponding vowels
export const MATRA_TO_VOWEL_MAP: Record<string, string> = {
  "ಾ": "ಆ",
  "ಿ": "ಇ",
  "ೀ": "ಈ",
  "ು": "ಉ",
  "ೂ": "ಊ",
  "ೃ": "ಋ",
  "ೆ": "ಎ",
  "ೇ": "ಏ",
  "ೈ": "ಐ",
  "ೊ": "ಒ",
  "ೋ": "ಓ",
  "ೌ": "ಔ"
};

// Reverse mapping: vowel to matra
export const VOWEL_TO_MATRA_MAP: Record<string, string> = {
  "ಅ": "",
  "ಆ": "ಾ",
  "ಇ": "ಿ",
  "ಈ": "ೀ",
  "ಉ": "ು",
  "ಊ": "ೂ",
  "ಋ": "ೃ",
  "ಎ": "ೆ",
  "ಏ": "ೇ",
  "ಐ": "ೈ",
  "ಒ": "ೊ",
  "ಓ": "ೋ",
  "ಔ": "ೌ"
};

export const VIRAMA = "್";
export const ANUSVARA = "ಂ";
export const VISARGA = "ಃ";

// Layout for the type game - vowels arranged around consonant grid
export const TOP_SWARAS = [VISARGA, "ಅ", "ಆ"];
export const RIGHT_SWARAS = ["ಇ", "ಈ", "ಉ", "ಊ"];
export const BOTTOM_SWARAS = ["ಐ", "ಏ", "ಎ", "ಋ"];
export const LEFT_SWARAS = [ANUSVARA, "ಔ", "ಓ", "ಒ"];

// Original order of letters in the Varnamale song (for timing reference)
const ORIGINAL_SONG_LETTERS = [
  "ಅ", "ಆ", "ಇ", "ಈ", "ಉ", "ಊ", "ಋ", "ಎ", "ಏ", "ಐ", "ಒ", "ಓ", "ಔ", "ಅಂ", "ಅಃ",
  "ಕ", "ಖ", "ಗ", "ಘ", "ಙ", "ಚ", "ಛ", "ಜ", "ಝ", "ಞ", "ಟ", "ಠ", "ಡ", "ಢ", "ಣ",
  "ತ", "ಥ", "ದ", "ಧ", "ನ", "ಪ", "ಫ", "ಬ", "ಭ", "ಮ", "ಯ", "ರ", "ಲ", "ವ", "ಶ",
  "ಷ", "ಸ", "ಹ", "ಳ"
];

// Precise timing for each letter in the varnamale song (in milliseconds) - matches ORIGINAL_SONG_LETTERS order
const ORIGINAL_LETTER_TIMINGS = [
  130,    // ಅ
  960,    // ಆ
  1620,   // ಇ
  2290,   // ಈ
  3580,   // ಉ
  4420,   // ಊ
  5420,   // ಋ
  6080,   // ಎ
  6810,   // ಏ
  8490,   // ಐ
  9380,   // ಒ
  10000,  // ಓ
  11000,  // ಔ
  12440,  // ಅಂ
  13320,  // ಅಃ
  21110,  // ಕ
  21650,  // ಖ
  23250,  // ಗ
  23900,  // ಘ
  24550,  // ಙ
  26770,  // ಚ
  27000,  // ಛ
  27760,  // ಜ
  28480,  // ಝ
  29210,  // ಞ
  31880,  // ಟ
  32100,  // ಠ
  32300,  // ಡ
  32960,  // ಢ
  33630,  // ಣ
  37000,  // ತ
  37330,  // ಥ
  37820,  // ದ
  38070,  // ಧ
  38880,  // ನ
  41800,  // ಪ
  42000,  // ಫ
  42630,  // ಬ
  43300,  // ಭ
  44000,  // ಮ
  47000,  // ಯ
  47580,  // ರ
  47990,  // ಲ
  48230,  // ವ
  48720,  // ಶ
  48990,  // ಷ
  49200,  // ಸ
  50520,  // ಹ
  51000   // ಳ
];

// Map from letter to its timing (works regardless of display order)
export const LETTER_TO_TIMING_MAP: Record<string, number> = {};
ORIGINAL_SONG_LETTERS.forEach((letter, index) => {
  LETTER_TO_TIMING_MAP[letter] = ORIGINAL_LETTER_TIMINGS[index];
});

// All letters in current display order (for highlighting)
export const ALL_VARNAMALE_LETTERS = [
  "ಅ", "ಆ", "ಇ", "ಈ", "ಉ", "ಊ", "ಋ", "ಎ", "ಏ", "ಐ", "ಒ", "ಓ", "ಔ", "ಅಂ", "ಅಃ",
  ...KANNADA_CONSONANTS
];

// Timings array in the same order as ALL_VARNAMALE_LETTERS (for compatibility)
export const LETTER_TIMINGS = ALL_VARNAMALE_LETTERS.map(letter => LETTER_TO_TIMING_MAP[letter] || 0);

export function isKannadaConsonant(char: string): boolean {
  return KANNADA_CONSONANTS.includes(char);
}

export function isKannadaIndependentVowel(char: string): boolean {
  return KANNADA_INDEPENDENT_VOWELS.includes(char);
}

export function isKannadaMatra(char: string): boolean {
  return Object.keys(MATRA_TO_VOWEL_MAP).includes(char);
}

export function isKannadaModifier(char: string): boolean {
  return char === VIRAMA || char === ANUSVARA || char === VISARGA;
}

/**
 * Splits a Kannada word into an array of aksharas (syllables)
 */
export function splitIntoAksharas(word: string): string[] {
  if (!word || typeof word !== "string") return [];

  const aksharas: string[] = [];
  let currentAkshara = "";
  let i = 0;

  while (i < word.length) {
    const char = word[i];

    if (char.trim() === "") {
      i++;
      continue;
    }

    if (isKannadaIndependentVowel(char) || isKannadaConsonant(char)) {
      if (currentAkshara) {
        aksharas.push(currentAkshara);
      }

      currentAkshara = char;
      i++;

      while (
        i < word.length &&
        word[i] === VIRAMA &&
        i + 1 < word.length &&
        isKannadaConsonant(word[i + 1])
      ) {
        currentAkshara += word[i] + word[i + 1];
        i += 2;
      }

      if (i < word.length && isKannadaMatra(word[i])) {
        currentAkshara += word[i];
        i++;
      }

      if (i < word.length && (word[i] === ANUSVARA || word[i] === VISARGA)) {
        currentAkshara += word[i];
        i++;
      }
    } else {
      i++;
    }
  }

  if (currentAkshara) {
    aksharas.push(currentAkshara);
  }

  return aksharas;
}

/**
 * Builds an akshara from consonant and vowel
 */
export function buildAkshara(consonant: string, swara: string): string {
  if (!consonant) return swara;

  const hasAnusvara = swara.includes(ANUSVARA);
  const hasVisarga = swara.includes(VISARGA);
  const baseVowel = swara.replace(ANUSVARA, "").replace(VISARGA, "");

  const matra = VOWEL_TO_MATRA_MAP[baseVowel] ?? "";
  const core = baseVowel === "ಅ" ? consonant : consonant + matra;
  return core + (hasAnusvara ? ANUSVARA : "") + (hasVisarga ? VISARGA : "");
}

/**
 * Validates if a word contains only valid Kannada characters
 */
export function isValidKannadaWord(word: string): boolean {
  if (!word || typeof word !== "string") return false;

  for (const char of word) {
    if (char.trim() === "") continue;

    if (
      !isKannadaConsonant(char) &&
      !isKannadaIndependentVowel(char) &&
      !isKannadaMatra(char) &&
      !isKannadaModifier(char)
    ) {
      return false;
    }
  }

  return true;
}
