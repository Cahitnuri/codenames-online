import { useState } from 'react';
import { useLocalGame } from '../../context/LocalGameContext';
import AvatarPicker, { AvatarDisplay } from '../../components/local/AvatarPicker';
import { AVATARS } from '../../data/avatars';

type Tab = 'guest' | 'account';

export default function LoginPage() {
  const { state, loginAsGuest, createAccount, loginProfile, deleteProfile } = useLocalGame();
  const [tab, setTab] = useState<Tab>('guest');
  const [guestName, setGuestName] = useState('');
  const [guestAvatar, setGuestAvatar] = useState(AVATARS[0]?.id ?? 'kedi');
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState(AVATARS[0]?.id ?? 'kedi');
  const [showNewForm, setShowNewForm] = useState(false);
  const [error, setError] = useState('');

  function handleGuestLogin() {
    if (!guestName.trim()) { setError('İsim gir'); return; }
    loginAsGuest(guestName.trim(), guestAvatar);
  }

  function handleCreateAccount() {
    if (!newName.trim()) { setError('İsim gir'); return; }
    createAccount(newName.trim(), newAvatar);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #8B4A22 0%, #3A1A08 100%)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/3 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(200,100,50,0.6) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(100,150,200,0.5) 0%, transparent 70%)' }}
      />

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="font-display text-6xl mb-1">
          <span style={{ color: '#FF9070' }}>KOD</span>
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>·</span>
          <span style={{ color: '#70C0FF' }}>ADLAR</span>
        </div>
        <p className="font-mono-code text-xs tracking-[0.25em] text-slate-500 uppercase mt-1">
          Türkçe Yerel Oyun
        </p>
      </div>

      {/* Main card */}
      <div className="w-full max-w-sm glass-panel rounded-2xl p-6 space-y-5">
        {/* Tab switcher */}
        <div className="flex rounded-xl overflow-hidden border border-white/10 p-0.5 bg-black/20">
          {(['guest', 'account'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                tab === t
                  ? 'bg-white/12 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'guest' ? '🎭 Misafir' : '👤 Hesabım'}
            </button>
          ))}
        </div>

        {/* Guest Tab */}
        {tab === 'guest' && (
          <div className="space-y-4">
            <div>
              <label className="block font-mono-code text-xs tracking-widest text-slate-500 uppercase mb-1.5">
                İsmin
              </label>
              <input
                type="text"
                value={guestName}
                onChange={e => { setGuestName(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleGuestLogin()}
                maxLength={20}
                placeholder="Takma adın..."
                className="input-dark w-full font-body text-base"
                autoFocus
              />
            </div>
            <div>
              <label className="block font-mono-code text-xs tracking-widest text-slate-500 uppercase mb-2">
                Avatar Seç
              </label>
              <AvatarPicker selected={guestAvatar} onSelect={setGuestAvatar} />
            </div>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button
              onClick={handleGuestLogin}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: 'linear-gradient(135deg,#C05030,#802010)',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(192,80,48,0.4)',
              }}
            >
              Oyuna Gir
            </button>
          </div>
        )}

        {/* Account Tab */}
        {tab === 'account' && (
          <div className="space-y-3">
            {/* Saved profiles */}
            {state.savedProfiles.length > 0 && (
              <div className="space-y-2">
                <p className="font-mono-code text-xs text-slate-500 tracking-widest uppercase">
                  Kayıtlı Profiller
                </p>
                {state.savedProfiles.map(profile => (
                  <div
                    key={profile.id}
                    className="flex items-center gap-3 bg-white/5 border border-white/[0.08] rounded-xl px-3 py-2.5"
                  >
                    <AvatarDisplay avatarId={profile.avatarId} size="sm" />
                    <span className="flex-1 font-medium text-sm text-slate-200">{profile.name}</span>
                    <button
                      onClick={() => loginProfile(profile)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                      style={{
                        background: 'rgba(64,114,160,0.5)',
                        color: '#A0D0FF',
                        border: '1px solid rgba(64,114,160,0.4)',
                      }}
                    >
                      Seç
                    </button>
                    <button
                      onClick={() => deleteProfile(profile.id)}
                      className="text-xs text-slate-600 hover:text-red-400 transition-colors ml-1"
                      title="Sil"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New profile form toggle */}
            {!showNewForm && (
              <button
                onClick={() => setShowNewForm(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-white/15 text-sm text-slate-500 hover:text-slate-300 hover:border-white/25 transition-all"
              >
                + Yeni Profil Oluştur
              </button>
            )}

            {showNewForm && (
              <div className="space-y-3 border border-white/10 rounded-xl p-4 bg-black/10">
                <p className="font-mono-code text-xs text-slate-500 tracking-widest uppercase">
                  Yeni Profil
                </p>
                <input
                  type="text"
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setError(''); }}
                  maxLength={20}
                  placeholder="Profil adı..."
                  className="input-dark w-full text-sm"
                  autoFocus
                />
                <AvatarPicker selected={newAvatar} onSelect={setNewAvatar} />
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowNewForm(false)}
                    className="flex-1 py-2 rounded-lg border border-white/10 text-sm text-slate-500 hover:text-slate-300"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleCreateAccount}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,#3060A0,#1A3A70)' }}
                  >
                    Kaydet & Gir
                  </button>
                </div>
              </div>
            )}

            {state.savedProfiles.length === 0 && !showNewForm && (
              <p className="text-xs text-slate-600 text-center py-2">
                Henüz kayıtlı profil yok.
              </p>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-slate-700 font-mono-code tracking-wide text-center">
        25 KELİME · 9+8+7+1 · HOT-SEAT
      </p>
    </div>
  );
}
