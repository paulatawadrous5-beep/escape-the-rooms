export type ThemeKey = "temple" | "station" | "mansion" | "lab";

export type PlayerSlot = "player1" | "player2";

export type PlayerState = {
  slot: PlayerSlot;
  name: string;
  connected: boolean;
  score: number;
  clues: number;
  actions: number;
  hintsUsed: number;
  roomTimes: number[];
  inventory: string[];
  lastActionAt: number;
};

export type PuzzleState = {
  solved: boolean;
  progress: Record<string, string | number | boolean>;
  attempts: number;
};

export type RoomState = {
  index: number;
  key: ThemeKey;
  name: string;
  subtitle: string;
  startedAt: number;
  timeLimit: number;
  remainingSeconds: number;
  hintsRemaining: number;
  completed: boolean;
  expired: boolean;
  puzzleStates: Record<string, PuzzleState>;
  discoveredClues: string[];
  sharedInventory: string[];
};

export type ResultsState = {
  totalTime: number;
  roomsCompleted: number;
  awards: Record<string, PlayerSlot>;
};

export type PublicGameState = {
  roomCode: string;
  phase: "lobby" | "playing" | "results";
  host: PlayerSlot;
  players: Partial<Record<PlayerSlot, PlayerState>>;
  room?: RoomState;
  results?: ResultsState;
  startedAt?: number;
};

export type ClientAction =
  | { type: "start_game" }
  | { type: "inspect"; objectId: string }
  | { type: "submit_sequence"; puzzleId: string; value: string }
  | { type: "toggle_symbol"; puzzleId: string; value: string }
  | { type: "place_item"; puzzleId: string; item: string }
  | { type: "use_hint" }
  | { type: "escape_room" }
  | { type: "replay" };

export type ServerEvent =
  | { type: "state"; state: PublicGameState }
  | { type: "error"; message: string }
  | { type: "welcome"; slot: PlayerSlot; token: string; roomCode: string };

export const ROOM_NAMES: Record<ThemeKey, string> = {
  temple: "Ancient Temple",
  station: "Space Station",
  mansion: "Haunted Mansion",
  lab: "Underwater Lab",
};
