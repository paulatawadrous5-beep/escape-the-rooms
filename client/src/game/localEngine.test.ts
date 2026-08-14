import { describe, expect, it } from "vitest";
import { addGuest, applyLocalAction, makeInitialState } from "./localEngine";

describe("free multiplayer game engine", () => {
  it("starts only when two players are present", () => {
    const host = makeInitialState("ABCD1234", "Ada");
    expect(() => applyLocalAction(host, "player1", { type: "start_game" })).toThrow("WAITING_FOR_PLAYER");
    const paired = addGuest(host, "Lin");
    const started = applyLocalAction(paired, "player1", { type: "start_game" });
    expect(started.phase).toBe("playing");
    expect(started.room?.name).toBe("Ancient Temple");
  });

  it("deducts a hint from only the requesting player", () => {
    let state = applyLocalAction(addGuest(makeInitialState("ABCD1234", "Ada"), "Lin"), "player1", { type: "start_game" });
    state = applyLocalAction(state, "player1", { type: "use_hint" });
    expect(state.players.player1?.score).toBe(0);
    expect(state.players.player2?.score).toBe(0);
    expect(state.players.player1?.hintsUsed).toBe(1);
  });

  it("requires both player contributions for a cooperative puzzle", () => {
    let state = applyLocalAction(addGuest(makeInitialState("ABCD1234", "Ada"), "Lin"), "player1", { type: "start_game" });
    state = applyLocalAction(state, "player1", { type: "submit_sequence", puzzleId: "relic-plates", value: "player1" });
    expect(state.room?.puzzleStates["relic-plates"]?.solved).toBe(false);
    state = applyLocalAction(state, "player2", { type: "submit_sequence", puzzleId: "relic-plates", value: "player2" });
    expect(state.room?.puzzleStates["relic-plates"]?.solved).toBe(true);
  });

  it("preserves the existing guest record when reconnecting", () => {
    let state = addGuest(makeInitialState("ABCD1234", "Ada"), "Lin");
    state = applyLocalAction(state, "player1", { type: "start_game" });
    state.players.player2!.score = 345;
    state.players.player2!.inventory = ["prism-sample"];
    state.players.player2!.connected = false;
    const restored = addGuest(state, "Different Name");
    expect(restored.players.player2?.score).toBe(345);
    expect(restored.players.player2?.inventory).toEqual(["prism-sample"]);
    expect(restored.players.player2?.connected).toBe(true);
    expect(restored.players.player2?.name).toBe("Lin");
  });

  it("applies timer expiry penalties to both players", () => {
    let state = applyLocalAction(addGuest(makeInitialState("ABCD1234", "Ada"), "Lin"), "player1", { type: "start_game" });
    state.room!.startedAt = Date.now() - (state.room!.timeLimit + 1) * 1000;
    expect(() => applyLocalAction(state, "player1", { type: "inspect", objectId: "late-clue" })).toThrow("ROOM_EXPIRED");
    expect(state.players.player1?.score).toBe(0);
    expect(state.players.player2?.score).toBe(0);
  });

  it("advances through all four rooms and resets on replay", () => {
    let state = applyLocalAction(addGuest(makeInitialState("ABCD1234", "Ada"), "Lin"), "player1", { type: "start_game" });
    for (let roomIndex = 0; roomIndex < 4; roomIndex += 1) {
      const room = state.room!;
      for (const [id] of Object.entries(room.puzzleStates)) {
        const cooperative = id === "relic-plates" || id === "pod-frequency" || id === "seance-circle" || id === "hatch-seal";
        if (cooperative) {
          state = applyLocalAction(state, "player1", { type: "submit_sequence", puzzleId: id, value: "player1" });
          state = applyLocalAction(state, "player2", { type: "submit_sequence", puzzleId: id, value: "player2" });
        } else {
          const answers: Record<string, string> = { "torch-sequence": "241", "sun-glyphs": "crescent-eye-sun", "star-map": "blue-pink-blue-cyan", "power-routing": "cyan-magenta-cyan", "portrait-order": "raven-widow-child-clockmaker", "bell-name": "echo", "specimen-primes": "11-13-17", "pressure-valve": "3-2-1" };
          state = applyLocalAction(state, "player1", { type: "submit_sequence", puzzleId: id, value: answers[id]! });
        }
        expect(state.room?.puzzleStates[id]?.solved).toBe(true);
      }
      state = applyLocalAction(state, "player1", { type: "escape_room" });
      if (roomIndex < 3) expect(state.room?.index).toBe(roomIndex + 1);
    }
    expect(state.phase).toBe("results");
    state = applyLocalAction(state, "player1", { type: "replay" });
    expect(state.phase).toBe("playing");
    expect(state.room?.index).toBe(0);
    expect(state.players.player1?.score).toBe(0);
  });
});
