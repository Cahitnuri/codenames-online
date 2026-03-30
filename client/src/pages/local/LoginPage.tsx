import { useState } from 'react';
import { useLocalGame } from '../../context/LocalGameContext';
import AvatarPicker, { AvatarDisplay } from '../../components/local/AvatarPicker';
import { AVATARS } from '../../data/avatars';

type Tab = 'guest' | 'account';
type AccountMode = 'signin' | 'signup';

export default function LoginPage() {
  const {
    state, authLoading, authError,
    loginAsGuest, signUpWithEmail, signInWithEmail,
  } = useLocalGame();

  const [tab, setTab]               = useState<Tab>('guest');
  const [accountMode, setAccountMode] = useState<AccountMode>('signin');

  // Guest fields
  const [guestName, setGuestName]   = useState('');
  const [guestAvatar, setGuestAvatar] = useState(AVATARS[0]?.id ?? 'kedi');
  const [localError, setLocalError]   = useState('');

  // Account fields
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupAvatar, setSignupAvatar] = useState(AVATARS[0]?.id ?? 'kedi');

  const displayError = localError || authError;

  function handleGuestLogin() {
    if (!guestName.trim()) { setLocalError('Bir isim gir'); return; }
    setLocalError('');
    loginAsGuest(guestName.trim(), guestAvatar);
  }

  async function handleSignIn() {
    if (!email.trim() || !password) { setLocalError('E-posta ve şifreyi gir'); return; }
    setLocalError('');
    await signInWithEmail(email.trim(), password);
  }

  async function handleSignUp() {
    if (!signupName.trim()) { setLocalError('İsim gir'); return; }
    if (!email.trim())      { setLocalError('E-posta gir'); return; }
    if (password.length < 6) { setLocalError('Şifre en az 6 karakter olmalı'); return; }
    if (password !== confirmPassword) { setLocalError('Şifreler eşleşmiyor'); return; }
    setLocalError('');
    await signUpWithEmail(email.trim(), password, signupName.trim(), signupAvatar);
  }

  const isLoading = authLoading && state.appPhase === 'login';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #8B4A22 0%, #3A1A08 100%)' }}
    >
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(200,100,50,.6) 0%,transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(100,150,200,.5) 0%,transparent 70%)' }} />

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="font-display text-6xl mb-1">
          <span style={{ color: '#FF9070' }}>KOD</span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
          <span style={{ color: '#70C0FF' }}>ADLAR</span>
        </div>
        <p className="font-mono-code text-xs tracking-[0.25em] text-slate-500 uppercase mt-1">
          Türkçe Yerel Oyun
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm glass-panel rounded-2xl p-6 space-y-5">

        {/* Tab switcher */}
        <div className="flex rounded-xl overflow-hidden border border-white/10 p-0.5 bg-black/20">
          {(['guest', 'account'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setLocalError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                tab === t ? 'bg-white/12 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'guest' ? '🎭 Misafir' : '👤 Hesabım'}
            </button>
          ))}
        </div>

        {/* ── GUEST TAB ── */}
        {tab === 'guest' && (
          <div className="space-y-4">
            <div>
              <label className="block font-mono-code text-xs tracking-widest text-slate-500 uppercase mb-1.5">
                Takma Ad
              </label>
              <input
                type="text"
                value={guestName}
                onChange={e => { setGuestName(e.target.value); setLocalError(''); }}
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
            {displayError && <ErrorMsg text={displayError} />}
            <button
              onClick={handleGuestLogin}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.01] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#C05030,#802010)', boxShadow: '0 4px 16px rgba(192,80,48,.4)' }}
            >
              Misafir Olarak Gir
            </button>
          </div>
        )}

        {/* ── ACCOUNT TAB ── */}
        {tab === 'account' && (
          <div className="space-y-4">

            {/* Mode toggle: sign in / sign up */}
            <div className="flex rounded-lg overflow-hidden border border-white/8 p-0.5 bg-black/15">
              {(['signin', 'signup'] as AccountMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => { setAccountMode(m); setLocalError(''); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    accountMode === m ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {m === 'signin' ? 'Giriş Yap' : 'Kayıt Ol'}
                </button>
              ))}
            </div>

            {/* Sign up extras */}
            {accountMode === 'signup' && (
              <>
                <div>
                  <label className="block font-mono-code text-xs tracking-widest text-slate-500 uppercase mb-1.5">
                    Görünen Ad
                  </label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={e => { setSignupName(e.target.value); setLocalError(''); }}
                    maxLength={20}
                    placeholder="Adın..."
                    className="input-dark w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block font-mono-code text-xs tracking-widest text-slate-500 uppercase mb-2">
                    Avatar Seç
                  </label>
                  <AvatarPicker selected={signupAvatar} onSelect={setSignupAvatar} />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block font-mono-code text-xs tracking-widest text-slate-500 uppercase mb-1.5">
                E-Posta
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setLocalError(''); }}
                onKeyDown={e => e.key === 'Enter' && (accountMode === 'signin' ? handleSignIn() : handleSignUp())}
                placeholder="ornek@mail.com"
                className="input-dark w-full text-sm"
                autoFocus={tab === 'account'}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-mono-code text-xs tracking-widest text-slate-500 uppercase mb-1.5">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setLocalError(''); }}
                onKeyDown={e => e.key === 'Enter' && (accountMode === 'signin' ? handleSignIn() : handleSignUp())}
                placeholder={accountMode === 'signup' ? 'En az 6 karakter' : '••••••'}
                className="input-dark w-full text-sm"
              />
            </div>

            {/* Confirm password (signup only) */}
            {accountMode === 'signup' && (
              <div>
                <label className="block font-mono-code text-xs tracking-widest text-slate-500 uppercase mb-1.5">
                  Şifre Tekrar
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setLocalError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSignUp()}
                  placeholder="••••••"
                  className="input-dark w-full text-sm"
                />
              </div>
            )}

            {displayError && <ErrorMsg text={displayError} />}

            {/* Submit button */}
            <button
              onClick={accountMode === 'signin' ? handleSignIn : handleSignUp}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#3060A0,#1A3A70)', boxShadow: '0 4px 16px rgba(48,96,160,.4)' }}
            >
              {isLoading ? (
                <><Spinner /> İşleniyor...</>
              ) : (
                accountMode === 'signin' ? 'Giriş Yap' : 'Hesap Oluştur'
              )}
            </button>

            {/* Supabase email confirmation note */}
            {accountMode === 'signup' && (
              <p className="text-xs text-slate-600 text-center font-mono-code leading-relaxed">
                Kayıt sonrası e-posta onayı gerekebilir.
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

function ErrorMsg({ text }: { text: string }) {
  return (
    <div className="rounded-lg px-3 py-2 bg-red-950/40 border border-red-900/40">
      <p className="text-xs text-red-400 text-center">{text}</p>
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
