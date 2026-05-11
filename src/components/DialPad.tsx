import { Phone } from 'lucide-react';

const KEYS = [
  [{ num: '1', sub: '' }, { num: '2', sub: 'ABC' }, { num: '3', sub: 'DEF' }],
  [{ num: '4', sub: 'GHI' }, { num: '5', sub: 'JKL' }, { num: '6', sub: 'MNO' }],
  [{ num: '7', sub: 'PQRS' }, { num: '8', sub: 'TUV' }, { num: '9', sub: 'WXYZ' }],
  [{ num: '*', sub: '' }, { num: '0', sub: '+' }, { num: '#', sub: '' }],
];

interface DialPadProps {
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  onDigitPress: (digit: string) => void;
  onCall: () => void;
}

export function DialPad({ phoneNumber, onPhoneNumberChange, onDigitPress, onCall }: DialPadProps) {
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    onPhoneNumberChange(e.target.value.replace(/[^0-9+*#() -]/g, ''));
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && phoneNumber.trim()) onCall();
  }

  return (
    <>
      <div className="phonon-number-area">
        <input
          className="phonon-number-input"
          type="tel"
          value={phoneNumber}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="Enter a number"
        />
        {!phoneNumber && <span className="phonon-number-hint">Enter a number to call</span>}
      </div>

      <div className="phonon-dialpad">
        {KEYS.map((row, i) => (
          <div key={i} className="phonon-dialpad-row">
            {row.map(({ num, sub }) => (
              <button key={num} className="phonon-dialpad-btn" onClick={() => onDigitPress(num)} type="button">
                <span className="phonon-dialpad-btn__num">{num}</span>
                {sub && <span className="phonon-dialpad-btn__sub">{sub}</span>}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="phonon-bottom">
        <button className="phonon-call-btn phonon-call-btn--call" onClick={onCall} disabled={!phoneNumber.trim()} type="button">
          <Phone size={28} />
        </button>
        <span className="phonon-powered-by">powered by phonon</span>
      </div>
    </>
  );
}
