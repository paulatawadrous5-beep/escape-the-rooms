import { useEffect, useState, type ReactNode } from "react";
import { Copy, Radio, RotateCcw, Sparkles, Terminal, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FreePeerTransport } from "@/game/peerTransport";
import type { ClientAction, PlayerSlot, PublicGameState } from "@shared/game";

const puzzleMeta: Record<string, { eyebrow: string; prompt: string; options: string[] }> = {
  "torch-sequence": { eyebrow: "PATTERN RECOGNITION", prompt: "Decode the flame order", options: ["241", "124", "412"] },
  "sun-glyphs": { eyebrow: "SYMBOL MATRIX", prompt: "Align the glyphs", options: ["crescent-eye-sun", "sun-eye-crescent", "eye-crescent-sun"] },
  "relic-plates": { eyebrow: "DUAL CHANNEL", prompt: "Synchronize both pressure plates", options: ["ACTIVATE MY PLATE"] },
  "star-map": { eyebrow: "OBSERVATION", prompt: "Trace the constellation", options: ["blue-pink-blue-cyan", "pink-blue-cyan-blue"] },
  "power-routing": { eyebrow: "SYSTEMS", prompt: "Route reactor energy", options: ["cyan-magenta-cyan", "magenta-cyan-pink"] },
  "pod-frequency": { eyebrow: "COOPERATIVE", prompt: "Transmit the escape frequency", options: ["7319", "1973"] },
  "portrait-order": { eyebrow: "SEQUENCE", prompt: "Order the portraits", options: ["raven-widow-child-clockmaker", "child-raven-widow-clockmaker"] },
  "bell-name": { eyebrow: "HIDDEN CLUE", prompt: "Name the unseen guest", options: ["echo", "veil", "morrow"] },
  "seance-circle": { eyebrow: "INVENTORY", prompt: "Complete the séance circle", options: ["silver-key+black-candle", "black-candle"] },
  "specimen-primes": { eyebrow: "LOGIC", prompt: "Enter the prime pulse", options: ["11-13-17", "7-9-11"] },
  "pressure-valve": { eyebrow: "CALIBRATION", prompt: "Balance the pressure", options: ["3-2-1", "1-2-3"] },
  "hatch-seal": { eyebrow: "FINAL SEAL", prompt: "Synchronize the hatch", options: ["ACTIVATE SEAL"] },
};
const roomAtmosphere: Record<string, { accent: string; glyph: string; objects: string[] }> = {
  "Ancient Temple": { accent: "#ff3dbb", glyph: "𓂀", objects: ["BRAZIERS", "GLYPH WALL", "RELIC PLATES"] },
  "Space Station": { accent: "#53efff", glyph: "◈", objects: ["STAR MAP", "REACTOR", "ESCAPE POD"] },
  "Haunted Mansion": { accent: "#d946ef", glyph: "☽", objects: ["PORTRAITS", "BELL", "SÉANCE CIRCLE"] },
  "Underwater Lab": { accent: "#27f5d3", glyph: "⌬", objects: ["SPECIMEN TANKS", "PRESSURE VALVE", "ESCAPE HATCH"] },
};

function formatTime(seconds = 0) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
function playerLabel(slot: PlayerSlot | undefined) { return slot === "player1" ? "PLAYER 1" : "PLAYER 2"; }

