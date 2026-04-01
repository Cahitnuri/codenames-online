// Spy-themed card illustrations shown when a word is revealed.
// Parametric approach: each character is defined as data, rendered by a shared Face component.

interface CharDef {
  bg1: string; bg2: string;
  skin: string; hair: string;
  hairType: 'short' | 'long' | 'bald' | 'hat' | 'curly' | 'white' | 'hood';
  eye: 'normal' | 'glasses' | 'shades' | 'patch';
  extra: 'none' | 'beard' | 'mustache' | 'scar';
  body: string;
}

const CHARS: CharDef[] = [
  // 0 Dark agent
  { bg1:'#1B263B', bg2:'#0D1B2A', skin:'#C68B6E', hair:'#1a1a1a', hairType:'short', eye:'shades', extra:'none', body:'#1C2541' },
  // 1 Female red agent
  { bg1:'#3B1414', bg2:'#1a0808', skin:'#F4DCCA', hair:'#1a1a1a', hairType:'long', eye:'normal', extra:'none', body:'#8B1A1A' },
  // 2 Bald villain
  { bg1:'#111827', bg2:'#0a0a0a', skin:'#8B5E3C', hair:'#333', hairType:'bald', eye:'normal', extra:'scar', body:'#1F2937' },
  // 3 Old man spy
  { bg1:'#1E3A5F', bg2:'#0F1F33', skin:'#D4956A', hair:'#CCC', hairType:'white', eye:'glasses', extra:'none', body:'#2C4A6E' },
  // 4 Young woman agent
  { bg1:'#1A3A2A', bg2:'#0D1F15', skin:'#F0C8A0', hair:'#5D3A1A', hairType:'long', eye:'normal', extra:'none', body:'#1F4A2A' },
  // 5 Hooded figure
  { bg1:'#1A1A2E', bg2:'#0a0a16', skin:'#5D3A1A', hair:'#333', hairType:'hood', eye:'normal', extra:'none', body:'#16213E' },
  // 6 Blonde woman
  { bg1:'#2E1B0E', bg2:'#1a0e08', skin:'#F4DCCA', hair:'#C8A96E', hairType:'long', eye:'normal', extra:'none', body:'#4A2C14' },
  // 7 Glasses + mustache
  { bg1:'#0F2027', bg2:'#090F13', skin:'#D4A06A', hair:'#1a1a1a', hairType:'short', eye:'glasses', extra:'mustache', body:'#203A43' },
  // 8 Curly hair
  { bg1:'#2D1B4E', bg2:'#1a0a33', skin:'#3D2314', hair:'#1a1a1a', hairType:'curly', eye:'normal', extra:'none', body:'#3B2068' },
  // 9 Woman sunglasses
  { bg1:'#1B3B3B', bg2:'#0D2020', skin:'#F4DCCA', hair:'#8B1A1A', hairType:'short', eye:'shades', extra:'none', body:'#1F4F4F' },
  // 10 Man with scar
  { bg1:'#2A1A0D', bg2:'#160D08', skin:'#C88B56', hair:'#333', hairType:'short', eye:'normal', extra:'scar', body:'#3D2810' },
  // 11 Old woman handler
  { bg1:'#1F1F3B', bg2:'#0F0F20', skin:'#D4A06A', hair:'#AAA', hairType:'white', eye:'glasses', extra:'none', body:'#2A2A50' },
  // 12 Military cap
  { bg1:'#1A2A1A', bg2:'#0D160D', skin:'#8B5E3C', hair:'#1a1a1a', hairType:'hat', eye:'normal', extra:'none', body:'#2A3D2A' },
  // 13 Red hair woman
  { bg1:'#1F0D0D', bg2:'#100808', skin:'#F4DCCA', hair:'#7B1C1C', hairType:'long', eye:'normal', extra:'none', body:'#2D1414' },
  // 14 Eye patch
  { bg1:'#0D0D1F', bg2:'#08080F', skin:'#C68B56', hair:'#1a1a1a', hairType:'short', eye:'patch', extra:'beard', body:'#1a1a2e' },
  // 15 Bearded man
  { bg1:'#1A2A3B', bg2:'#0D1520', skin:'#D4956A', hair:'#5D3A1A', hairType:'short', eye:'normal', extra:'beard', body:'#1F3550' },
  // 16 Analyst glasses
  { bg1:'#0D1F0D', bg2:'#080F08', skin:'#F0C8A0', hair:'#333', hairType:'short', eye:'glasses', extra:'none', body:'#1A3520' },
  // 17 Snowman (neutral)
  { bg1:'#B0C4DE', bg2:'#8FACCF', skin:'#FFFFFF', hair:'#888', hairType:'hat', eye:'normal', extra:'none', body:'#FFFFFF' },
  // 18 Shadow / assassin-ish
  { bg1:'#0a0a0a', bg2:'#000000', skin:'#1a1a1a', hair:'#000', hairType:'hood', eye:'shades', extra:'none', body:'#111' },
  // 19 Dog (neutral)
  { bg1:'#C8A97E', bg2:'#A08060', skin:'#D4A373', hair:'#8B6340', hairType:'short', eye:'normal', extra:'none', body:'#D4A373' },
  // 20 Techy agent
  { bg1:'#001F3F', bg2:'#00111F', skin:'#C68B6E', hair:'#1a1a1a', hairType:'short', eye:'glasses', extra:'none', body:'#003366' },
  // 21 Stern woman
  { bg1:'#2A0A2A', bg2:'#150515', skin:'#F4DCCA', hair:'#1a1a1a', hairType:'short', eye:'normal', extra:'none', body:'#4A1A4A' },
  // 22 Veteran
  { bg1:'#1F1500', bg2:'#0F0B00', skin:'#C88B56', hair:'#888', hairType:'white', eye:'normal', extra:'mustache', body:'#3D2A00' },
  // 23 Young recruit
  { bg1:'#003333', bg2:'#001A1A', skin:'#F0C8A0', hair:'#5D3A1A', hairType:'curly', eye:'normal', extra:'none', body:'#006666' },
  // 24 Commander hat
  { bg1:'#0D1A2E', bg2:'#080D16', skin:'#D4956A', hair:'#333', hairType:'hat', eye:'shades', extra:'mustache', body:'#1A2D50' },
];

