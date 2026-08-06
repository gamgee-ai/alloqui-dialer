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
    <div className="alloqui-toast">
      <div className="alloqui-toast-top">
        <div className={`alloqui-toast-dot ${muted ? 'alloqui-toast-dot--muted' : 'alloqui-toast-dot--connected'}`} />
        <div className="alloqui-toast-info">
          <span className="alloqui-toast-number">{phoneNumber}</span>
          <span className="alloqui-toast-name">{contactName ?? 'Unknown'}</span>
        </div>
        <span className="alloqui-toast-timer">{fmt(duration)}</span>
      </div>
      <div className="alloqui-toast-buttons">
        <button className={`alloqui-toast-btn ${muted ? 'alloqui-toast-btn--active' : ''}`} onClick={onToggleMute} type="button">
          {muted ? <MicOff size={16} /> : <Mic size={16} />} <span>Mute</span>
        </button>
        <button className={`alloqui-toast-btn ${held ? 'alloqui-toast-btn--active' : ''}`} onClick={onToggleHold} type="button">
          <Pause size={16} /> <span>Hold</span>
        </button>
        <button className="alloqui-toast-btn alloqui-toast-btn--danger" onClick={onHangup} type="button">
          <PhoneOff size={16} /> <span>End</span>
        </button>
      </div>
    </div>
  );
}