export default function Home() {
  const [transport] = useState(() => new FreePeerTransport());
  const [state, setState] = useState<PublicGameState | null>(null);
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState(() => new URLSearchParams(location.search).get("room")?.toUpperCase() ?? "");
  const [invitePeerId, setInvitePeerId] = useState(() => new URLSearchParams(location.search).get("peer") ?? "");
  const [mySlot, setMySlot] = useState<PlayerSlot | undefined>(() => (localStorage.getItem("escape-slot") as PlayerSlot) || undefined);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeObject, setActiveObject] = useState("");

  useEffect(() => {
    transport.on(event => {
      if (event.type === "state") setState(event.state);
      if (event.type === "ready") { setMySlot(event.slot); setJoinCode(event.roomCode); setInvitePeerId(event.invitePeerId); localStorage.setItem("escape-slot", event.slot); if (event.slot === "player1") history.replaceState({}, "", `?room=${event.roomCode}&peer=${event.invitePeerId}`); }
      if (event.type === "status" || event.type === "error") setNotice(event.message);
    });
    return () => transport.close();
  }, [transport]);

  const emit = (action: ClientAction) => { setNotice(""); transport.action(action); };
  const player = state?.players[mySlot || "player1"];
  const other = state?.players[mySlot === "player1" ? "player2" : "player1"];
  const room = state?.room;
  const atmosphere = room ? roomAtmosphere[room.name] : undefined;
  const shareUrl = state ? `${location.origin}${location.pathname}?room=${state.roomCode}&peer=${invitePeerId || "HOST_PEER_ID"}` : "";

  const create = () => { void transport.create(name || "PLAYER 1"); };
  const join = () => { if (joinCode.trim()) void transport.join(invitePeerId || joinCode.trim(), joinCode.trim(), name || "PLAYER 2"); };
  const copyInvite = async () => { await navigator.clipboard?.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1400); };

  if (!state) return <Landing name={name} setName={setName} joinCode={joinCode} setJoinCode={setJoinCode} create={create} join={join} notice={notice} />;
  if (state.phase === "lobby") return <Lobby state={state} shareUrl={shareUrl} copyInvite={copyInvite} copied={copied} emit={emit} notice={notice} />;
  if (state.phase === "results") return <Results state={state} emit={emit} />;

  return <main className="game-shell" style={{ ["--room-accent" as string]: atmosphere?.accent }}>
    <header className="topbar hud-frame"><div className="brand-mark"><span className="brand-kicker">ONLINE ESCAPE PROTOCOL</span><strong>ESCAPE<span>:</span> THE ROOMS</strong></div><div className="connection"><Radio size={13} /> {other?.connected ? "LINK STABLE" : "WAITING FOR PARTNER"}<span className="room-chip">ROOM {state.roomCode}</span></div></header>
    <section className="room-hero hud-frame"><div className="room-glyph">{atmosphere?.glyph}</div><div><span className="eyebrow">ROOM {String((room?.index ?? 0) + 1).padStart(2, "0")} / 04 · {room?.key.toUpperCase()}</span><h1>{room?.name}</h1><p>{room?.subtitle}</p></div><div className={`timer ${room && room.remainingSeconds < 60 ? "danger" : ""}`}><span>TIME REMAINING</span><strong>{formatTime(room?.remainingSeconds)}</strong></div></section>
    <div className="game-grid"><aside className="side-rail"><PanelTitle icon={<Users size={15} />} title="PAIR LINK" /><div className="player-card active"><span className="player-dot" /><div><b>{player?.name || playerLabel(mySlot)}</b><small>{playerLabel(mySlot)} · YOU</small></div><strong>{player?.score ?? 0}</strong></div><div className={`player-card ${other?.connected ? "" : "offline"}`}><span className="player-dot" /><div><b>{other?.name || "AWAITING PLAYER"}</b><small>{playerLabel(mySlot === "player1" ? "player2" : "player1")} · {other?.connected ? "ONLINE" : "RECONNECTING"}</small></div><strong>{other?.score ?? 0}</strong></div><PanelTitle icon={<Zap size={15} />} title="SHARED INVENTORY" /><div className="inventory">{(room?.sharedInventory.length ? room.sharedInventory : ["EMPTY SLOT", "EMPTY SLOT"]).map((item, i) => <div className="inventory-item" key={`${item}-${i}`}>{item === "EMPTY SLOT" ? <span>＋</span> : <><Sparkles size={13} />{item.replaceAll("-", " ").toUpperCase()}</>}</div>)}</div><div className="hint-box"><div><span className="eyebrow">HINT BUFFER</span><strong>{room?.hintsRemaining} REMAINING</strong></div><Button className="neon-button pink" onClick={() => emit({ type: "use_hint" })}>REQUEST HINT <span>-60</span></Button></div></aside>
      <section className="puzzle-zone"><div className="zone-header"><div><span className="eyebrow">ACTIVE OBJECTS · {room?.discoveredClues.length ?? 0} CLUES LOGGED</span><h2>Decode the chamber</h2></div><div className="live-tag"><span className="pulse" /> SYNCED LIVE</div></div><div className="object-grid">{room && Object.entries(room.puzzleStates).map(([puzzleId, puzzleState]) => { const meta = puzzleMeta[puzzleId] || { eyebrow: "INTERACTIVE OBJECT", prompt: "Inspect object", options: ["ACTIVATE"] }; const solved = puzzleState.solved; return <article className={`puzzle-card ${solved ? "solved" : ""} ${activeObject === puzzleId ? "selected" : ""}`} key={puzzleId} onClick={() => { setActiveObject(puzzleId); emit({ type: "inspect", objectId: puzzleId }); }}><div className="puzzle-card-top"><span className="puzzle-number">{solved ? "✓" : "0" + (Object.keys(room.puzzleStates).indexOf(puzzleId) + 1)}</span><span className="eyebrow">{meta.eyebrow}</span><span className="status">{solved ? "SOLVED" : `${puzzleState.attempts} ATTEMPTS`}</span></div><h3>{meta.prompt}</h3><p>{solved ? "Signal accepted. The chamber remembers your answer." : "Interact, compare clues, and send the correct sequence."}</p>{!solved && <div className="option-row">{meta.options.map(option => <button key={option} className="option-button" onClick={e => { e.stopPropagation(); const action: ClientAction = puzzleId.includes("symbol") || puzzleId.includes("routing") || puzzleId.includes("valve") ? { type: "toggle_symbol", puzzleId, value: option } : puzzleId.includes("circle") ? { type: "place_item", puzzleId, item: option.split("+")[0] } : puzzleId.includes("plate") || puzzleId.includes("hatch") ? { type: "submit_sequence", puzzleId, value: mySlot || "player1" } : { type: "submit_sequence", puzzleId, value: option }; emit(action); }}>{option.replaceAll("-", " · ").toUpperCase()}</button>)}</div>}{solved && <div className="solved-bar"><span>OBJECT CLEARED</span><span>+ SCORE SYNCED</span></div>}</article>; })}</div><div className="escape-console hud-frame"><div><span className="eyebrow">EXIT CONTROL</span><h3>Unlock the room and move deeper.</h3><p>Both players must confirm the solved state before the next threshold can open.</p></div><Button className="neon-button cyan" disabled={!room || Object.values(room.puzzleStates).some(p => !p.solved)} onClick={() => emit({ type: "escape_room" })}>OPEN LOCKED DOOR <span>→</span></Button></div>{notice && <div className="notice">{notice}</div>}</section></div>
  </main>;
}

