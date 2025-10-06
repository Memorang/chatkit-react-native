/**
 * Ensures a handful of browser-like globals exist before ChatKit runs inside React Native.
 *
 * The function performs runtime checks so it is safe to call multiple times.
 */
export function ensureReactNativePolyfills() {
  if (typeof globalThis.TextEncoder === 'undefined') {
    throw new Error(
      'TextEncoder is not available. Install `react-native-polyfill-globals` and import the auto polyfill entry first.',
    );
  }
  if (typeof globalThis.TextDecoder === 'undefined') {
    throw new Error(
      'TextDecoder is not available. Install `react-native-polyfill-globals` and import the auto polyfill entry first.',
    );
  }
  if (typeof globalThis.ReadableStream === 'undefined') {
    throw new Error(
      'ReadableStream is not available. Install `react-native-polyfill-globals` and import the auto polyfill entry first.',
    );
  }
  if (typeof globalThis.URL === 'undefined') {
    throw new Error(
      'URL is not available. Install `react-native-url-polyfill` or supply your own implementation.',
    );
  }
  if (typeof globalThis.crypto?.getRandomValues !== 'function') {
    throw new Error(
      'crypto.getRandomValues is not available. Install `react-native-get-random-values` to polyfill Web Crypto APIs.',
    );
  }
  if (typeof globalThis.atob !== 'function' || typeof globalThis.btoa !== 'function') {
    throw new Error(
      'Base64 helpers are missing. Install the `base-64` package and import it once at startup.',
    );
  }
}

export default ensureReactNativePolyfills;
