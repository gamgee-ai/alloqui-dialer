import { Mic, MicOff, Pause, PhoneOff } from 'lucide-react';

function fmt(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

interface Props {
  phoneNumber: string;
  contactName: string | null;
  duration: number;
  muted: boolean;
  held: boolean;
  onToggleMute: () => void;
  onToggleHold: () => void;
  onHangup: () => void;
}

export function CallToast({ phoneNumber, contactName, duration, muted, held, onToggleMute, onToggleHold, onHangup }: Props) {
  return (
    <div className="phonon-toast">
      <div className="phonon-toast-top">
        <div className={`phonon-toast-dot ${muted ? 'phonon-toast-dot--muted' : 'phonon-toast-dot--connected'}`} />
        <div className="phonon-toast-info">
          <span className="phonon-toast-number">{phoneNumber}</span>
          <span className="phonon-toast-name">{contactName ?? 'Unknown'}</span>
        </div>
        <span className="phonon-toast-timer">{fmt(duration)}</span>
      </div>
      <div className="phonon-toast-buttons">
        <button className={`phonon-toast-btn ${muted ? 'phonon-toast-btn--active' : ''}`} onClick={onToggleMute} type="button">
          {muted ? <MicOff size={16} /> : <Mic size={16} />} <span>Mute</span>
        </button>
        <button className={`phonon-toast-btn ${held ? 'phonon-toast-btn--active' : ''}`} onClick={onToggleHold} type="button">
          <Pause size={16} /> <span>Hold</span>
        </button>
        <button className="phonon-toast-btn phonon-toast-btn--danger" onClick={onHangup} type="button">
          <PhoneOff size={16} /> <span>End</span>
        </button>
      </div>
    </div>
  );
}
