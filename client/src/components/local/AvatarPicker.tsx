import { AVATARS, getAvatar } from '../../data/avatars';

interface AvatarPickerProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
      {AVATARS.map(avatar => (
        <button
          key={avatar.id}
          type="button"
          onClick={() => onSelect(avatar.id)}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-150 ${
            selected === avatar.id
              ? 'border-white/60 scale-105 shadow-lg'
              : 'border-transparent opacity-65 hover:opacity-100 hover:border-white/20'
          }`}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md relative"
            style={{ background: avatar.gradient }}
          >
            <span>{avatar.emoji}</span>
            <span className="absolute bottom-0 right-0 text-sm leading-none">{avatar.accessory}</span>
          </div>
          <span className="text-xs font-medium text-slate-400 truncate w-full text-center">
            {avatar.name}
          </span>
        </button>
      ))}
    </div>
  );
}

interface AvatarDisplayProps {
  avatarId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarDisplay({ avatarId, size = 'md', className = '' }: AvatarDisplayProps) {
  const avatar = getAvatar(avatarId);
  const sizes = { sm: 'w-8 h-8 text-lg', md: 'w-12 h-12 text-2xl', lg: 'w-20 h-20 text-4xl' };
  return (
    <div
      className={`${sizes[size]} rounded-2xl flex items-center justify-center relative shadow-lg ${className}`}
      style={{ background: avatar.gradient }}
    >
      <span>{avatar.emoji}</span>
      <span
        className="absolute bottom-0 right-0 leading-none"
        style={{ fontSize: size === 'sm' ? '10px' : size === 'lg' ? '18px' : '13px' }}
      >
        {avatar.accessory}
      </span>
    </div>
  );
}
