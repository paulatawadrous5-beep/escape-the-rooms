# Free Public Deployment

## What this deployment uses

ESCAPE: THE ROOMS is designed to run as a static frontend on GitHub Pages. The two-player session uses PeerJS Cloud only for WebRTC signaling; gameplay data travels directly between the two browsers over a reliable WebRTC data channel. There is no paid hosting, persistent server, subscription, billing account, or credit card in this deployment path.

The host browser is authoritative for the active room state. The guest sends actions to the host, and the host broadcasts synchronized snapshots. This keeps the game playable with only a static frontend and a free signaling service.

## Publish through GitHub Pages

The repository includes `.github/workflows/deploy-pages.yml`. After the repository is created, enable GitHub Pages in the repository settings with **GitHub Actions** as the source. A push to `main` runs the workflow, builds `dist/public` using Vite, and publishes the resulting site. GitHub will display the public `github.io` URL in the Pages settings and in the workflow deployment environment.

The Vite configuration uses relative asset paths so the site works from a repository subpath such as `https://ACCOUNT.github.io/REPOSITORY/`.

## Multiplayer caveats of the free route

PeerJS's official documentation states that the default PeerJS Cloud service handles signaling for free and that data normally travels directly between peers. It also documents that a small percentage of users behind symmetric NATs cannot connect without a TURN relay. If two friends cannot connect from a particular network, try another network or browser; adding a paid TURN relay would violate the no-billing requirement and is intentionally not included.

A brief guest refresh can reconnect to the host while the host page remains open because the invite carries the host peer identifier. If the host closes or refreshes their page, the host-held session is lost; this is the unavoidable tradeoff of a genuinely free browser-to-browser architecture with no persistent paid backend. The UI reports this condition rather than pretending the state is server-persistent.

## Sources

- PeerJS FAQ: https://peerjs.com/client/faq
- GitHub Pages: https://pages.github.com/
