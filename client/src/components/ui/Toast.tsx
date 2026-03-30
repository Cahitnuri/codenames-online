import { cn } from '../../utils/cn';

interface ToastProps {
  toast: {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  };
}

const STYLES: Record<string, { border: string; bg: string; color: string; icon: string }> = {
  info:    { border: '#374151', bg: 'rgba(17,24,39,0.95)',  color: '#9CA3AF', icon: 'ℹ' },
  success: { border: '#166534', bg: 'rgba(5,46,22,0.95)',   color: '#4ADE80', icon: '✓' },
  warning: { border: '#92400E', bg: 'rgba(55,23,4,0.95)',   color: '#FB923C', icon: '⚠' },
  error:   { border: '#7F1D1D', bg: 'rgba(55,7,7,0.95)',    color: '#F87171', icon: '✕' },
};

export default function Toast({ toast }: ToastProps) {
  const s = STYLES[toast.type] ?? STYLES['info']!;
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-lg animate-slide-in pointer-events-auto max-w-xs"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        backdropFilter: 'blur(12px)',
        color: s.color,
      }}
    >
      <span className="font-mono-code text-xs shrink-0">{s.icon}</span>
      <span className="font-body">{toast.message}</span>
    </div>
  );
}
