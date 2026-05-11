import { CallState, CallDirection, type CallInfo } from '../types';

const VALID_TRANSITIONS: Record<CallState, CallState[]> = {
  [CallState.Idle]: [CallState.Dialing],
  [CallState.Dialing]: [CallState.Ringing, CallState.Connected, CallState.Ended, CallState.Disconnected],
  [CallState.Ringing]: [CallState.Connected, CallState.Ended, CallState.Disconnected],
  [CallState.Connected]: [CallState.Ended, CallState.Disconnected],
  [CallState.Ended]: [CallState.Idle],
  [CallState.Disconnected]: [CallState.Idle],
};

export class CallStateMachine {
  private currentCall: CallInfo | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private callIdCounter = 0;

  get call(): CallInfo | null {
    return this.currentCall ? { ...this.currentCall } : null;
  }

  get state(): CallState {
    return this.currentCall?.state ?? CallState.Idle;
  }

  startCall(phoneNumber: string, direction: CallDirection): CallInfo {
    if (this.currentCall && this.currentCall.state !== CallState.Idle) {
      throw new Error(`Cannot start call: current state is ${this.currentCall.state}`);
    }
    this.currentCall = {
      id: `call_${++this.callIdCounter}_${Date.now()}`,
      phoneNumber, direction,
      state: CallState.Dialing,
      startedAt: null, endedAt: null, duration: 0,
    };
    return { ...this.currentCall };
  }

  transition(to: CallState): CallInfo {
    const from = this.state;
    if (!this.currentCall && to !== CallState.Idle) throw new Error('No active call');
    if (from === to) return { ...this.currentCall! };
    if (!VALID_TRANSITIONS[from]?.includes(to)) throw new Error(`Invalid: ${from} → ${to}`);

    if (to === CallState.Connected) {
      this.currentCall!.startedAt = Date.now();
      this.startTimer();
    }
    if (to === CallState.Ended || to === CallState.Disconnected) {
      this.currentCall!.endedAt = Date.now();
      this.stopTimer();
      if (this.currentCall!.startedAt) {
        this.currentCall!.duration = this.currentCall!.endedAt - this.currentCall!.startedAt;
      }
    }
    if (to === CallState.Idle) {
      const ended = { ...this.currentCall! };
      this.currentCall = null;
      return ended;
    }
    this.currentCall!.state = to;
    return { ...this.currentCall! };
  }

  reset(): void {
    this.stopTimer();
    this.currentCall = null;
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.currentCall?.startedAt) {
        this.currentCall.duration = Date.now() - this.currentCall.startedAt;
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
  }
}