function PanelTitle({ icon, title }: { icon: ReactNode; title: string }) { return <div className="panel-title">{icon}<span>{title}</span></div>; }
function Landing({ name, setName, joinCode, setJoinCode, create, join, notice }: { name: string; setName: (v: string) => void; joinCode: string; setJoinCode: (v: string) => void; create: () => void; join: () => void; notice: string }) { return <main className="landing"><div className="landing-grid" /><header className="landing-nav"><div className="brand-mark"><span className="brand-kicker">REAL-TIME COOPERATIVE GAME</span><strong>ESCAPE<span>:</span> THE ROOMS</strong></div><div className="status-pill"><span className="pulse" /> TWO PLAYER LINK READY</div></header><section className="landing-content"><div className="hero-copy"><span className="eyebrow">A SHARED SIGNAL / FOUR IMPOSSIBLE ROOMS</span><h1>Trust your<br /><span>other mind.</span></h1><p>Four rooms. One locked exit. Every clue is only half the story until two players connect across the distance.</p><div className="theme-strip"><span>ANCIENT TEMPLE</span><i>·</i><span>SPACE STATION</span><i>·</i><span>HAUNTED MANSION</span><i>·</i><span>UNDERWATER LAB</span></div></div><div className="access-card hud-frame"><div className="access-corner">/ ACCESS TERMINAL 02</div><h2>Open a private channel</h2><label>CALLSIGN <Input value={name} onChange={e => setName(e.target.value)} placeholder="YOUR NAME" maxLength={18} /></label><Button className="neon-button pink full" onClick={create}>CREATE PRIVATE ROOM <span>↗</span></Button><div className="or-line"><span>OR JOIN AN EXISTING SIGNAL</span></div><label>ROOM CODE <Input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="E.G. 4F2A9C1B" /></label><Button className="neon-button cyan full" onClick={join}>JOIN ROOM <span>→</span></Button>{notice && <div className="notice">{notice}</div>}<div className="terminal-foot"><Terminal size={13} /> ENCRYPTED · PRIVATE · TWO SEATS ONLY</div></div></section><footer className="landing-footer"><span>NO MAPS. NO SINGLE-PLAYER SHORTCUTS.</span><span>PROTOCOL 4.0 / 2026</span></footer></main>; }

