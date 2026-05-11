import { PhoneOff } from 'lucide-react';

interface Props {
  phoneNumber: string;
  contactName: string | null;
  onCancel: () => void;
}

export function DialingToast({ phoneNumber, contactName, onCancel }: Props) {
  return (
    <div className="phonon-toast">
      <div className="phonon-toast-top">
        <div className="phonon-toast-dot phonon-toast-dot--dialing" />
        <div className="phonon-toast-info">
          <span className="phonon-toast-number">{phoneNumber}</span>
          <span className="phonon-toast-name">{contactName ?? 'Unknown'}</span>
        </div>
        <span className="phonon-toast-timer">Calling...</span>
      </div>
      <div className="phonon-toast-buttons">
        <button className="phonon-toast-btn phonon-toast-btn--danger phonon-toast-btn--full" onClick={onCancel} type="button">
          <PhoneOff size={16} /> <span>Cancel</span>
        </button>
      </div>
    </div>
  );
}
