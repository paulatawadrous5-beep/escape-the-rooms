# Free Deployment Research

Research checked on 2026-08-14.

## PeerJS Cloud + static hosting

PeerJS's official FAQ states that PeerJS needs a signaling server, that the default PeerJS Cloud server handles signaling for free, and that application data flows directly between browsers unless a TURN relay is needed. The same documentation warns that a small percentage of users behind symmetric NATs cannot connect without TURN, and that PeerServer Cloud runs on port 443. This makes PeerJS a plausible no-billing route for a small two-player game, but it is not a universal guarantee across every network.

Source: https://peerjs.com/client/faq

## Firebase Spark

Firebase's official pricing page states that the no-cost Spark plan requires no payment method. The page lists Realtime Database availability with a free quota including 1 GB stored data, 10 GB/month downloaded data, 20K writes/day, 50K reads/day, and 20K deletes/day. Firebase could provide shared authoritative state and signaling-like room data without billing, but it requires the user to create a Firebase project and configure credentials; it is therefore not a zero-account route.

Source: https://firebase.google.com/pricing

## Architecture decision

Use a free static frontend with PeerJS Cloud signaling and a host-authoritative WebRTC data channel for the two-player session. The host owns the authoritative game state and sends snapshots to the joining peer; the joiner sends intents. The room code/invite link carries the host PeerJS identifier. The game must surface a connection warning for symmetric-NAT/TURN failures and a clear host-disconnect limitation because a free browser-to-browser path cannot guarantee server-side persistence after the host leaves. No paid hosting, billing, card, or subscription is used.
