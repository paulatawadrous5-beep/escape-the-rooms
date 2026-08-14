# Game Plan: ESCAPE: THE ROOMS

## Risk Tasks

### 1. Authoritative real-time multiplayer state
- **Why isolated:** Two browsers must receive the same room, puzzle, timer, inventory, progression, and score state while actions are validated on the server and reconnects restore the same session.
- **Approach:** Use a single Socket.io server attached to the existing Express HTTP server. Keep active room sessions in a server-side room registry keyed by an unguessable room code, persist snapshots through the server's session layer where appropriate, validate every action against the authoritative state, and emit a sanitized snapshot after each accepted action. Use stable player tokens in reconnect links/local storage so a brief disconnect can reclaim the same seat.
- **Verify:** Two independent browser sessions create/join one room, observe identical state after every action, receive the same timer updates, reject a third player, and restore the same scores, inventory, puzzle progress, and room after one client disconnects and reconnects.

### 2. Countdown and expiry consistency
- **Why isolated:** A timer must not be controlled by either browser and must apply expiry penalties to both players exactly once.
- **Approach:** Store a server timestamp for room start and derive remaining time from server time. Guard expiry with an idempotent room transition so late actions or duplicate events cannot apply multiple penalties.
- **Verify:** Artificially shorten a test timer, allow it to expire, and confirm both players receive one penalty, the room locks, and progression cannot occur from stale client actions.

### 3. Cooperative puzzle gating
- **Why isolated:** Several puzzles intentionally require information or actions from both players, so client-only checks could allow inconsistent or premature escapes.
- **Approach:** Define each room as data-driven puzzle nodes with explicit prerequisites, per-player observations, shared inventory requirements, and server-evaluated completion conditions. Keep UI presentation separate from puzzle rules.
- **Verify:** Individual puzzles can be completed by one player, cooperative puzzles remain incomplete until both required contributions exist, and the locked door opens only after all room requirements are satisfied.

## Main Build

The game includes a landing page, private lobby, invite link/code join flow, four sequential escape rooms named Ancient Temple, Space Station, Haunted Mansion, and Underwater Lab, a final scoreboard, and replay/new-game controls. Each room contains distinct interactive objects, hidden clues, pattern or sequence logic, combination locks, shared and personal inventory items, optional hints, and a locked-door escape goal.

The UI uses a deep-black cyberpunk HUD with electric cyan and neon pink accents, geometric sans-serif typography, glow effects, bracketed panels, animated scanlines, distinct room atmospheres, accessible controls, responsive desktop layout, and clear synchronization/reconnection feedback. Audio is treated as progressive enhancement because browsers require a user gesture before autoplay; the game remains fully playable without sound.

**Assets needed:** One generated cyberpunk visual-direction reference, compact generated room backdrop/texture assets for four themes, and lightweight UI accent assets where they materially improve the atmosphere. Large files remain outside the project tree and are referenced through managed storage URLs.

## Verification

- Create a private room and copy a shareable invite URL.
- Join from a second browser session using both the invite URL and manual room code.
- Confirm exactly two seats are available and a third connection is rejected.
- Confirm every action updates both clients without manual refresh.
- Confirm individual points increase for actions and puzzle completion, hints deduct only from the requester, and expiry penalties apply to both players.
- Complete all four rooms in sequence and verify final scores, total time, rooms completed, awards, replay, and new-game flows.
- Disconnect and reconnect one player during a room; verify full state restoration.
- Verify keyboard focus, readable contrast, responsive layout, and no browser console errors.
- Verify the cyberpunk visual direction, room differentiation, and absence of placeholder UI in screenshots.
