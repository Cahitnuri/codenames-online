import { useLocalGame } from '../../context/LocalGameContext';
import { AvatarDisplay } from '../../components/local/AvatarPicker';

export default function SetupPage() {
  const { state, updateSettings, startGame, logout } = useLocalGame();
  const { currentProfile, settings } = state;

  function handleSliderChange(key: 'clueTime' | 'guessTime', value: number) {
    updateSettings({ [key]: value });
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #8B4A22 0%, #3A1A08 100%)' }}
    >
      <div className="w-full max-w-md space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="font-display text-4xl mb-0.5">
            <span style={{ color: '#FF9070' }}>KOD</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
            <span style={{ color: '#70C0FF' }}>ADLAR</span>
          </div>
          <p className="font-mono-code text-xs text-slate-500 tracking-[0.2em] uppercase">Oyun Ayarları</p>
        </div>

        {/* Current player card */}
        {currentProfile && (
          <div className="glass-panel rounded-2xl px-5 py-4 flex items-center gap-4">
            <AvatarDisplay avatarId={currentProfile.avatarId} size="lg" />
            <div className="flex-1">
              <p className="font-bold text-lg text-white">{currentProfile.name}</p>
              <p className="text-xs text-slate-500 font-mono-code tracking-wide mt-0.5">
                {currentProfile.isGuest ? '🎭 Misafir' : '👤 Kayıtlı Hesap'}
              </p>
            </div>
            <button
              onClick={logout}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              Çıkış
            </button>
          </div>
        )}

        {/* Settings panel */}
        <div className="glass-panel rounded-2xl p-5 space-y-5">
          <p className="font-mono-code text-xs tracking-widest text-slate-500 uppercase">
            Oyun Kuralları
          </p>

          {/* Clue time */}
          <TimerSetting
            label="İpucu Verme Süresi"
            description="Casusun ipucu vermesi için verilen süre"
            value={settings.clueTime}
            onChange={v => handleSliderChange('clueTime', v)}
          />

          {/* Guess time */}
          <TimerSetting
            label="Tahmin Süresi"
            description="Operatörlerin tahmin yapması için verilen süre"
            value={settings.guessTime}
            onChange={v => handleSliderChange('guessTime', v)}
          />

          {/* Bonus guess toggle */}
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-200">Bonus Tahmin Hakkı</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Aktifse: ipucu sayısı + 1 tahmin hakkı verilir (standart kural)
              </p>
            </div>
            <Toggle
              checked={settings.bonusGuess}
              onChange={v => updateSettings({ bonusGuess: v })}
            />
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startGame}
          className="w-full py-4 rounded-2xl font-display text-2xl tracking-widest transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg,#C05030 0%,#903020 100%)',
            color: '#fff',
            boxShadow: '0 6px 24px rgba(192,80,48,0.45)',
          }}
        >
          OYUNU BAŞLAT
        </button>
      </div>
    </div>
  );
}

function TimerSetting({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const displayValue = value === 0 ? '∞' : `${value}s`;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <p className="text-sm font-semibold text-slate-200">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
        <span className="font-mono-code text-base font-bold text-white min-w-[40px] text-right">
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={180}
        step={10}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-orange-500 cursor-pointer"
        style={{ height: '4px' }}
      />
      <div className="flex justify-between text-xs text-slate-600 mt-1 font-mono-code">
        <span>∞</span>
        <span>30s</span>
        <span>60s</span>
        <span>90s</span>
        <span>120s</span>
        <span>180s</span>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${
        checked ? 'bg-orange-500' : 'bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
