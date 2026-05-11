import { useState, useCallback } from 'react';
import { CallState } from '../types';
import { DialPad } from '../components/DialPad';

interface Props {
  callState: CallState;
  makeCall: (num: string) => Promise<unknown>;
  sendDTMF: (d: string) => void;
}

export function DialPadContainer({ callState, makeCall, sendDTMF }: Props) {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleDigitPress = useCallback((digit: string) => {
    if (callState === CallState.Connected) sendDTMF(digit);
    else setPhoneNumber((prev) => prev + digit);
  }, [callState, sendDTMF]);

  const handleCall = useCallback(() => {
    if (phoneNumber.trim()) {
      makeCall(phoneNumber.trim()).catch(() => {});
    }
  }, [makeCall, phoneNumber]);

  return (
    <DialPad
      phoneNumber={phoneNumber}
      onPhoneNumberChange={setPhoneNumber}
      onDigitPress={handleDigitPress}
      onCall={handleCall}
    />
  );
}
