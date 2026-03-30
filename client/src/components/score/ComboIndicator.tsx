import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/game.store';

export default function ComboIndicator() {
  const { comboFlash } = useGameStore();
  const [visible, setVisible] = useState(false);
  const [displayTeam, setDisplayTeam] = useState<'red' | 'blue'>('red');
  const [displayCombo, setDisplayCombo] = useState(0);

  useEffect(() => {
    for (const [team, combo] of Object.entries(comboFlash) as ['red' | 'blue', number][]) {
      if (combo >= 2) {
        setDisplayTeam(team);
        setDisplayCombo(combo);
        setVisible(true);
        const t = setTimeout(() => setVisible(false), 1600);
        return () => clearTimeout(t);
      }
    }
  }, [comboFlash]);

  if (!visible) return null;

  const isRed = displayTeam === 'red';
  const accentColor = isRed ? '#DC2626' : '#2563EB';
  const comboPoints = displayCombo >= 4 ? 3 : displayCombo === 3 ? 2 : 1;
  const labels = ['', '', 'ÇİFT', 'ÜÇLÜ', 'DÖRTLÜ'];
  const label = labels[Math.min(displayCombo, 4)] ?? 'MEGA';

  return (
    <div
      className="animate-combo-burst mb-3 px-8 py-3 rounded-xl text-center pointer-events-none"
      style={{
        background: `linear-gradient(135deg, ${isRed ? 'rgba(127,29,29,0.4)' : 'rgba(29,78,216,0.4)'}, rgba(0,0,0,0.6))`,
        border: `1px solid ${accentColor}60`,
        boxShadow: `0 0 30px ${accentColor}40, 0 8px 32px rgba(0,0,0,0.5)`,
      }}
    >
      <div
        className="font-display text-4xl leading-none tracking-wider"
        style={{ color: accentColor, textShadow: `0 0 20px ${accentColor}` }}
      >
        {label} KOMBO ×{displayCombo}
      </div>
      <div className="font-mono-code text-xs mt-1" style={{ color: `${accentColor}99` }}>
        +{comboPoints} BONUS PUAN
      </div>
    </div>
  );
}
