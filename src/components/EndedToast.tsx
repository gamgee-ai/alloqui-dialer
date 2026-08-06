import { Phone } from 'lucide-react';

function fmt(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

interface Props {
  phoneNumber: string;
  contactName: string | null;
  duration: number;
  disconnected: boolean;
  onRedial: () => void;
  onClose: () => void;
}

export function EndedToast({ phoneNumber, contactName, duration, disconnected, onRedial, onClose }: Props) {
  const label = disconnected ? 'Disconnected' : 'Call ended';
  const subtitle = contactName ? `${label} · ${contactName}` : label;
  const dotClass = disconnected ? 'alloqui-toast-dot--disconnected' : 'alloqui-toast-dot--ended';

  return (
    <div className="alloqui-toast">
      <div className="alloqui-toast-top">
        <div className={`alloqui-toast-dot ${dotClass}`} />
        <div className="alloqui-toast-info">
          <span className="alloqui-toast-number">{phoneNumber}</span>
          <span className="alloqui-toast-name">{subtitle}</span>
        </div>
        <span className="alloqui-toast-timer">{fmt(duration)}</span>
      </div>
      <div className="alloqui-toast-buttons">
        <button className="alloqui-toast-btn alloqui-toast-btn--success" onClick={onRedial} type="button">
          <Phone size={16} /> <span>Redial</span>
        </button>
        <button className="alloqui-toast-btn" onClick={onClose} type="button">
          <span>Close</span>
        </button>
      </div>
    </div>
  );
}
