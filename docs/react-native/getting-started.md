# React Native (Expo) Support

This guide captures the minimum setup for adopting `@openai/chatkit-react-native` inside a new or existing React Native project. The instructions assume you are using [Expo](https://docs.expo.dev) with the development build workflow, but also call out fallbacks for bare React Native.

## 1. Install dependencies

```bash
pnpm add @openai/chatkit-react-native
pnpm add react-native-polyfill-globals react-native-url-polyfill react-native-get-random-values base-64
pnpm add expo expo-dev-client expo-av expo-speech expo-file-system expo-document-picker
pnpm add react-native-webrtc
# For bare React Native (non-Expo) projects
pnpm add react-native-fetch-api
```

## 2. Configure polyfills

Add the following imports at the top of your app entry (for example `app/index.tsx` when using Expo Router or `index.js` for bare projects):

```ts
import 'react-native-polyfill-globals/auto';
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import 'base-64';
```

Polyfills must run before any ChatKit code executes to ensure `TextEncoder`, `TextDecoder`, `ReadableStream`, `URL`, `crypto.getRandomValues`, `atob` and `btoa` are defined.

## 3. Streaming HTTP helpers

`createStreamingFetcher` wraps Expo's `fetch` implementation and falls back to `react-native-fetch-api` for apps not running inside the Expo runtime. It exposes lifecycle hooks that map cleanly onto ChatKit's expectations.

```ts
import { createStreamingFetcher } from '@openai/chatkit-react-native';

const streamingFetch = createStreamingFetcher();

const { response } = await streamingFetch(
  'https://api.openai.com/v1/responses',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: [{ role: 'user', content: 'Hello!' }],
    }),
  },
  {
    onResponseStart: () => console.log('stream started'),
    onChunk: (chunk) => console.log('chunk', chunk),
    onResponseEnd: () => console.log('stream ended'),
  },
);
```

## 4. Realtime via WebRTC

`createWebRTCSession` bridges [`react-native-webrtc`](https://github.com/react-native-webrtc/react-native-webrtc) with ChatKit's realtime API. Provide a signalling adapter that exchanges offers/answers with your backend. The backend should authenticate with OpenAI and create a WebRTC session on behalf of the device.

```ts
const session = await createWebRTCSession({
  signalling: {
    negotiate: async (offer) => {
      const response = await fetch('https://your-server.example.com/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer }),
      });
      if (!response.ok) throw new Error('Failed to negotiate');
      return response.json();
    },
  },
  onResponseChunk: (chunk) => console.log('Realtime chunk', chunk),
});

await session.start();
```

For server-to-server integrations or for environments where WebRTC is not available, `createWebSocketSession` provides a lightweight wrapper over the standard `WebSocket` implementation.

## 5. Voice mode

The `useVoiceSession` hook layers [`expo-av`](https://docs.expo.dev/versions/latest/sdk/av/) for microphone capture with [`expo-speech`](https://docs.expo.dev/versions/latest/sdk/speech/) for text-to-speech output.

```tsx
const voice = useVoiceSession();

return (
  <View>
    <Button title={voice.isRecording ? 'Stop' : 'Record'} onPress={voice.isRecording ? voice.stopRecording : voice.startRecording} />
    <Button title="Play response" onPress={() => voice.speak('Processing request…')} />
  </View>
);
```

## 6. UI primitives

`ChatList` and `ChatComposer` are unstyled building blocks that work with [`FlatList`](https://reactnative.dev/docs/flatlist) and React Native primitives. They intentionally avoid taking a dependency on any specific design system so you can wrap them with [Gluestack UI](https://gluestack.io/), [React Native Paper](https://callstack.github.io/react-native-paper/) or your own component library.

## 7. Testing & CI

- Run `pnpm --filter @openai/chatkit-react-native build` locally (or with `--watch` while iterating) to confirm the TypeScript
  sources compile and the emitted declarations stay up to date.
- Use [Expo Application Services (EAS) Build](https://docs.expo.dev/build/introduction/) to produce reproducible binaries with the required native modules.
- Add simulator coverage for both iOS and Android in CI (e.g. GitHub Actions with `react-native-testing-library`).
- Include integration smoke tests that call the streaming HTTP helper and WebRTC wrapper to catch regressions in networking polyfills.

## 8. Versioning strategy

Mirror the version numbers from the web ChatKit packages. Introduce RN-specific fixes as patch releases and plan for a weekly merge from upstream to stay in sync with API additions.

## 9. Example apps

Two example apps complement this package:

- `examples/expo-chat`: Expo Router, streaming completions, voice capture.
- `examples/react-native-chat`: bare React Native CLI project focusing on WebRTC.

The examples intentionally live outside of the npm package to keep installs lean while still providing real-world references.
