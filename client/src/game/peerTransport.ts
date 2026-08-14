import Peer, { type DataConnection } from "peerjs";
import type { ClientAction, PlayerSlot, PublicGameState } from "@shared/game";
import { addGuest, applyLocalAction, makeInitialState } from "./localEngine";

export type TransportEvent = { type: "state"; state: PublicGameState } | { type: "ready"; slot: PlayerSlot; roomCode: string; invitePeerId: string } | { type: "status"; message: string } | { type: "error"; message: string };

type Message = { type: "state"; state: PublicGameState } | { type: "action"; action: ClientAction } | { type: "hello"; name: string; roomCode: string; reconnect: boolean } | { type: "welcome"; state: PublicGameState };

export class FreePeerTransport {
  private peer?: Peer;
  private connection?: DataConnection;
  private state?: PublicGameState;
  private slot?: PlayerSlot;
  private roomCode = "";
  private hostPeerId = "";
  private listener?: (event: TransportEvent) => void;
  private hostName = "PLAYER 1";
  private guestName = "PLAYER 2";

  on(listener: (event: TransportEvent) => void) { this.listener = listener; }
  private emit(event: TransportEvent) { this.listener?.(event); }
  private send(message: Message) { if (this.connection?.open) this.connection.send(message); }

  async create(name: string) {
    this.hostName = name || "PLAYER 1"; this.slot = "player1"; this.roomCode = crypto.randomUUID().slice(0, 8).toUpperCase();
    this.peer = new Peer();
    this.peer.on("open", id => { this.hostPeerId = id; this.state = makeInitialState(this.roomCode, this.hostName); this.emit({ type: "ready", slot: "player1", roomCode: this.roomCode, invitePeerId: id }); this.emit({ type: "state", state: this.state }); });
    this.peer.on("connection", connection => { if (this.connection?.open) { connection.close(); return; } this.attachHostConnection(connection); });
    this.peer.on("error", error => this.emit({ type: "error", message: error.type === "peer-unavailable" ? "The host is not reachable. Check the invite link and try again." : "Free peer connection could not be established. Try again." }));
    this.peer.on("disconnected", () => this.emit({ type: "status", message: "Signaling link interrupted. Reconnecting…" }));
  }

  async join(hostPeerId: string, roomCode: string, name: string) {
    this.guestName = name || "PLAYER 2"; this.slot = "player2"; this.roomCode = roomCode; this.hostPeerId = hostPeerId; localStorage.setItem(`escape-guest:${roomCode}`, JSON.stringify({ hostPeerId, roomCode, name: this.guestName })); this.peer = new Peer();
    this.peer.on("open", () => { const connection = this.peer!.connect(hostPeerId, { reliable: true }); this.attachGuestConnection(connection); });
    this.peer.on("error", error => this.emit({ type: "error", message: error.type === "peer-unavailable" ? "The host is offline or the invite has expired." : "Free peer connection could not be established. Try again." }));
    this.peer.on("disconnected", () => this.emit({ type: "status", message: "Signaling link interrupted. Reconnecting…" }));
  }

  private attachHostConnection(connection: DataConnection) { this.connection = connection; connection.on("open", () => this.emit({ type: "status", message: "Partner connected. Awaiting synchronized start." })); connection.on("data", raw => { const message = raw as Message; if (message.type === "hello" && this.state && message.roomCode === this.roomCode) { this.state = addGuest(this.state, message.name); this.send({ type: "welcome", state: this.state }); this.emit({ type: "state", state: this.state }); this.emit({ type: "status", message: message.reconnect ? "Partner rejoined. Previous score and inventory restored." : "Partner connected. Awaiting synchronized start." }); } if (message.type === "action" && this.state) this.receiveAction(message.action); }); connection.on("close", () => { if (this.state?.players.player2) { this.state.players.player2.connected = false; this.emit({ type: "state", state: this.state }); } this.emit({ type: "status", message: "Partner disconnected. The host session is preserved; reconnect the invite to resume." }); }); }
  private attachGuestConnection(connection: DataConnection) { this.connection = connection; connection.on("open", () => { const reconnecting = Boolean(localStorage.getItem(`escape-guest:${this.roomCode}`)); this.send({ type: "hello", name: this.guestName, roomCode: this.roomCode, reconnect: reconnecting }); this.emit({ type: "status", message: reconnecting ? "Reconnecting to host. Restoring your previous state…" : "Connected to host. Synchronizing room…" }); }); connection.on("data", raw => { const message = raw as Message; if (message.type === "welcome") { this.state = message.state; this.emit({ type: "ready", slot: "player2", roomCode: this.roomCode, invitePeerId: this.hostPeerId }); this.emit({ type: "state", state: this.state }); } if (message.type === "state") { this.state = message.state; this.emit({ type: "state", state: this.state }); } }); connection.on("close", () => this.emit({ type: "status", message: "Host disconnected. Rejoin with the invite after the host reconnects." })); }
  private receiveAction(action: ClientAction) { if (!this.state) return; try { this.state = applyLocalAction(this.state, "player2", action); this.send({ type: "state", state: this.state }); this.emit({ type: "state", state: this.state }); } catch (error) { this.emit({ type: "error", message: error instanceof Error ? error.message.replaceAll("_", " ") : "Action rejected." }); } }
  action(action: ClientAction) { if (!this.state || !this.slot) return; if (this.slot === "player1") { try { this.state = applyLocalAction(this.state, "player1", action); this.send({ type: "state", state: this.state }); this.emit({ type: "state", state: this.state }); } catch (error) { this.emit({ type: "error", message: error instanceof Error ? error.message.replaceAll("_", " ") : "Action rejected." }); } } else this.send({ type: "action", action }); }
  close() { this.connection?.close(); this.peer?.destroy(); }
}
