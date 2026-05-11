# @phonon/dialer

Drop-in React dialer component for any telephony provider. Enter your Twilio or Plivo keys on [phonon.dev](https://phonon.dev), get a project key, and make calls from your app.

## Install

```bash
npm install @phonon/dialer

# Install your telephony provider SDK (pick one):
npm install @twilio/voice-sdk    # for Twilio
npm install plivo-browser-sdk    # for Plivo
```

## Usage

```tsx
import { Dialer } from '@phonon/dialer';


function App() {
  return (
    <Dialer
      projectKey="ph_live_abc123"
      mode="float"
      position="bottom-right"
    />
  );
}
```

### Next.js

This component uses browser APIs (WebRTC, WebSocket). In Next.js App Router, wrap it in a client component:

```tsx
"use client";

import { Dialer } from '@phonon/dialer';


export function PhononDialer() {
  return <Dialer projectKey="ph_live_abc123" />;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `projectKey` | `string` | required | Your Phonon project API key |
| `apiBaseUrl` | `string` | `https://api.phonon.dev` | API endpoint |
| `mode` | `'float' \| 'panel'` | `'float'` | Display mode |
| `position` | `FloatPosition` | `'bottom-right'` | Float bubble position |
| `theme` | `DialerTheme` | `'auto'` | Color theme |
| `contacts` | `Record<string, string>` | — | Name-to-number map |
| `onCallStart` | `(call) => void` | — | Fires when call connects |
| `onCallEnd` | `(call) => void` | — | Fires when call ends |
| `onError` | `(error) => void` | — | Fires on error |

## Headless Usage

Use the engine directly without UI:

```tsx
import { PhononDialer } from '@phonon/dialer';

const dialer = new PhononDialer({
  projectKey: 'ph_live_abc123',
  apiBaseUrl: 'https://api.phonon.dev',
});

dialer.on('dialer.ready', () => {
  dialer.call('+14155551234');
});

dialer.on('call.ended', () => {
  dialer.destroy();
});
```

## Hook

```tsx
import { useDialer } from '@phonon/dialer';


function MyDialer() {
  const { state, makeCall, hangup, toggleMute, toggleHold, sendDTMF } = useDialer({
    projectKey: 'ph_live_abc123',
  });

  return (
    <div>
      <p>Status: {state.callState}</p>
      <button onClick={() => makeCall('+14155551234')}>Call</button>
      <button onClick={hangup}>Hang up</button>
    </div>
  );
}
```

## License

MIT
