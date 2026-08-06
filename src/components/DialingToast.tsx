import { PhoneOff } from 'lucide-react';

interface Props {
  phoneNumber: string;
  contactName: string | null;
  onCancel: () => void;
}

export function DialingToast({ phoneNumber, contactName, onCancel }: Props) {
  return (
    <div className="alloqui-toast">
      <div className="alloqui-toast-top">
        <div className="alloqui-toast-dot alloqui-toast-dot--dialing" />
        <div className="alloqui-toast-info">
          <span className="alloqui-toast-number">{phoneNumber}</span>
          <span className="alloqui-toast-name">{contactName ?? 'Unknown'}</span>
        </div>
        <span className="alloqui-toast-timer">Calling...</span>
      </div>
      <div className="alloqui-toast-buttons">
        <button className="alloqui-toast-btn alloqui-toast-btn--danger alloqui-toast-btn--full" onClick={onCancel} type="button">
          <PhoneOff size={16} /> <span>Cancel</span>
        </button>
      </div>
    </div>
  );
}
