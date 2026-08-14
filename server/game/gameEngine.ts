import { randomBytes } from "node:crypto";
import type { ClientAction, PlayerSlot, PlayerState, PublicGameState, RoomState, ResultsState } from "@shared/game";
import { getRoomDefinition, ROOM_DEFINITIONS, type PuzzleDefinition } from "./roomDefinitions";

export type InternalPlayer = PlayerState & { token: string; socketId?: string; disconnectedAt?: number };
export type InternalRoom = {
  code: string;
  phase: PublicGameState["phase"];
  host: PlayerSlot;
  players: Partial<Record<PlayerSlot, InternalPlayer>>;
  room?: RoomState;
  results?: ResultsState;
  startedAt?: number;
  lastActivityAt: number;
};

const rooms = new Map<string, InternalRoom>();
const GRACE_MS = 90_000;
const ROOM_TICK_MS = 1_000;

function code() {
  return randomBytes(4).toString("hex").toUpperCase();
}
function token() {
  return randomBytes(18).toString("base64url");
}
function player(slot: PlayerSlot, name: string): InternalPlayer {
  return { slot, name, connected: true, score: 0, clues: 0, actions: 0, hintsUsed: 0, roomTimes: [], inventory: [], lastActionAt: Date.now(), token: token() };
}
function roomState(index: number, now = Date.now()): RoomState {
  const definition = getRoomDefinition(index)!;
  return {
    index,
    key: definition.key,
    name: definition.name,
    subtitle: definition.subtitle,
    startedAt: now,
    timeLimit: definition.timeLimit,
    remainingSeconds: definition.timeLimit,
    hintsRemaining: definition.hints.length,
    completed: false,
    expired: false,
    puzzleStates: Object.fromEntries(definition.puzzles.map(p => [p.id, { solved: false, progress: {}, attempts: 0 }])),
    discoveredClues: [],
    sharedInventory: [],
  };
}
function publicPlayer(p?: InternalPlayer): PlayerState | undefined {
  if (!p) return undefined;
  const { token: _token, socketId: _socketId, disconnectedAt: _disconnectedAt, ...safe } = p;
  return safe;
}
export function publicState(game: InternalRoom): PublicGameState {
  return {
    roomCode: game.code,
    phase: game.phase,
    host: game.host,
    players: { player1: publicPlayer(game.players.player1), player2: publicPlayer(game.players.player2) },
    room: game.room,
    results: game.results,
    startedAt: game.startedAt,
  };
}
export function getRoom(codeValue: string) { return rooms.get(codeValue.toUpperCase()); }
export function createRoom(hostName = "PLAYER 1") {
  let roomCode = code();
  while (rooms.has(roomCode)) roomCode = code();
  const game: InternalRoom = { code: roomCode, phase: "lobby", host: "player1", players: { player1: player("player1", hostName.slice(0, 18) || "PLAYER 1") }, lastActivityAt: Date.now() };
  rooms.set(roomCode, game);
  return { game, slot: "player1" as const, token: game.players.player1!.token };
}
export function joinRoom(roomCode: string, name = "PLAYER 2") {
  const game = rooms.get(roomCode.toUpperCase());
  if (!game) throw new Error("ROOM_NOT_FOUND");
  if (game.players.player2 && game.players.player2.connected) throw new Error("ROOM_FULL");
  const existing = game.players.player2;
  const p = existing ?? player("player2", name.slice(0, 18) || "PLAYER 2");
  p.connected = true;
  p.name = existing?.name || name.slice(0, 18) || "PLAYER 2";
  p.disconnectedAt = undefined;
  game.players.player2 = p;
  game.lastActivityAt = Date.now();
  return { game, slot: "player2" as const, token: p.token };
}
export function reconnectRoom(roomCode: string, reconnectToken: string, socketId: string) {
  const game = rooms.get(roomCode.toUpperCase());
  if (!game) throw new Error("ROOM_NOT_FOUND");
  const found = (Object.values(game.players) as (InternalPlayer | undefined)[]).find(p => p?.token === reconnectToken);
  if (!found) throw new Error("INVALID_RECONNECT_TOKEN");
  found.connected = true;
  found.socketId = socketId;
  found.disconnectedAt = undefined;
  return { game, slot: found.slot, token: found.token };
}
export function bindSocket(game: InternalRoom, slot: PlayerSlot, socketId: string) {
  const p = game.players[slot];
  if (p) { p.socketId = socketId; p.connected = true; p.disconnectedAt = undefined; }
}
export function disconnectSocket(game: InternalRoom, socketId: string) {
  const p = (Object.values(game.players) as (InternalPlayer | undefined)[]).find(x => x?.socketId === socketId);
  if (p) { p.connected = false; p.socketId = undefined; p.disconnectedAt = Date.now(); }
}
export function startGame(game: InternalRoom) {
  if (!game.players.player1 || !game.players.player2) throw new Error("WAITING_FOR_PLAYER");
  if (game.phase === "lobby") { game.phase = "playing"; game.startedAt = Date.now(); game.room = roomState(0); }
}
function currentPuzzle(game: InternalRoom, puzzleId: string): PuzzleDefinition {
  const definition = getRoomDefinition(game.room!.index)!;
  const puzzle = definition.puzzles.find(p => p.id === puzzleId);
  if (!puzzle) throw new Error("PUZZLE_NOT_FOUND");
  return puzzle;
}
function award(game: InternalRoom, slot: PlayerSlot, points: number) {
  const p = game.players[slot];
  if (p) { p.score = Math.max(0, p.score + points); p.actions += 1; p.lastActionAt = Date.now(); }
}
function completePuzzle(game: InternalRoom, slot: PlayerSlot, puzzle: PuzzleDefinition) {
  const state = game.room!.puzzleStates[puzzle.id]!;
  if (state.solved) return;
  state.solved = true;
  state.progress.solvedBy = slot;
  award(game, slot, puzzle.reward);
  for (const p of Object.values(game.players)) if (p) p.clues += 1;
  if (!game.room!.discoveredClues.includes(puzzle.id)) game.room!.discoveredClues.push(puzzle.id);
}
function allSolved(game: InternalRoom) { return Object.values(game.room!.puzzleStates).every(p => p.solved); }
export function applyAction(game: InternalRoom, slot: PlayerSlot, action: ClientAction) {
  if (game.phase === "results" && action.type === "replay") {
    game.phase = "playing"; game.results = undefined; game.startedAt = Date.now(); game.room = roomState(0); for (const p of Object.values(game.players)) if (p) { p.score = 0; p.clues = 0; p.actions = 0; p.hintsUsed = 0; p.roomTimes = []; p.inventory = []; }
    return;
  }
  if (action.type === "start_game") { if (slot !== game.host) throw new Error("HOST_ONLY"); startGame(game); return; }
  if (game.phase !== "playing" || !game.room) throw new Error("GAME_NOT_ACTIVE");
  tickRoom(game);
  if (game.room.expired) throw new Error("ROOM_EXPIRED");
  const actor = game.players[slot]!;
  if (action.type === "use_hint") {
    if (game.room.hintsRemaining <= 0) throw new Error("NO_HINTS_LEFT");
    game.room.hintsRemaining -= 1; actor.hintsUsed += 1; actor.score = Math.max(0, actor.score - 60); actor.actions += 1; actor.lastActionAt = Date.now(); return;
  }
  if (action.type === "inspect") {
    if (!game.room.discoveredClues.includes(action.objectId)) game.room.discoveredClues.push(action.objectId);
    actor.clues += 1; award(game, slot, 20); return;
  }
  if (action.type === "toggle_symbol") {
    const puzzle = currentPuzzle(game, action.puzzleId); const state = game.room.puzzleStates[puzzle.id]!; state.attempts += 1; state.progress.value = action.value;
    if (action.value.toLowerCase() === puzzle.solution.toLowerCase()) completePuzzle(game, slot, puzzle); else award(game, slot, -10); return;
  }
  if (action.type === "submit_sequence") {
    const puzzle = currentPuzzle(game, action.puzzleId); const state = game.room.puzzleStates[puzzle.id]!; state.attempts += 1;
    if (puzzle.requiresBoth) {
      state.progress[slot] = true;
      award(game, slot, 35);
      if (game.players.player1 && game.players.player2 && state.progress.player1 && state.progress.player2) completePuzzle(game, slot, puzzle);
    } else {
      state.progress.value = action.value;
      if (action.value.toLowerCase() === puzzle.solution.toLowerCase()) completePuzzle(game, slot, puzzle); else award(game, slot, -10);
    }
    return;
  }
  if (action.type === "place_item") {
    const puzzle = currentPuzzle(game, action.puzzleId); const state = game.room.puzzleStates[puzzle.id]!; state.progress[action.item] = true;
    if (!actor.inventory.includes(action.item)) actor.inventory.push(action.item);
    if (puzzle.solution.toLowerCase().includes(action.item.toLowerCase())) { game.room.sharedInventory.push(action.item); if (puzzle.requiresBoth ? (game.players.player1?.inventory.includes("silver-key") && game.players.player2?.inventory.includes("black-candle")) || game.room.sharedInventory.includes("prism-sample") : true) completePuzzle(game, slot, puzzle); else award(game, slot, 30); }
    return;
  }
  if (action.type === "escape_room") {
    if (!allSolved(game)) throw new Error("PUZZLES_REMAIN");
    const elapsed = Math.max(0, Math.round((Date.now() - game.room.startedAt) / 1000));
    for (const p of Object.values(game.players)) if (p) { p.roomTimes.push(elapsed); p.score += Math.max(0, 120 - Math.floor(elapsed / 10)); }
    if (game.room.index >= ROOM_DEFINITIONS.length - 1) finishGame(game); else { game.room = roomState(game.room.index + 1); }
  }
}
function finishGame(game: InternalRoom) {
  game.phase = "results"; game.room!.completed = true;
  const p1 = game.players.player1!, p2 = game.players.player2!;
  const fastest = p1.roomTimes.reduce((a, b) => a + b, 0) <= p2.roomTimes.reduce((a, b) => a + b, 0) ? "player1" : "player2";
  const detective = p1.clues >= p2.clues ? "player1" : "player2";
  const teammate = p1.actions >= p2.actions ? "player1" : "player2";
  game.results = { totalTime: Math.max(...[p1.roomTimes.reduce((a,b)=>a+b,0), p2.roomTimes.reduce((a,b)=>a+b,0)]), roomsCompleted: ROOM_DEFINITIONS.length, awards: { "THE MAN OF THE ROUND": p1.score >= p2.score ? "player1" : "player2", "Fastest Mind": fastest, "Best Detective": detective, "Best Teammate": teammate } };
}
export function tickRoom(game: InternalRoom) {
  if (game.phase !== "playing" || !game.room || game.room.expired) return;
  const remaining = Math.max(0, game.room.timeLimit - Math.floor((Date.now() - game.room.startedAt) / 1000));
  game.room.remainingSeconds = remaining;
  if (remaining === 0) {
    game.room.expired = true;
    for (const p of Object.values(game.players)) if (p) p.score = Math.max(0, p.score - 100);
  }
}
export function cleanupRooms() {
  const now = Date.now();
  rooms.forEach((game, key) => {
    const disconnected = (Object.values(game.players) as (InternalPlayer | undefined)[]).some(p => p && !p.connected && p.disconnectedAt && now - p.disconnectedAt > GRACE_MS);
    if (now - game.lastActivityAt > 1000 * 60 * 60 || disconnected && !game.players.player1?.connected && !game.players.player2?.connected) rooms.delete(key);
  });
}
setInterval(() => { rooms.forEach(game => tickRoom(game)); cleanupRooms(); }, ROOM_TICK_MS).unref();
