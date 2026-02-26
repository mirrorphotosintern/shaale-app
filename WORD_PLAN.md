# Plan: McGuffey-Aligned Vocabulary for Gundana Yatre

## Context
The current 15 level JSONs have quiz words that are **random and story-disconnected** (ಈಶ್ವರ/Shiva, ಈಟಿ/spear, ಔರಂಗಾಬಾದ್/Maharashtra city, ಐಶಾರಾಮಿ/luxury, ಏಟು/beating, ದುಃಖ/sadness at the triumphant end). The photos show a McGuffey-style phonics book ("Actual Reading") that demonstrates the right approach:

- **Each lesson** introduces a sound + 3-5 words that prominently feature it
- **Words appear in the story scene itself** — the child just saw it happen, quiz reinforces it
- **Cumulative sentences** build from previously-learned words only (Lesson 3: "Max sat." Lesson 5: "Was Max sad? Max was sad.")
- **Q&A sentence pairs** are the payoff format — question then answer using exact same words
- **Nothing random** — every word earns its place through story + frequency + phonics

The ShaaleV2 curriculum (sentence-first McGuffey approach) provides the frequency/difficulty ranking to pick the RIGHT words. Key insight from ShaaleV2: ಬಾ, ಇಲ್ಲಿ, ನೋಡು, ಅಮ್ಮ, ಅಪ್ಪ, ಎಲ್ಲಿ, ಏನು are the highest-frequency words and should anchor early levels.

---

## What Changes

### Files to update
All 15 JSON files: `src/data/journey/levels/1.json` through `15.json`

No new screen types needed — fix the existing `quiz` and `image-question-quiz` screens:
- Bad: "What does ಈಶ್ವರ mean?" (random word, no story connection)
- Good: "Gunda pointed at the egg. What does 'ಇದು ಗುಬ್ಬಿ!' mean?" (sentence with story + new word)

### Sentence Quiz Format (reuse existing quiz type)
Each level gets at least one sentence-context quiz:
```json
{
  "type": "quiz",
  "content": {
    "question": "Gunda called to the monkey: '_____ ಬಾ!' (Come _____!) What word fits?",
    "options": ["ಇಲ್ಲಿ", "ಆನೆ", "ಅಮ್ಮ", "ಆಡು"],
    "correct_answer": "ಇಲ್ಲಿ"
  }
}
```

---

## The 15-Level Word Plan

### Rule for every level:
1. Target words must **start with or prominently sound like** the level's vowel
2. Target words must **appear in the video scene** — scene is rewritten to use them
3. Sentences use **only words from current + previous levels**
4. Remove any word that fails checks 1 or 2

---

### L1 (ಅ) — Goodbye Scene
**Keep as-is** — already story-connected and high-frequency.
- Words: ಅಮ್ಮ, ಅಪ್ಪ, ಅಜ್ಜಿ, ಅಣ್ಣ, ಅಕ್ಕ
- No sentence yet (first lesson — just word recognition)

---

### L2 (ಆ) — The Aane Lets Him Through
**Fix:** Remove ಆಕಳಿಸು (yawn — disconnected). Add ಆಡು (goat — forest animal Gunda sees after the elephant).
- **Words: ಆನೆ, ಆಡು, ಆಕಾಶ**
- Scene update: Gunda looks up at the sky (ಆಕಾಶ) after the Aane steps aside. A goat (ಆಡು) trots past from the forest.
- **Sentence quiz:** "ಆನೆ ಇಲ್ಲಿ!" — What does this mean? [The elephant is here / Elephant go away / Big elephant / Where is elephant]
- Image quiz: Which image shows an ಆನೆ? (keep existing)

---

