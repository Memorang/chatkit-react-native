# @openai/chatkit-react-native

React Native bindings and opinionated UI utilities for [OpenAI ChatKit](https://github.com/openai/chatkit).

> **Status:** experimental. The API surface will track the web ChatKit package but may contain additional React Native specific helpers. Expect breaking changes while the package matures.

## Installation

```bash
pnpm add @openai/chatkit-react-native
# required peer dependencies
pnpm add react react-native
# recommended polyfills
pnpm add react-native-polyfill-globals react-native-url-polyfill react-native-get-random-values base-64
# optional Expo integrations
pnpm add expo expo-av expo-speech expo-file-system expo-document-picker
# optional non-Expo fallback
pnpm add react-native-fetch-api
# realtime
pnpm add react-native-webrtc
```

Enable the auto-polyfill entry point as early as possible in your app (e.g. `index.js`). This ensures `TextEncoder`, `TextDecoder`, `ReadableStream`, `URL`, `crypto.getRandomValues`, and `atob`/`btoa` are available before ChatKit is used.

```ts
import 'react-native-polyfill-globals/auto';
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import 'base-64';
```

Expo users should also install [`expo-dev-client`](https://docs.expo.dev/develop/development-builds/introduction/) to exercise native modules locally.

## Quick start

```tsx
import { ChatComposer, ChatList, createStreamingFetcher } from '@openai/chatkit-react-native';

const fetcher = createStreamingFetcher();

function ConversationScreen() {
  const [messages, setMessages] = React.useState([]);

  const handleSend = async (content: string) => {
    const controller = new AbortController();
    const { stream } = await fetcher(
      'https://api.openai.com/v1/responses',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          input: [{ role: 'user', content }],
        }),
        signal: controller.signal,
      },
      {
        onResponseStart: () => console.log('response started'),
        onChunk: (chunk) => console.log('chunk', chunk),
        onResponseEnd: () => console.log('response ended'),
      },
    );

    return () => controller.abort();
  };

  return (
    <>
      <ChatList messages={messages} />
      <ChatComposer onSend={handleSend} />
    </>
  );
}
```

## Features

- **Streaming HTTP helpers** with fallbacks for Expo (`expo/fetch`) and bare React Native (`react-native-fetch-api`).
- **Realtime helpers** built on top of `react-native-webrtc` with WebSocket fallback for server-side usage.
- **UI primitives** (`ChatList`, `ChatComposer`) that work with [`FlatList`](https://reactnative.dev/docs/flatlist) and provide opinionated defaults for avatars, timestamps and assistant badges.
- **Voice helpers** to capture microphone input via `expo-av` and synthesize responses using `expo-speech`.

## Realtime signalling

`createWebRTCSession` expects a signalling adapter that exchanges SDP offers/answers with your server. The server can in turn call OpenAI's Realtime API. See `src/realtime` for a reference implementation you can adapt for your backend stack.

```ts
const signalling = {
  negotiate: async (offer: RTCSessionDescriptionInit) => {
    const response = await fetch('https://example.com/realtime/negotiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offer }),
    });
    if (!response.ok) throw new Error('Failed to negotiate');
    return response.json();
  },
};

const session = await createWebRTCSession({
  signalling,
  onResponseChunk: (chunk) => console.log(chunk),
});
```

## Example apps

- `examples/expo-chat`: Expo Router sample using `expo-dev-client` and `expo-av` for voice capture.
- `examples/react-native-chat`: bare React Native CLI sample featuring WebRTC and WebSocket fallbacks.

> Example apps are tracked separately to keep this package lightweight.

## Development

The package uses [tsup](https://tsup.egoist.dev/) to emit both ESM and CJS bundles that Metro can consume. Run `pnpm --filter @openai/chatkit-react-native build` to produce distributable artifacts.

## License

MIT
