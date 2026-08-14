import { describe, expect, it } from "vitest";
import { applyAction, createRoom, joinRoom, publicState } from "./gameEngine";

describe("authoritative escape-room engine", () => {
  it("creates a private two-player room and starts only when paired", () => {
    const created = createRoom("Ada");
    expect(publicState(created.game).phase).toBe("lobby");
    expect(() => applyAction(created.game, "player1", { type: "start_game" })).toThrow("WAITING_FOR_PLAYER");
    joinRoom(created.game.code, "Lin");
    applyAction(created.game, "player1", { type: "start_game" });
    expect(publicState(created.game).room?.name).toBe("Ancient Temple");
  });

  it("deducts a hint only from the requesting player", () => {
    const created = createRoom("Ada"); joinRoom(created.game.code, "Lin"); applyAction(created.game, "player1", { type: "start_game" });
    applyAction(created.game, "player1", { type: "use_hint" });
    expect(created.game.players.player1?.score).toBe(0);
    expect(created.game.players.player2?.score).toBe(0);
    expect(created.game.players.player1?.hintsUsed).toBe(1);
  });

  it("requires both player signals for a cooperative puzzle", () => {
    const created = createRoom("Ada"); joinRoom(created.game.code, "Lin"); applyAction(created.game, "player1", { type: "start_game" });
    applyAction(created.game, "player1", { type: "submit_sequence", puzzleId: "relic-plates", value: "player1" });
    expect(created.game.room?.puzzleStates["relic-plates"]?.solved).toBe(false);
    applyAction(created.game, "player2", { type: "submit_sequence", puzzleId: "relic-plates", value: "player2" });
    expect(created.game.room?.puzzleStates["relic-plates"]?.solved).toBe(true);
  });
});
