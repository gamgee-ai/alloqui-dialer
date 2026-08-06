import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CallState, type FloatPosition } from '../types';
import { FloatBubble } from '../components/FloatBubble';

interface Props {
  position: FloatPosition;
  callState: CallState;
  muted: boolean;
  children: ReactNode;
}

export function FloatContainer({ position, callState, muted, children }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  function handleExpand() {
    setIsExpanded(true);
  }

  function handleClickOutside(e: MouseEvent) {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) setIsExpanded(false);
  }

  useEffect(() => {
    if (!isExpanded) return;
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  return createPortal(
    <div className={`alloqui-float alloqui-float--${position}`}>
      {!isExpanded && <FloatBubble callState={callState} muted={muted} onClick={handleExpand} />}
      {isExpanded && <div ref={panelRef} className="alloqui-float-panel">{children}</div>}
    </div>,
    document.body,
  );
}