function Lobby({ state, shareUrl, copyInvite, copied, emit, notice }: { state: PublicGameState; shareUrl: string; copyInvite: () => void; copied: boolean; emit: (a: ClientAction) => void; notice: string }) { const ready = Boolean(state.players.player1 && state.players.player2); return <main className="landing"><div className="landing-grid" /><header className="landing-nav"><div className="brand-mark"><span className="brand-kicker">PRIVATE ROOM CREATED</span><strong>ESCAPE<span>:</span> THE ROOMS</strong></div><div className="status-pill"><span className="pulse" /> WAITING FOR SECOND SIGNAL</div></header><section className="lobby-content hud-frame"><span className="eyebrow">ROOM CHANNEL / {state.roomCode}</span><h1>Send the invite.</h1><p>Your room is sealed. Share the link or code with one friend, then begin the descent together.</p><div className="invite-row"><code>{shareUrl}</code><Button className="neon-button cyan" onClick={copyInvite}>{copied ? "COPIED" : <><Copy size={15} /> COPY LINK</>}</Button></div><div className="seat-grid"><div className={`seat ${state.players.player1 ? "filled" : ""}`}><span>01</span><div><b>{state.players.player1?.name || "OPEN SEAT"}</b><small>{state.players.player1 ? "HOST · CONNECTED" : "WAITING"}</small></div></div><div className={`seat ${state.players.player2 ? "filled" : ""}`}><span>02</span><div><b>{state.players.player2?.name || "OPEN SEAT"}</b><small>{state.players.player2 ? "CONNECTED" : "SEND INVITE"}</small></div></div></div><Button className="neon-button pink full" disabled={!ready} onClick={() => emit({ type: "start_game" })}>{ready ? "START THE DESCENT" : "WAITING FOR PLAYER 2"} <span>→</span></Button>{notice && <div className="notice">{notice}</div>}<div className="terminal-foot"><Users size={13} /> EXACTLY TWO PLAYERS · ROOM STATE SYNCHRONIZED LIVE</div></section></main>; }

function Results({ state, emit }: { state: PublicGameState; emit: (a: ClientAction) => void }) { const p1 = state.players.player1; const p2 = state.players.player2; const winner = state.results?.awards["THE MAN OF THE ROUND"]; return <main className="results-page"><div className="landing-grid" /><div className="results-inner"><span className="eyebrow">PROTOCOL COMPLETE · {state.results?.roomsCompleted ?? 4} / 04 ROOMS CLEARED</span><h1>THE SIGNAL<br /><span>ESCAPED.</span></h1><p className="results-sub">Two minds. One impossible route. The room remembers who found the way.</p><div className="scoreboard"><div className={`final-score ${winner === "player1" ? "winner" : ""}`}><span className="eyebrow">PLAYER 01 {winner === "player1" && "· MAN OF THE ROUND"}</span><strong>{p1?.score ?? 0}</strong><small>{p1?.name || "PLAYER 1"}</small></div><div className={`final-score ${winner === "player2" ? "winner" : ""}`}><span className="eyebrow">PLAYER 02 {winner === "player2" && "· MAN OF THE ROUND"}</span><strong>{p2?.score ?? 0}</strong><small>{p2?.name || "PLAYER 2"}</small></div></div><div className="awards">{Object.entries(state.results?.awards || {}).map(([award, slot]) => <div key={award}><span>{award}</span><b>{playerLabel(slot)}</b></div>)}</div><div className="results-actions"><Button className="neon-button pink" onClick={() => emit({ type: "replay" })}><RotateCcw size={15} /> REMATCH</Button><Button className="neon-button cyan" onClick={() => location.reload()}>NEW GAME <span>→</span></Button></div></div></main>; }