### L3 (ಇ) — The Map Thief / Egg Begins Cracking
**Rewrite entirely.** Current words (ಇವತ್ತು/today, ಇಲಿ/mouse, ಇದೆ/exists) are disconnected from the scene.
- **Words: ಇಲ್ಲಿ, ಇದು, ಇಡ್ಲಿ**
- Scene update: Gunda pulls ಇಡ್ಲಿ (idli) from his bag to lure the monkey down. He points and says "ಇಲ್ಲಿ ಬಾ!" The monkey comes for the idli — drops the map. Egg crackles.
- **Word quiz:** "What does 'ಇಲ್ಲಿ' mean?" [Here / There / Come / Go]
- **Sentence quiz:** "Gunda shouted: '_____ ಬಾ!' Fill the blank." [ಇಲ್ಲಿ / ಆನೆ / ಇಡ್ಲಿ / ಅಮ್ಮ]  ✓ ಇಲ್ಲಿ
- **Sentence quiz:** "'ಇದು ಗುಬ್ಬಿ!' — What does this mean?" [This is Gubbi / Where is Gubbi / Gubbi come here / Big Gubbi]

---

### L4 (ಈ) — Night in the Forest / Baby Deer
**Rewrite entirely.** Remove ಈಶ್ವರ (Shiva — wrong context) and ಈಟಿ (spear — wrong everything).
- **Words: ಈಗ, ಈಜು, ಈ ದಾರಿ**
- Scene update: Baby deer wades through a small stream (ಈಜು). Gunda says "ಈಗ ಇಲ್ಲಿ ಬಾ!" The deer shows him the path (ಈ ದಾರಿ).
- **Word quiz:** "The deer crossed water. What is ಈಜು?" [Swim / Run / Fly / Eat]
- **Sentence quiz:** "'ಈಗ ಇಲ್ಲಿ ಬಾ!' — Gunda calls the deer. What does it mean?" [Come here now / Go away now / Where is it now / Now is here]

---

### L5 (ಉ) — Gubbi's First Night
**Fix:** Remove ಉಂಗುರ (ring — story-disconnected).
- **Words: ಉಸಿರು, ಉಡುಪು, ಉಂಟು**
- Scene update: Gunda tucks Gubbi inside his ಉಡುಪು (clothing/kurta). He listens to her ಉಸಿರು (breath). She is alive — ಉಂಟು (she exists / is there).
- **Word quiz:** "What is ಉಸಿರು?" [Breath / Food / Sleep / Rain]
- **Sentence quiz:** "'ಗುಬ್ಬಿ ಇಲ್ಲಿ ಉಂಟು!' — What does this mean?" [Gubbi is here / Where is Gubbi / Gubbi come here / Gubbi is not here]
- **Sentence quiz:** "What does 'ಉಡುಪು' mean?" [Clothes / Food / Bird / Breath]

---

### L6 (ಊ) — Bekku Appears
**Rewrite.** Remove ಊದುಗಡ್ಡಿ (incense sticks — completely random) and ಊಸರವಳ್ಳಿ (vine plant — obscure).
- **Words: ಊಟ, ಊರು, ಊಳ**
- Scene update: As Bekku watches, Gunda realizes he is hungry — needs ಊಟ (food/meal). He thinks of Ajji's ಊರು (village). From the forest, a wild animal's ಊಳ (howl/cry) echoes.
- **Word quiz:** "What is ಊಟ?" [Food/Meal / Water / Sleep / House]
- **Sentence quiz:** "'ನನಗೆ ಊಟ ಬೇಕು!' — What is Gunda saying?" [I want food / I want water / Give me Gubbi / Gubbi is here]
- Image quiz: Which image shows ಊಟ? (meal vs other options)

---

### L7 (ಋ) — Shelter from the Rain
**Keep structure, improve context.** ಋ has few common words — lean into it.
- **Words: ಋತು, ಋಷಿ**
- Scene update: Gunda says "ಮಳೆ ಋತು!" (Rainy season!) as rain falls. He thinks of the ಋಷಿ (sage) who once sheltered here — there are ancient markings on a rock.
- **Word quiz:** "What is ಋತು?" [Season / Mountain / Leaf / Rain]
- **Sentence quiz:** "'ಮಳೆ ಋತು ಇಲ್ಲಿ!' — What does this say?" [Rainy season is here / Come in the rain / Rain is food / Rainy mountain]
- Note: ಋ is rare — this level may only have 2 target words, which is fine. Fewer, better.

