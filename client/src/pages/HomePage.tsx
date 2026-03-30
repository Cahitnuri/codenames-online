import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket/socket.client';
import { usePlayerStore } from '../store/player.store';
import { useGameStore } from '../store/game.store';

export default function HomePage() {
  const navigate = useNavigate();
  const { displayName, setDisplayName } = usePlayerStore();
  const { setMyPlayerId } = useGameStore();

  const [name, setName] = useState(displayName);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState<'create' | 'join' | null>(null);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<'create' | 'join' | null>(null);

  useEffect(() => {
    socket.on('connect', () => setMyPlayerId(socket.id ?? ''));
    if (socket.connected) setMyPlayerId(socket.id ?? '');
    return () => { socket.off('connect'); };
  }, [setMyPlayerId]);

  function handleCreate() {
    if (!name.trim()) { setError('Enter your name first'); return; }
    setError('');
    setLoading('create');
    setDisplayName(name.trim());
    socket.emit('room:create', { displayName: name.trim() }, (res) => {
      setLoading(null);
      if (res.ok && res.roomId) navigate(`/room/${res.roomId}`);
      else setError(res.error ?? 'Failed to create room');
    });
  }

  function handleJoin() {
    if (!name.trim()) { setError('Enter your name first'); return; }
    if (!joinCode.trim()) { setError('Enter a room code'); return; }
    setError('');
    setLoading('join');
    setDisplayName(name.trim());
    socket.emit('room:join', { roomId: joinCode.trim().toUpperCase(), displayName: name.trim() }, (res) => {
      setLoading(null);
      if (res.ok) navigate(`/room/${joinCode.trim().toUpperCase()}`);
      else setError(res.error ?? 'Failed to join room');
    });
  }

  return (
    <div className="min-h-screen bg-ops-room flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/6 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.6) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/6 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.6) 0%, transparent 70%)' }} />

      {/* Logo */}
      <div className="mb-12 text-center animate-fade-in">
        <div className="flex items-end gap-0 justify-center mb-1">
          <span className="font-display text-8xl leading-none"
            style={{ color: '#94A3B8', letterSpacing: '0.02em' }}>öz</span>
          <span className="font-display text-8xl leading-none text-glow-red"
            style={{ color: '#DC2626', letterSpacing: '0.02em' }}>CODE</span>
          <span className="font-display text-8xl leading-none text-glow-blue"
            style={{ color: '#2563EB', letterSpacing: '0.02em' }}>NAMES</span>
        </div>
        <div className="flex items-center gap-3 justify-center">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-slate-600" />
          <span className="font-mono-code text-xs tracking-[0.3em] text-slate-500 uppercase">Türkçe · Rekabetçi Sürüm</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-slate-600" />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="glass-panel rounded-2xl p-8 space-y-5">
          {/* Name field */}
          <div>
            <label className="block font-mono-code text-xs tracking-widest text-slate-500 uppercase mb-2">
              Ajan Adı
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              maxLength={20}
              placeholder="Kod adın..."
              className="input-dark w-full font-body text-base"
              autoFocus
            />
          </div>

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={loading !== null}
            onMouseEnter={() => setFocused('create')}
            onMouseLeave={() => setFocused(null)}
            className="btn-blue w-full py-4 text-base font-semibold relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading === 'create' ? (
                <>
                  <Spinner />
                  <span>Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <span className="font-mono-code text-lg">+</span>
                  <span>Oda Oluştur</span>
                </>
              )}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-ink-500" />
            <span className="font-mono-code text-xs text-slate-600 tracking-widest">VEYA KATIL</span>
            <div className="flex-1 h-px bg-ink-500" />
          </div>

          {/* Join */}
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              maxLength={6}
              placeholder="ABCXYZ"
              className="flex-1 input-dark font-mono-code text-xl tracking-[0.4em] text-center uppercase focus:border-crimson-600"
            />
            <button
              onClick={handleJoin}
              disabled={loading !== null}
              onMouseEnter={() => setFocused('join')}
              onMouseLeave={() => setFocused(null)}
              className="btn-red px-7 py-4 text-base font-semibold"
            >
              {loading === 'join' ? <Spinner /> : 'Katıl'}
            </button>
          </div>

          {error && (
            <p className="font-body text-sm text-red-400 text-center animate-shake bg-red-950/30 border border-red-900/50 rounded-lg py-2 px-3">
              {error}
            </p>
          )}
        </div>

        {/* Footer note */}
        <p className="mt-6 font-mono-code text-xs text-slate-700 text-center tracking-wide">
          2 TAKIM · 25 KELİME · 1 SUİKASTÇI · ACIMAZ
        </p>
      </div>

      {/* Feature pills */}
      <div className="mt-10 flex gap-3 flex-wrap justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
        {['30sn İstihbarat Sayacı', 'Risk Bonusu', 'Kombo Sistemi', 'Blöf Yeteneği', 'Sabotaj Tokeni'].map(f => (
          <span key={f} className="font-mono-code text-xs text-slate-600 border border-ink-500 rounded-full px-3 py-1 tracking-wider">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}
