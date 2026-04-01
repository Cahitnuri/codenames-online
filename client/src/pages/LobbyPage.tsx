import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket/socket.client';
import { useGameStore } from '../store/game.store';
import { usePlayerStore } from '../store/player.store';
import { useGameActions } from '../socket/socket.hooks';
import type { Team, Player } from '@codenames/shared';
import { Avatars, AvatarList, AvatarDisplay } from '../components/ui/Avatars';

export default function LobbyPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { game, myPlayerId, setFullState, setMyPlayerId } = useGameStore();
  const { displayName, setDisplayName, avatar, setAvatar } = usePlayerStore();
  const actions = useGameActions();

  const [nameInput, setNameInput] = useState(displayName);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [spymasterSec, setSpymasterSec] = useState(30);
  const [operativeSec, setOperativeSec] = useState(60);

  useEffect(() => {
    const handleConnect = () => {
      setMyPlayerId(socket.id ?? '');
      if (roomId && displayName && !joined) joinRoom(displayName);
    };
    socket.on('connect', handleConnect);
    if (socket.connected) {
      setMyPlayerId(socket.id ?? '');
      if (roomId && displayName && !joined) joinRoom(displayName);
    }
    return () => { socket.off('connect', handleConnect); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setMyPlayerId, roomId]);

  useEffect(() => {
    if (game?.phase === 'spymaster-turn' || game?.phase === 'operative-turn') {
      navigate(`/game/${roomId}`);
    }
  }, [game?.phase, navigate, roomId]);

  function joinRoom(name: string) {
    if (!roomId || !name.trim()) return;
    setDisplayName(name.trim());
    socket.emit('room:join', { roomId: roomId.toUpperCase(), displayName: name.trim(), avatar }, (res) => {
      if (res.ok && res.state) { setFullState(res.state); setJoined(true); }
      else setError(res.error ?? 'Failed to join');
    });
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const myPlayer = game?.players.find(p => p.id === myPlayerId);
  const isHost = game?.players[0]?.id === myPlayerId;
  const redPlayers = game?.players.filter(p => p.team === 'red') ?? [];
  const bluePlayers = game?.players.filter(p => p.team === 'blue') ?? [];
  const canStart =
    redPlayers.length >= 2 && bluePlayers.length >= 2 &&
    redPlayers.some(p => p.role === 'spymaster') &&
    bluePlayers.some(p => p.role === 'spymaster');

  if (!joined) {
    return (
      <div className="min-h-screen bg-ops-room flex items-center justify-center p-4">
        <div className="glass-panel rounded-2xl p-8 w-full max-w-sm space-y-5 animate-slide-up">
          <div className="text-center">
            <h1 className="font-display text-5xl">
              <span style={{ color: '#94A3B8' }}>öz</span><span style={{ color: '#DC2626' }}>CODE</span><span style={{ color: '#2563EB' }}>NAMES</span>
            </h1>
            <p className="font-mono-code text-xs text-slate-500 mt-1 tracking-widest">ODA KODU</p>
            <p className="font-mono-code text-2xl text-white mt-1 tracking-[0.3em]">{roomId}</p>
          </div>
          <input
            type="text" value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && joinRoom(nameInput)}
            maxLength={20} placeholder="Ajan adın..."
            className="input-dark w-full font-body text-base"
            autoFocus
          />
          {/* Avatar picker */}
          <div>
            <p className="font-mono-code text-xs text-slate-500 tracking-widest mb-2">AVATAR SEÇ</p>
            <div className="grid grid-cols-8 gap-1.5">
              {AvatarList.map(name => {
                const AvatarComp = Avatars[name]!;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setAvatar(name)}
                    className="rounded-lg overflow-hidden transition-all duration-150"
                    style={{
                      outline: avatar === name ? '2px solid #F59E0B' : '2px solid transparent',
                      outlineOffset: '1px',
                      background: avatar === name ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                    }}
                    title={name}
                  >
                    <div className="w-8 h-8 p-0.5">
                      <AvatarComp />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <button onClick={() => joinRoom(nameInput)} className="btn-blue w-full py-3.5 font-semibold text-base">
            Odaya Gir
          </button>
          {error && (
            <div className="space-y-3">
              <p className="text-red-400 text-sm text-center font-body">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="w-full py-2.5 font-body text-sm text-slate-400 border border-ink-500 rounded-xl hover:border-slate-400 hover:text-white transition-all"
              >
                ← Ana Sayfaya Dön
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ops-room flex flex-col">
      {/* Header */}
      <div className="glass-panel border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="font-display text-3xl">
            <span style={{ color: '#DC2626' }}>CODE</span>
            <span style={{ color: '#2563EB' }}>NAMES</span>
          </h1>
          <div className="flex items-center gap-3">
            <span className="font-mono-code text-xs text-slate-500 tracking-widest">ROOM</span>
            <span className="font-mono-code text-xl font-bold text-white tracking-[0.2em]">{roomId}</span>
            <button
              onClick={copyLink}
              className={`font-mono-code text-xs px-4 py-2 rounded-lg border transition-all duration-200 tracking-wider ${
                copied
                  ? 'bg-green-900/40 border-green-600 text-green-400'
                  : 'border-ink-500 text-slate-400 hover:border-slate-400 hover:text-white'
              }`}
            >
              {copied ? '✓ KOPYALANDI' : 'LİNK KOPYALA'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Teams */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {(['red', 'blue'] as Team[]).map(team => (
            <TeamColumn
              key={team}
              team={team}
              players={team === 'red' ? redPlayers : bluePlayers}
              myPlayer={myPlayer}
              onSelectTeam={() => socket.emit('player:select-team', { team })}
              onSelectRole={actions.selectRole}
            />
          ))}
        </div>

        {/* Spectators */}
        {(game?.players ?? []).filter(p => p.team === 'spectator').length > 0 && (
          <div className="glass-panel rounded-xl p-4 mb-6">
            <p className="font-mono-code text-xs text-slate-500 tracking-widest mb-3">SEYİRCİLER</p>
            <div className="flex gap-2 flex-wrap">
              {(game?.players ?? []).filter(p => p.team === 'spectator').map(p => (
                <span key={p.id} className="glass-panel rounded-full px-3 py-1 font-body text-sm text-slate-300">
                  {p.displayName}{p.id === myPlayerId && ' (you)'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Requirements checklist */}
        <div className="glass-panel rounded-xl p-5 mb-6">
          <p className="font-mono-code text-xs text-slate-500 tracking-widest mb-4">GÖREV GEREKSİNİMLERİ</p>
          <div className="grid grid-cols-2 gap-2">
            <Req met={redPlayers.length >= 2} label="Kırmızı takım: 2+ oyuncu" />
            <Req met={bluePlayers.length >= 2} label="Mavi takım: 2+ oyuncu" />
            <Req met={redPlayers.some(p => p.role === 'spymaster')} label="Kırmızı istihbarat atandı" />
            <Req met={bluePlayers.some(p => p.role === 'spymaster')} label="Mavi istihbarat atandı" />
          </div>
        </div>

        {/* Timer settings — host only */}
        {isHost && (
          <div className="glass-panel rounded-xl p-5 mb-6">
            <p className="font-mono-code text-xs text-slate-500 tracking-widest mb-4">SÜRE AYARLARI</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono-code text-xs text-slate-400 tracking-wider block mb-2">
                  İSTİHBARAT SÜRESİ
                  <span className="ml-2 text-amber-400">{spymasterSec}s</span>
                </label>
                <input
                  type="range" min={10} max={120} step={5}
                  value={spymasterSec}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setSpymasterSec(val);
                    socket.emit('game:set-settings', { spymasterMs: val * 1000, operativeMs: operativeSec * 1000 });
                  }}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between font-mono-code text-xs text-slate-600 mt-1">
                  <span>10s</span><span>120s</span>
                </div>
              </div>
              <div>
                <label className="font-mono-code text-xs text-slate-400 tracking-wider block mb-2">
                  AJAN SÜRESİ
                  <span className="ml-2 text-amber-400">{operativeSec}s</span>
                </label>
                <input
                  type="range" min={15} max={180} step={5}
                  value={operativeSec}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setOperativeSec(val);
                    socket.emit('game:set-settings', { spymasterMs: spymasterSec * 1000, operativeMs: val * 1000 });
                  }}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between font-mono-code text-xs text-slate-600 mt-1">
                  <span>15s</span><span>180s</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Start */}
        {isHost ? (
          <button
            onClick={actions.startGame}
            disabled={!canStart}
            className={`w-full py-5 font-display text-2xl tracking-widest transition-all duration-300 rounded-xl ${
              canStart
                ? 'btn-blue shadow-blue-glow'
                : 'bg-ink-600 text-slate-600 cursor-not-allowed border border-ink-500'
            }`}
          >
            {canStart ? 'GÖREVE BAŞLA' : 'AJANLAR BEKLENİYOR...'}
          </button>
        ) : (
          <div className="text-center py-4 font-mono-code text-sm text-slate-500 tracking-widest animate-pulse-glow">
            HOST BAŞLATMAYI BEKLİYOR...
          </div>
        )}
      </div>
    </div>
  );
}

function Req({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${
        met ? 'bg-green-500' : 'bg-ink-500 border border-ink-400'
      }`}>
        {met && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`font-body text-sm ${met ? 'text-slate-300' : 'text-slate-600'}`}>{label}</span>
    </div>
  );
}

function TeamColumn({ team, players, myPlayer, onSelectTeam, onSelectRole }: {
  team: Team;
  players: Player[];
  myPlayer: Player | undefined;
  onSelectTeam: () => void;
  onSelectRole: (role: 'spymaster' | 'operative') => void;
}) {
  const isOnThisTeam = myPlayer?.team === team;
  const isRed = team === 'red';
  const panelClass = isRed ? 'glass-red' : 'glass-blue';
  const accentColor = isRed ? '#DC2626' : '#2563EB';
  const btnClass = isRed ? 'btn-red' : 'btn-blue';
  const teamLabel = isRed ? 'KIRMIZI TAKIM' : 'MAVİ TAKIM';

  return (
    <div className={`${panelClass} rounded-2xl p-6`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-mono-code text-xs tracking-[0.3em] text-slate-500">TAKIM</p>
          <h2 className="font-display text-3xl" style={{ color: accentColor }}>{teamLabel}</h2>
        </div>
        {!isOnThisTeam && (
          <button onClick={onSelectTeam} className={`${btnClass} px-5 py-2.5 text-sm font-semibold`}>
            Katıl
          </button>
        )}
        {isOnThisTeam && (
          <span className="font-mono-code text-xs border rounded-full px-3 py-1 tracking-widest"
            style={{ borderColor: accentColor, color: accentColor }}>
            SENİN TAKIM
          </span>
        )}
      </div>

      {/* Player list */}
      <div className="space-y-2 mb-5 min-h-[100px]">
        {players.length === 0 ? (
          <p className="font-body text-sm text-slate-600 italic py-4 text-center">Henüz ajan yok</p>
        ) : (
          players.map(p => (
            <div key={p.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
              p.id === myPlayer?.id ? 'bg-white/5' : 'bg-black/20'
            }`}>
              <PlayerAvatar name={p.displayName} team={team} />
              <div className="flex-1 min-w-0">
                <span className="font-body text-sm font-medium text-slate-200 truncate block">
                  {p.displayName}
                  {p.id === myPlayer?.id && <span className="text-slate-500 text-xs ml-1">(you)</span>}
                  {!p.connected && <span className="text-slate-600 text-xs ml-1">(offline)</span>}
                </span>
              </div>
              <RoleBadge role={p.role} />
            </div>
          ))
        )}
      </div>

      {/* Role picker */}
      {isOnThisTeam && (
        <div className="flex gap-2">
          <RoleButton
            label="İstihbarat" icon="★"
            active={myPlayer?.role === 'spymaster'}
            onClick={() => onSelectRole('spymaster')}
          />
          <RoleButton
            label="Ajan" icon="◆"
            active={myPlayer?.role === 'operative'}
            onClick={() => onSelectRole('operative')}
          />
        </div>
      )}
    </div>
  );
}

function PlayerAvatar({ name, team }: { name: string; team: Team }) {
  const bg = team === 'red'
    ? 'background: linear-gradient(135deg, #7f1d1d, #DC2626)'
    : 'background: linear-gradient(135deg, #1e3a8a, #2563EB)';
  return (
    <div className="player-avatar text-white" style={{ background: team === 'red' ? 'linear-gradient(135deg, #7f1d1d, #DC2626)' : 'linear-gradient(135deg, #1e3a8a, #2563EB)' }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

function RoleBadge({ role }: { role: string | null }) {
  if (!role) return <span className="font-mono-code text-xs text-slate-600 shrink-0">—</span>;
  return (
    <span className={`font-mono-code text-xs px-2 py-0.5 rounded-full shrink-0 ${
      role === 'spymaster'
        ? 'bg-amber-900/40 text-amber-300 border border-amber-700/50'
        : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
    }`}>
      {role === 'spymaster' ? '★ SPY' : '◆ OPS'}
    </span>
  );
}

function RoleButton({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold font-body border transition-all duration-200 ${
        active
          ? label === 'Spymaster'
            ? 'bg-amber-900/50 border-amber-600 text-amber-300'
            : 'bg-slate-700/80 border-slate-500 text-white'
          : 'border-ink-500 text-slate-500 hover:text-slate-300 hover:border-slate-500'
      }`}
    >
      <span className="text-xs">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
