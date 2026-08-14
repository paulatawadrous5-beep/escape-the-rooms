import type { ThemeKey } from "@shared/game";

export type PuzzleDefinition = {
  id: string;
  title: string;
  kind: "sequence" | "symbols" | "cooperative" | "inventory" | "observation";
  description: string;
  objectId: string;
  reward: number;
  clue: string;
  hint: string;
  solution: string;
  requiresBoth?: boolean;
};

export type RoomDefinition = {
  key: ThemeKey;
  name: string;
  subtitle: string;
  timeLimit: number;
  hints: string[];
  puzzles: PuzzleDefinition[];
};

export const ROOM_DEFINITIONS: RoomDefinition[] = [
  {
    key: "temple",
    name: "Ancient Temple",
    subtitle: "The sun remembers every footprint.",
    timeLimit: 420,
    hints: ["Read the torch shadows from left to right.", "The three carved animals point to a repeating rhythm.", "Both pressure plates must be held while the relic turns."],
    puzzles: [
      { id: "torch-sequence", title: "Torch Sequence", kind: "sequence", description: "The braziers flare in a pattern reflected by the wall glyphs.", objectId: "braziers", reward: 140, clue: "A faint cyan line links the second, fourth, and first flames.", hint: "Try the sequence 241.", solution: "241" },
      { id: "sun-glyphs", title: "Sun Glyphs", kind: "symbols", description: "Rotate the glyphs until the rising sun faces the hidden crack.", objectId: "glyph-wall", reward: 160, clue: "The smallest crescent is always the beginning.", hint: "Set the symbols to crescent, eye, sun.", solution: "crescent-eye-sun" },
      { id: "relic-plates", title: "Relic Plates", kind: "cooperative", description: "Two plates hum beneath the floor. Coordinate your timing.", objectId: "pressure-plates", reward: 190, clue: "The relic only accepts a shared touch.", hint: "Both players must activate their plate within the same moment.", solution: "both", requiresBoth: true },
    ],
  },
  {
    key: "station",
    name: "Space Station",
    subtitle: "Orbit decays. The escape pod does not wait.",
    timeLimit: 390,
    hints: ["The maintenance labels form a star map.", "Power must flow through matching colors.", "One player sees the reactor frequency; the other sees the keypad."],
    puzzles: [
      { id: "star-map", title: "Star Map", kind: "observation", description: "Trace the constellation hidden among the maintenance lights.", objectId: "star-map", reward: 170, clue: "Three stars blink in a triangular cadence.", hint: "Connect blue, pink, blue, cyan.", solution: "blue-pink-blue-cyan" },
      { id: "power-routing", title: "Power Routing", kind: "symbols", description: "Route energy through the matching cyan and magenta conduits.", objectId: "reactor", reward: 190, clue: "The reactor rejects any path that crosses a dead channel.", hint: "Use the path cyan-magenta-cyan.", solution: "cyan-magenta-cyan" },
      { id: "pod-frequency", title: "Escape Pod Frequency", kind: "cooperative", description: "One console reveals the frequency while the other accepts it.", objectId: "escape-pod", reward: 220, clue: "Player one receives the first half; player two receives the second.", hint: "Combine 73 with 19.", solution: "7319", requiresBoth: true },
    ],
  },
  {
    key: "mansion",
    name: "Haunted Mansion",
    subtitle: "The house is listening through the walls.",
    timeLimit: 360,
    hints: ["The portraits are arranged by the age of their frames.", "A bell rings only when the unseen guest is named.", "The séance circle needs an object from each side of the house."],
    puzzles: [
      { id: "portrait-order", title: "Portrait Order", kind: "sequence", description: "Arrange the portraits by the age of their frames, not their faces.", objectId: "portraits", reward: 190, clue: "Dust is thickest on the oldest frame.", hint: "Order raven, widow, child, clockmaker.", solution: "raven-widow-child-clockmaker" },
      { id: "bell-name", title: "Bell Name", kind: "observation", description: "The parlor bell responds to the name hidden in the wallpaper.", objectId: "bell", reward: 200, clue: "Count the pink roses between each tear in the paper.", hint: "The name is ECHO.", solution: "echo" },
      { id: "seance-circle", title: "Séance Circle", kind: "inventory", description: "Place the silver key and black candle into the circle together.", objectId: "seance", reward: 230, clue: "The circle is incomplete on both sides.", hint: "Use the silver key and black candle.", solution: "silver-key+black-candle", requiresBoth: true },
    ],
  },
  {
    key: "lab",
    name: "Underwater Lab",
    subtitle: "Pressure rises with every unanswered question.",
    timeLimit: 330,
    hints: ["The specimen tanks pulse in prime numbers.", "The pressure valve must be balanced before the hatch opens.", "The final seal needs two hands and the lab's last sample."],
    puzzles: [
      { id: "specimen-primes", title: "Specimen Primes", kind: "sequence", description: "The tanks pulse in a prime-number sequence.", objectId: "specimen-tanks", reward: 210, clue: "The next pulse is the smallest prime after seven.", hint: "Enter 11-13-17.", solution: "11-13-17" },
      { id: "pressure-valve", title: "Pressure Valve", kind: "symbols", description: "Balance the three pressure gauges without crossing the red line.", objectId: "pressure-valve", reward: 220, clue: "Cyan must be highest, pink must be lowest.", hint: "Set the levels to 3-2-1.", solution: "3-2-1" },
      { id: "hatch-seal", title: "Hatch Seal", kind: "cooperative", description: "The escape hatch recognizes two synchronized hands and a sample.", objectId: "hatch", reward: 280, clue: "The lab's final sample belongs in the center before both hands turn.", hint: "Both players submit while holding the prism sample.", solution: "both+prism-sample", requiresBoth: true },
    ],
  },
];

export function getRoomDefinition(index: number) {
  return ROOM_DEFINITIONS[index];
}
