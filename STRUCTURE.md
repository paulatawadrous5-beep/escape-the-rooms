# ESCAPE: THE ROOMS — Structure

## Runtime layers

The browser owns the free WebRTC session through PeerJS Cloud signaling. The host browser is authoritative for room lifecycle, timers, action validation, scoring, and sanitized state broadcasts; the joining browser sends intents and renders host snapshots. Shared TypeScript types define room snapshots, player state, puzzle state, action payloads, and result awards. No paid server or billing account is required.

## Server modules

The legacy server-side engine remains covered for deterministic rule testing, while the free runtime path uses `client/src/game/localEngine.ts` as the host-authoritative engine. `client/src/game/peerTransport.ts` creates the host PeerJS identity, publishes the invite peer ID in the link, connects the guest, relays intents, and broadcasts state snapshots. `server/game/roomDefinitions.ts` remains the canonical content reference. `server/game/gameEngine.test.ts` covers the core deterministic rules, and `client/src/game/localEngine.test.ts` documents the free browser engine behavior.

## Client modules

`client/src/pages/Home.tsx` provides the landing page, lobby, active game shell, and results flow. `client/src/game/localEngine.ts` is the deterministic host-authoritative rules engine. `client/src/game/peerTransport.ts` wraps PeerJS Cloud signaling and the reliable WebRTC data channel. `client/src/components/game/*` remains the extension point for reusable HUD panels, room scenes, object cards, puzzle controls, score rail, timer, and overlays.

## State flow

1. The host creates a room and a PeerJS identity, then receives a short room code and invite URL containing the host peer ID.
2. The second player opens the public link or enters the code/link and connects directly to the host through PeerJS Cloud signaling.
3. The host starts the session after both seats are occupied.
4. The guest sends intent actions over the reliable WebRTC data channel.
5. The host mutates authoritative state, records each contribution, applies score changes, and broadcasts complete snapshots.
6. Both browsers derive the countdown from the authoritative room start timestamp.
7. A brief guest reconnect can rejoin while the host session remains open; a host-disconnect warning is shown because no paid server persists state after the host leaves.
8. Completing the fourth room creates a final results state with individual scores, total elapsed time, completed rooms, and derived awards.

## Visual ownership

React is the picture frame and HUD. Room artwork, background textures, object illustrations, and atmosphere assets are lightweight generated assets stored through managed storage. Core interaction is UI-driven rather than dependent on a heavy 3D scene so that network reliability, puzzle readability, and responsive play remain the priority.
