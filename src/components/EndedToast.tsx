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
  const dotClass = disconnected ? 'phonon-toast-dot--disconnected' : 'phonon-toast-dot--ended';

  return (
    <div className="phonon-toast">
      <div className="phonon-toast-top">
        <div className={`phonon-toast-dot ${dotClass}`} />
        <div className="phonon-toast-info">
          <span className="phonon-toast-number">{phoneNumber}</span>
          <span className="phonon-toast-name">{subtitle}</span>
        </div>
        <span className="phonon-toast-timer">{fmt(duration)}</span>
      </div>
      <div className="phonon-toast-buttons">
        <button className="phonon-toast-btn phonon-toast-btn--success" onClick={onRedial} type="button">
          <Phone size={16} /> <span>Redial</span>
        </button>
        <button className="phonon-toast-btn" onClick={onClose} type="button">
          <span>Close</span>
        </button>
      </div>
    </div>
  );
}