---

### L8 (ಎ) — The Lake Mirror
**Fix:** Remove ಎಂಟು (eight — random number). Add ಎಲ್ಲಿ (where — highest priority! ShaaleV2 L3).
- **Words: ಎಲ್ಲಿ, ಎರಡು, ಎಲೆ**
- Scene update: Gubbi tilts her head at the reflection. Gunda says "ಗುಬ್ಬಿ ಎಲ್ಲಿ?" She looks around confused — there are ಎರಡು (two) Gubbis! He picks up an ಎಲೆ (leaf) and shows her the difference.
- **FIRST Q&A SENTENCE PAIR:**
  - Quiz: "'ಅಮ್ಮ ಎಲ್ಲಿ?' — what kind of sentence is this?" [A question / A command / A statement]  ✓ A question
  - Quiz: "'ಅಮ್ಮ ಇಲ್ಲಿ!' is the answer to what question?" [ಅಮ್ಮ ಎಲ್ಲಿ? / ಅಮ್ಮ ಏನು? / ಅಮ್ಮ ಈಗ? / ಅಮ್ಮ ಆನೆ?]  ✓ ಅಮ್ಮ ಎಲ್ಲಿ?

---

### L9 (ಏ) — Aame's Riddle
**Fix:** Remove ಏಟು (beating — in a children's app??). Add ಏನು (what — ShaaleV2 L5 highest priority).
- **Words: ಏನು, ಏಳು, ಏಡಿ**
- Scene update: Aame's riddle opens with "ಅದು ಏನು?" (What is that?) Gunda spots an ಏಡಿ (crab) in the stream while thinking. He counts to ಏಳು (seven) seconds before answering — Aame's rule.
- **Q&A PAIR (McGuffey payoff format):**
  - Quiz: "'ಅದು ಏನು?' — Fill in the answer: 'ಅದು _____!'" [ಆನೆ / ಎಲ್ಲಿ / ಈಗ / ಊಟ]  ✓ ಆನೆ
  - Quiz: "What is ಏಡಿ?" [Crab / Frog / Fish / Turtle]
  - Quiz: "Aame asked ಏಳು questions. What number is ಏಳು?" [7 / 5 / 3 / 9]

---

### L10 (ಐ) — Blue Wings / The Farm
**Rewrite entirely.** Remove ಐಶಾರಾಮಿ (luxury — wrong level, wrong frequency), ಐವತ್ತು (50), ಐನೂರು (500).
- **Words: ಐದು, ಐರಾವತ**
- Scene update: Gunda counts ಐದು (five) farm animals that bow to Gubbi. Gubbi's wings turn the same blue as ಐರಾವತ (Indra's mythical elephant — the story of which Ajji once told Gunda connects back to the Aane from L2).
- **Quiz:** "Gunda counted the animals. What is ಐದು?" [Five / Two / Ten / Seven]
- **Sentence quiz:** "'ಐದು ಆಡು! ಐದು ಹಸು!' — How many animals total?" [Ten / Five / Two / Seven]

---

### L11 (ಒ) — The Fall / Bekku Saves Gubbi
**Fix:** Remove ಒಬ್ಬಟ್ಟು (holige sweet — random food item). Add ಒಳ್ಳೆ.
- **Words: ಒಟ್ಟಿಗೆ, ಒಳ್ಳೆ, ಒಂದು, ಒಳಗೆ**
- Scene update: Bekku catches Gubbi. Gunda says "ಒಳ್ಳೆ Bekku!" They walk ಒಟ್ಟಿಗೆ (together) for a moment before Bekku slips back ಒಳಗೆ (inside) the forest. ಒಂದು (one) paw print left in the mud.
- **Sentence quiz:** "'ಒಟ್ಟಿಗೆ ಬಾ!' — What is Gunda saying?" [Come together / Go alone / Come inside / One comes]
- **Sentence quiz:** "'ಒಳ್ಳೆ ಗುಬ್ಬಿ!' — What does this mean?" [Good Gubbi / Where is Gubbi / Gubbi inside / One Gubbi]