function Face({ c, idx }: { c: CharDef; idx: number }) {
  const id = `bg${idx}`;
  const cx = 110;

  // Hair rendering
  const renderHair = () => {
    if (c.hairType === 'bald') {
      // Stubble dots
      return <circle cx={cx} cy={52} r={28} fill={c.skin} />;
    }
    if (c.hairType === 'hood') {
      return (
        <>
          <ellipse cx={cx} cy={52} rx={29} ry={30} fill="#222" />
          <ellipse cx={cx} cy={56} rx={22} ry={24} fill={c.skin} />
        </>
      );
    }
    if (c.hairType === 'hat') {
      return (
        <>
          <circle cx={cx} cy={56} r={26} fill={c.skin} />
          <rect x={cx - 30} y={26} width={60} height={10} rx={4} fill={c.hair} />
          <rect x={cx - 22} y={16} width={44} height={20} rx={4} fill={c.hair} />
        </>
      );
    }
    if (c.hairType === 'long') {
      return (
        <>
          <path d={`M${cx-22} 36 Q${cx-34} 70 ${cx-28} 90`} stroke={c.hair} strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d={`M${cx+22} 36 Q${cx+34} 70 ${cx+28} 90`} stroke={c.hair} strokeWidth={14} fill="none" strokeLinecap="round" />
          <circle cx={cx} cy={56} r={26} fill={c.skin} />
          <rect x={cx - 26} y={30} width={52} height={18} rx={4} fill={c.hair} />
        </>
      );
    }
    if (c.hairType === 'white') {
      return (
        <>
          <circle cx={cx} cy={56} r={26} fill={c.skin} />
          <rect x={cx - 26} y={30} width={52} height={16} rx={8} fill={c.hair} />
        </>
      );
    }
    if (c.hairType === 'curly') {
      return (
        <>
          <circle cx={cx} cy={56} r={26} fill={c.skin} />
          {[cx-20, cx-10, cx, cx+10, cx+20].map((x, i) => (
            <circle key={i} cx={x} cy={32} r={9} fill={c.hair} />
          ))}
        </>
      );
    }
    // Default: short
    return (
      <>
        <circle cx={cx} cy={56} r={26} fill={c.skin} />
        <rect x={cx - 26} y={30} width={52} height={14} rx={5} fill={c.hair} />
      </>
    );
  };

  // Eye rendering
  const renderEyes = () => {
    if (c.eye === 'shades') {
      return <rect x={cx - 20} y={52} width={40} height={8} rx={3} fill="#1a1a1a" />;
    }
    if (c.eye === 'glasses') {
      return (
        <>
          <circle cx={cx - 9} cy={56} r={6} fill="none" stroke="#555" strokeWidth={1.5} />
          <circle cx={cx + 9} cy={56} r={6} fill="none" stroke="#555" strokeWidth={1.5} />
          <path d={`M${cx - 3} 56 H${cx + 3}`} stroke="#555" strokeWidth={1.5} />
          <circle cx={cx - 9} cy={56} r={2.5} fill="#1a1a1a" />
          <circle cx={cx + 9} cy={56} r={2.5} fill="#1a1a1a" />
        </>
      );
    }
    if (c.eye === 'patch') {
      return (
        <>
          <circle cx={cx - 9} cy={56} r={3} fill="#1a1a1a" />
          <rect x={cx + 3} y={50} width={13} height={10} rx={2} fill="#1a1a1a" />
        </>
      );
    }
    return (
      <>
        <circle cx={cx - 9} cy={56} r={3} fill="#1a1a1a" />
        <circle cx={cx + 9} cy={56} r={3} fill="#1a1a1a" />
      </>
    );
  };

  // Extra feature
  const renderExtra = () => {
    if (c.extra === 'beard') {
      return <ellipse cx={cx} cy={74} rx={16} ry={9} fill={c.hair} opacity={0.7} />;
    }
    if (c.extra === 'mustache') {
      return <path d={`M${cx - 10} 67 Q${cx} 72 ${cx + 10} 67`} stroke={c.hair} strokeWidth={3} fill="none" strokeLinecap="round" />;
    }
    if (c.extra === 'scar') {
      return <path d={`M${cx + 12} 52 L${cx + 8} 68`} stroke="#8B2020" strokeWidth={2} strokeLinecap="round" />;
    }
    return null;
  };

  const isSnowman = idx === 17;
  const isDog = idx === 19;

  if (isSnowman) {
    return (
      <svg viewBox="0 0 220 140" className="w-full h-full">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.bg1} />
            <stop offset="100%" stopColor={c.bg2} />
          </linearGradient>
        </defs>
        <rect width="220" height="140" fill={`url(#${id})`} />
        <rect x="0" y="0" width="25" height="140" fill="rgba(0,0,0,0.25)" />
        <rect x="195" y="0" width="25" height="140" fill="rgba(0,0,0,0.25)" />
        {/* Snow ground */}
        <ellipse cx="110" cy="135" rx="60" ry="12" fill="rgba(255,255,255,0.3)" />
        {/* Body */}
        <circle cx="110" cy="110" r="22" fill="white" />
        {/* Head */}
        <circle cx="110" cy="72" r="18" fill="white" />
        {/* Hat */}
        <rect x="95" y="50" width="30" height="6" rx="2" fill="#1a1a1a" />
        <rect x="100" y="34" width="20" height="18" rx="2" fill="#1a1a1a" />
        {/* Eyes */}
        <circle cx="104" cy="68" r="2.5" fill="#333" />
        <circle cx="116" cy="68" r="2.5" fill="#333" />
        {/* Nose */}
        <path d="M110 72 L106 76 L114 76 Z" fill="#E76F51" />
        {/* Scarf */}
        <path d="M95 86 Q110 90 125 86" stroke="#E76F51" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Buttons */}
        <circle cx="110" cy="102" r="2" fill="#888" />
        <circle cx="110" cy="110" r="2" fill="#888" />
        <circle cx="110" cy="118" r="2" fill="#888" />
      </svg>
    );
  }

  if (isDog) {
    return (
      <svg viewBox="0 0 220 140" className="w-full h-full">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.bg1} />
            <stop offset="100%" stopColor={c.bg2} />
          </linearGradient>
        </defs>
        <rect width="220" height="140" fill={`url(#${id})`} />
        <rect x="0" y="0" width="25" height="140" fill="rgba(0,0,0,0.15)" />
        <rect x="195" y="0" width="25" height="140" fill="rgba(0,0,0,0.15)" />
        {/* Body */}
        <ellipse cx="110" cy="108" rx="35" ry="22" fill={c.skin} />
        {/* Head */}
        <circle cx="110" cy="68" r="26" fill={c.skin} />
        {/* Ears */}
        <ellipse cx="86" cy="58" rx="10" ry="16" fill={c.hair} />
        <ellipse cx="134" cy="58" rx="10" ry="16" fill={c.hair} />
        {/* Eyes */}
        <circle cx="101" cy="64" r="4" fill="#1a1a1a" />
        <circle cx="119" cy="64" r="4" fill="#1a1a1a" />
        <circle cx="102" cy="63" r="1.5" fill="white" />
        <circle cx="120" cy="63" r="1.5" fill="white" />
        {/* Nose */}
        <ellipse cx="110" cy="74" rx="7" ry="5" fill="#1a1a1a" />
        {/* Mouth */}
        <path d="M103 78 Q110 85 117 78" fill="none" stroke="#1a1a1a" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 220 140" className="w-full h-full">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.bg1} />
          <stop offset="100%" stopColor={c.bg2} />
        </linearGradient>
      </defs>
      {/* Background */}
      <rect width="220" height="140" fill={`url(#${id})`} />
      {/* Side wall shadows */}
      <rect x="0" y="0" width="30" height="140" fill="rgba(0,0,0,0.25)" />
      <rect x="190" y="0" width="30" height="140" fill="rgba(0,0,0,0.25)" />
      {/* Subtle floor line */}
      <line x1="30" y1="125" x2="190" y2="125" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* Body / shoulders */}
      <path
        d={`M${cx - 45} 140 L${cx - 45} 100 Q${cx - 45} 90 ${cx - 30} 88 L${cx} 85 L${cx + 30} 88 Q${cx + 45} 90 ${cx + 45} 100 L${cx + 45} 140 Z`}
        fill={c.body}
      />
      <path
        d={`M${cx - 45} 140 L${cx - 45} 110 Q${cx - 20} 108 ${cx} 105 Q${cx + 20} 108 ${cx + 45} 110 L${cx + 45} 140 Z`}
        fill="rgba(0,0,0,0.2)"
      />

      {/* Neck */}
      <rect x={cx - 8} y={80} width={16} height={14} rx={4} fill={c.skin} />

      {/* Hair (rendered behind face for some types) */}
      {c.hairType !== 'hood' && renderHair()}

      {/* Mouth / expression */}
      <path
        d={`M${cx - 8} 68 Q${cx} 73 ${cx + 8} 68`}
        fill="none"
        stroke={c.skin === '#FFFFFF' ? '#aaa' : 'rgba(0,0,0,0.35)'}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Eyes */}
      {renderEyes()}

      {/* Extra feature (beard, mustache, scar) */}
      {renderExtra()}

      {/* Nose */}
      <ellipse cx={cx} cy={63} rx={3} ry={2.5} fill="rgba(0,0,0,0.18)" />
    </svg>
  );
}

export default function CardIllustration({ cardId }: { cardId: number }) {
  const idx = cardId % CHARS.length;
  const c = CHARS[idx];
  if (!c) return null;
  return <Face c={c} idx={idx} />;
}
