# Project TODO

- [ ] Establish the shared authoritative game-state model for exactly two players and four sequential rooms
- [ ] Implement private room creation with unique room code and shareable invite link
- [ ] Implement join flow by room code or invite link
- [ ] Add Socket.io real-time synchronization across separate networks
- [ ] Add authoritative server validation for actions, puzzle progress, room progression, timers, hints, inventory, and scores
- [ ] Build the cyberpunk landing page and room lobby experience
- [ ] Build the Ancient Temple room with distinct cooperative and individual puzzles
- [ ] Build the Space Station room with distinct cooperative and individual puzzles
- [ ] Build the Haunted Mansion room with distinct cooperative and individual puzzles
- [ ] Build the Underwater Lab room with distinct cooperative and individual puzzles
- [ ] Add interactive objects, clues, combination locks, and shared inventory mechanics
- [ ] Add per-player action tracking and individual scoring
- [ ] Add limited per-room hint pools with requester-only score deductions
- [ ] Add global per-room countdown timers and both-player expiry penalties
- [ ] Add disconnect/reconnect handling with complete state restoration
- [ ] Add final results screen with individual scores, total time, rooms completed, and awards
- [ ] Add replay and new-game flows
- [ ] Add cyberpunk HUD styling, neon pink/cyan glow effects, animations, and responsive desktop layout
- [ ] Add generated visual art assets and integrate them without storing large files in the project tree
- [ ] Add server and client Vitest coverage for room lifecycle, scoring, hints, timers, progression, and reconnection state
- [ ] Verify the full flow with two separate browser sessions
- [ ] Save the completed project checkpoint and provide the public publishing handoff

## Historical requests

- [ ] User requested a real publicly accessible multiplayer deployment rather than localhost or simulated multiplayer
- [ ] User specified exact room names: Ancient Temple, Space Station, Haunted Mansion, Underwater Lab
- [ ] User specified requester-only hint deductions and both-player timer-expiry penalties
- [ ] User specified complete state restoration after brief disconnection

## Free deployment redesign

- [ ] Replace the paid persistent Socket.io hosting assumption with a genuinely free browser-to-browser WebRTC transport and free signaling path
- [ ] Keep the public frontend deployable without a credit card or subscription
- [ ] Preserve two-player room codes/invite links, synchronized authoritative state, scoring, timers, hints, and room progression over the free transport
- [ ] Document the free architecture's reconnect and host-disconnect behavior honestly and verify it in two browser sessions
- [ ] Verify the final public URL path does not require paid hosting or billing

## GitHub Pages deployment request

- [ ] Prepare the production frontend for GitHub Pages static hosting with no paid services
- [ ] Add repository deployment documentation and a GitHub Pages workflow/configuration
- [ ] Export or connect the repository through the GitHub integration when available
- [ ] Verify the public GitHub Pages URL and cross-network two-player flow