---

### L12 (ಓ) — Monkey King's Test
**Fix:** Remove ಓಂಕಾರ (religious chant — wrong context for beginners), ಓಡಿದನು (archaic conjugation).
- **Words: ಹೋಗು, ಬಾ, ನೋಡು, ಕೊಡು, ಓಡು** (ಓ vowel in ಹೋಗು, ನೋಡು; ಓಡು = run, pure ಓ word)
- Scene update: The Monkey King barks: "ಓಡು! ಹೋಗು! ಬಾ! ನೋಡು! ಕೊಡು!" Gubbi performs each one perfectly. This level teaches the 5 core action verbs.
- **THE VERB COMMANDS QUIZ — McGuffey sentence drill:**
  - Quiz: "Monkey King shouted 'ಓಡು!' — what did he tell Gunda?" [Run / Come / Look / Give]
  - Quiz: "Match: ಹೋಗು = ? and ಬಾ = ?" [Go / Come] (keep current image-answer style works great here)
  - Quiz: "'ನೋಡು! ಆನೆ ಇಲ್ಲಿ!' — What does this say?" [Look! Elephant is here! / Go! Elephant! / Come elephant! / Big elephant here!]

---

### L13 (ಔ) — The Last Camp
**Fix:** Remove ಔರಂಗಾಬಾದ್ (a city in Maharashtra! not even in Karnataka! completely wrong).
- **Words: ಔಷಧಿ, ಔತಣ**
- Scene update: Gunda has a small ಔತಣ (feast/meal) from his last packed food. His leg hurts from climbing — he wishes he had ಔಷಧಿ (medicine). Gubbi eats crumbs from his hand.
- **Word quiz:** "What is ಔಷಧಿ?" [Medicine / Food / Feast / Clothes]
- **Sentence quiz:** "'ಔತಣ ಒಳ್ಳೆ!' — What does Gunda mean?" [The feast is good / The feast is gone / Go to the feast / One feast here]

---

### L14 (ಅಂ) — Almost / Meeting Arjun
**Keep mostly, but add a sentence screen.** Current words (ಅಂಗಡಿ, ಅಂಬರ, ಅಂಗಳ) are decent and story-connected.
- **Words: ಅಂಗಳ, ಅಂಬರ, ಅಂಗಡಿ** (keep)
- Scene update: From here they can see the open ಅಂಬರ (sky) clearly. Ajji's ಅಂಗಳ (courtyard) is just ahead. Gunda remembers the ಅಂಗಡಿ (shop) near Ajji's where he'll buy her sweets.
- Add sentence quiz: "'ಅಂಗಳ ಎಲ್ಲಿ?' — What is Gunda asking?" [Where is the courtyard? / What is the courtyard? / Come to the courtyard! / The courtyard is here!]

---

### L15 (ಅಃ) — Gubbi Sings / Summit / Finale
**Fix:** Remove ದುಃಖ (sadness — completely wrong for the triumphant final level!).
- **Words: ನಮಃ, ಪ್ರಃ**
- Scene update: The Karadi bear steps out. Gunda bows — "ನಮಃ!" (Salutation!) The bear looks at him, then walks back into the mountain. Gubbi takes flight. The Visarga (ಃ) is the breath of the mountain.
- **Final sentence (cumulative — uses words from L1, L3, L8, L9, L12):**
  - Quiz: "'ನಮಃ! ಗುಬ್ಬಿ ಹಾರಿದ! ಅಜ್ಜಿ ಇಲ್ಲಿ ಉಂಟು!' — What is the happy news?" [Gubbi flew and Ajji is here / Go to Ajji / Where is Gubbi / The journey is sad]  ✓ first option

---

## Video Scene Updates (minor)

