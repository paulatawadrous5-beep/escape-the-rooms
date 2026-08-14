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
});
