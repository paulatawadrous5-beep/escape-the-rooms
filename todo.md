# Project TODO

- [x] Establish the shared authoritative game-state model for exactly two players and four sequential rooms
- [x] Implement private room creation with unique room code and shareable invite link
- [x] Implement join flow by room code or invite link
- [x] Replace Socket.io hosting assumption with free PeerJS WebRTC synchronization across separate networks
- [x] Add authoritative host-browser validation for actions, puzzle progress, room progression, timers, hints, inventory, and scores
- [x] Build the cyberpunk landing page and room lobby experience
- [x] Build the Ancient Temple room with distinct cooperative and individual puzzles
- [x] Build the Space Station room with distinct cooperative and individual puzzles
- [x] Build the Haunted Mansion room with distinct cooperative and individual puzzles
- [x] Build the Underwater Lab room with distinct cooperative and individual puzzles
- [x] Add interactive objects, clues, combination locks, and shared inventory mechanics
- [x] Add per-player action tracking and individual scoring
- [x] Add limited per-room hint pools with requester-only score deductions
- [x] Add global per-room countdown timers and both-player expiry penalties
- [x] Add guest disconnect/reconnect handling with host-session state restoration and honest host-disconnect messaging
- [x] Add final results screen with individual scores, total time, rooms completed, and awards
- [x] Add replay and new-game flows
- [x] Add cyberpunk HUD styling, neon pink/cyan glow effects, animations, and responsive desktop layout
- [x] Add generated visual art direction asset reference and integrate it without storing large files in the project tree
- [x] Add server and client Vitest coverage for room lifecycle, scoring, hints, timers, progression, and reconnection state
- [ ] Verify the full flow with two separate browser sessions
- [ ] Save the completed project checkpoint and provide the public publishing handoff

## Historical requests

- [x] User requested a real publicly accessible multiplayer deployment rather than localhost or simulated multiplayer
- [x] User specified exact room names: Ancient Temple, Space Station, Haunted Mansion, Underwater Lab
- [x] User specified requester-only hint deductions and both-player timer-expiry penalties
- [x] User specified complete state restoration after brief disconnection

## Free deployment redesign

- [x] Replace the paid persistent Socket.io hosting assumption with a genuinely free browser-to-browser WebRTC transport and free signaling path
- [x] Keep the public frontend deployable without a credit card or subscription
- [x] Preserve two-player room codes/invite links, synchronized authoritative state, scoring, timers, hints, and room progression over the free transport
- [x] Document the free architecture's reconnect and host-disconnect behavior honestly; two-browser cross-network verification remains pending
- [x] Verify the final public URL path does not require paid hosting or billing

## GitHub Pages deployment request

- [x] Prepare the production frontend for GitHub Pages static hosting with no paid services
- [x] Add repository deployment documentation and a GitHub Pages workflow/configuration
- [x] Export and connect the repository through the GitHub integration
- [ ] Verify the public GitHub Pages URL and cross-network two-player flow

## Verification gap fixes

- [x] Implement real guest reconnection that reuses the existing player2 state after refresh or reconnect
- [x] Integrate the generated visual reference asset into the live landing or room UI
- [x] Configure Vitest to execute client tests and add timer-expiry, four-room progression, replay, and reconnect coverage
- [ ] Re-verify the public URL and two-browser multiplayer flow after these fixes
