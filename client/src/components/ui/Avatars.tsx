import React from 'react';

const AvatarBase = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
    {children}
  </svg>
);

export const Avatars: Record<string, React.FC> = {
  Cat: () => (
    <AvatarBase>
      <path d="M20 40 L50 20 L80 40 L80 80 L20 80 Z" fill="#D4A373" />
      <circle cx="38" cy="55" r="8" fill="none" stroke="#333" strokeWidth="2.5" />
      <circle cx="62" cy="55" r="8" fill="none" stroke="#333" strokeWidth="2.5" />
      <path d="M46 55 H54" stroke="#333" strokeWidth="2" />
      <path d="M42 85 L58 85 L50 75 Z" fill="#1a1a1a" />
    </AvatarBase>
  ),
  Goat: () => (
    <AvatarBase>
      <path d="M30 35 L70 35 L65 85 L35 85 Z" fill="#CBD5E0" />
      <rect x="42" y="10" width="16" height="20" fill="#333" />
      <circle cx="65" cy="50" r="9" fill="none" stroke="#333" strokeWidth="2" />
      <path d="M74 50 L80 70" stroke="#333" strokeWidth="1.5" />
      <path d="M45 85 L55 85 L50 95 Z" fill="#E2E8F0" />
    </AvatarBase>
  ),
  Giraffe: () => (
    <AvatarBase>
      <path d="M40 20 L60 20 L65 80 L35 80 Z" fill="#E9C46A" />
      <circle cx="42" cy="45" r="7" fill="none" stroke="#333" strokeWidth="3" />
      <circle cx="58" cy="45" r="7" fill="none" stroke="#333" strokeWidth="3" />
      <path d="M45 85 L55 85 L50 78 Z" fill="#457B9D" />
    </AvatarBase>
  ),
  Lion: () => (
    <AvatarBase>
      <path d="M20 50 Q20 20 50 20 Q80 20 80 50 Q80 80 50 80 Q20 80 20 50" fill="#F4A261" />
      <circle cx="50" cy="50" r="25" fill="#E9C46A" />
      <path d="M42 85 L58 85 L50 75 Z" fill="#1a1a1a" />
    </AvatarBase>
  ),
  Panda: () => (
    <AvatarBase>
      <circle cx="50" cy="55" r="35" fill="#E2E8F0" />
      <circle cx="35" cy="50" r="12" fill="#333" />
      <circle cx="65" cy="50" r="12" fill="#333" />
      <path d="M40 30 L60 30 L55 22 L45 22 Z" fill="#E76F51" />
      <path d="M42 85 L58 85 L50 75 Z" fill="#1a1a1a" />
    </AvatarBase>
  ),
  Rabbit: () => (
    <AvatarBase>
      <path d="M35 10 Q35 40 45 50 M65 10 Q65 40 55 50" stroke="#CBD5E0" strokeWidth="12" strokeLinecap="round" />
      <circle cx="50" cy="65" r="25" fill="#CBD5E0" />
      <path d="M40 85 L60 85 L50 95 Z" fill="#F4A261" />
    </AvatarBase>
  ),
  Fox: () => (
    <AvatarBase>
      <path d="M20 40 L50 80 L80 40 Z" fill="#E76F51" />
      <circle cx="60" cy="50" r="10" fill="none" stroke="#333" strokeWidth="2.5" />
      <path d="M60 60 L60 75 L50 80" stroke="#333" strokeWidth="4" fill="none" />
    </AvatarBase>
  ),
  Bear: () => (
    <AvatarBase>
      <rect x="25" y="40" width="50" height="50" rx="10" fill="#6D4C41" />
      <circle cx="38" cy="60" r="7" fill="none" stroke="#1a1a1a" strokeWidth="2" />
      <circle cx="62" cy="60" r="7" fill="none" stroke="#1a1a1a" strokeWidth="2" />
      <path d="M40 75 Q50 85 60 75" fill="none" stroke="#1a1a1a" strokeWidth="2" />
    </AvatarBase>
  ),
  Donkey: () => (
    <AvatarBase>
      <path d="M35 20 L65 20 L60 85 L40 85 Z" fill="#94A3B8" />
      <circle cx="40" cy="55" r="7" fill="none" stroke="#333" strokeWidth="2" />
      <circle cx="60" cy="55" r="7" fill="none" stroke="#333" strokeWidth="2" />
      <path d="M42 88 L58 88 L50 80 Z" fill="#E76F51" />
    </AvatarBase>
  ),
  Raccoon: () => (
    <AvatarBase>
      <path d="M25 40 L75 40 L70 80 L30 80 Z" fill="#6B7280" />
      <path d="M25 50 H75" stroke="#333" strokeWidth="15" opacity="0.5" />
      <circle cx="65" cy="55" r="8" fill="none" stroke="#333" strokeWidth="2" />
      <path d="M42 15 L58 15 L55 35 L45 35 Z" fill="#333" />
    </AvatarBase>
  ),
  Owl: () => (
    <AvatarBase>
      <circle cx="50" cy="55" r="30" fill="#A1887F" />
      <circle cx="40" cy="55" r="10" fill="none" stroke="#457B9D" strokeWidth="3" />
      <circle cx="60" cy="55" r="10" fill="none" stroke="#457B9D" strokeWidth="3" />
      <path d="M45 85 L55 85 L50 78 Z" fill="#1a1a1a" />
    </AvatarBase>
  ),
  Wolf: () => (
    <AvatarBase>
      <path d="M30 40 L50 20 L70 40 L65 85 L35 85 Z" fill="#94A3B8" />
      <rect x="42" y="10" width="16" height="20" fill="#333" />
      <path d="M40 88 L60 88 L50 80 Z" fill="#E76F51" />
    </AvatarBase>
  ),
  Elephant: () => (
    <AvatarBase>
      <path d="M20 50 Q20 30 50 30 Q80 30 80 50" fill="#94A3B8" />
      <path d="M45 50 L45 80 Q45 90 35 90" stroke="#94A3B8" strokeWidth="8" fill="none" />
      <path d="M35 35 L65 35 L60 25 L40 25 Z" fill="#333" />
    </AvatarBase>
  ),
  Chicken: () => (
    <AvatarBase>
      <path d="M35 40 L65 40 L60 85 L40 85 Z" fill="#E2E8F0" />
      <path d="M50 20 V40" stroke="#E76F51" strokeWidth="8" strokeLinecap="round" />
      <circle cx="38" cy="55" r="7" fill="none" stroke="#333" strokeWidth="2.5" />
      <circle cx="62" cy="55" r="7" fill="none" stroke="#333" strokeWidth="2.5" />
      <path d="M42 88 L58 88 L50 80 Z" fill="#1a1a1a" />
    </AvatarBase>
  ),
  Tiger: () => (
    <AvatarBase>
      <circle cx="50" cy="55" r="30" fill="#E67E22" />
      <path d="M30 55 H40 M60 55 H70" stroke="#333" strokeWidth="4" />
      <rect x="42" y="20" width="16" height="10" fill="#333" />
      <path d="M60 75 L60 85 L50 88" stroke="#333" strokeWidth="4" fill="none" />
    </AvatarBase>
  ),
  Sheep: () => (
    <AvatarBase>
      <path d="M30 40 Q50 20 70 40 Q85 60 70 80 Q50 95 30 80 Q15 60 30 40" fill="#F1F5F9" />
      <circle cx="45" cy="55" r="8" fill="none" stroke="#333" strokeWidth="2" />
      <path d="M35 15 L65 15 L60 30 L40 30 Z" fill="#333" />
    </AvatarBase>
  ),
};

export const AvatarList = Object.keys(Avatars);

export function AvatarDisplay({ name, size = 28 }: { name: string; size?: number }) {
  const Component = Avatars[name];
  if (!Component) return null;
  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <Component />
    </div>
  );
}