For each level where words changed, the video description text should be updated to **show the word being used in the scene** before the quiz tests it. Key changes:

| Level | Add to video description |
|-------|--------------------------|
| L2 | Gunda looks up at the ಆಕಾಶ; a ಆಡು trots past |
| L3 | Gunda holds out ಇಡ್ಲಿ and says "ಇಲ್ಲಿ ಬಾ!" |
| L4 | Deer wades through stream (ಈಜು); shows ಈ ದಾರಿ |
| L5 | Gubbi tucked in ಉಡುಪು; Gunda listens to her ಉಸಿರು |
| L6 | Gunda's stomach growls — needs ಊಟ; thinks of ಊರು |
| L8 | Gubbi asks "ಎಲ್ಲಿ?" looking at reflection |
| L9 | Aame asks "ಅದು ಏನು?" to open the riddle |
| L12 | Monkey King shouts all 5 verbs: ಓಡು! ಹೋಗು! ಬಾ! ನೋಡು! ಕೊಡು! |
| L13 | Replace ಔರಂಗಾಬಾದ್ scene with camp meal (ಔತಣ) |
| L15 | Gunda says "ನಮಃ!" to the Karadi bear |

---

## Cumulative Sentence Build (across all 15 levels)

This is the McGuffey payoff — by L15 the child can read:

> **"ಅಮ್ಮ, ಇಲ್ಲಿ ಬಾ! ಅದು ಏನು? ಅದು ಆನೆ! ಈಗ ಊಟ ಬೇಕು. ಗುಬ್ಬಿ ಒಳ್ಳೆ. ನಮಃ!"**
> *(Amma, come here! What is that? That is an elephant! I want food now. Gubbi is good. Salutations!)*

Every word in that sentence is introduced in levels 1–15 in order. **That's the McGuffey principle in Kannada.**

---

## Files to Modify

- `src/data/journey/levels/2.json` — Fix words, add sentence quiz
- `src/data/journey/levels/3.json` — Full rewrite of quizzes
- `src/data/journey/levels/4.json` — Remove ಈಶ್ವರ/ಈಟಿ, add ಈಗ/ಈಜು/ಈ ದಾರಿ
- `src/data/journey/levels/5.json` — Remove ಉಂಗುರ, add sentence quiz
- `src/data/journey/levels/6.json` — Remove incense/vine plant, add ಊಳ
- `src/data/journey/levels/8.json` — Remove ಎಂಟು, add ಎಲ್ಲಿ, add Q&A pair
- `src/data/journey/levels/9.json` — Remove ಏಟು, add ಏನು, add Q&A pair
- `src/data/journey/levels/10.json` — Remove luxury/50/500, add ಐದು/ಐರಾವತ
- `src/data/journey/levels/11.json` — Remove ಒಬ್ಬಟ್ಟು, add sentence quizzes
- `src/data/journey/levels/12.json` — Remove ಓಂಕಾರ/ಓಡಿದನು, add verb drill
- `src/data/journey/levels/13.json` — Remove ಔರಂಗಾಬಾದ್, rewrite all quizzes
- `src/data/journey/levels/15.json` — Remove ದುಃಖ, add ನಮಃ/ಪ್ರಃ, add cumulative sentence
- Video descriptions in ALL levels where words changed

No TypeScript changes needed. No new screen types needed.

---

## Verification

1. Read through each level sequentially — every quiz word should appear in the video description above it
2. Check that every sentence quiz uses ONLY words from current level or earlier
3. Confirm no inappropriate words remain: ಈಶ್ವರ, ಈಟಿ, ಏಟು, ಔರಂಗಾಬಾದ್, ಐಶಾರಾಮಿ, ಐವತ್ತು, ಐನೂರು, ಓಂಕಾರ, ದುಃಖ (in L15), ಉಂಗುರ, ಊದುಗಡ್ಡಿ, ಊಸರವಳ್ಳಿ, ಒಬ್ಬಟ್ಟು
4. The cumulative sentence at L15 finish screen should be readable using all learned words
