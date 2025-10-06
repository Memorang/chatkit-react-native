declare const require: any;

type FetchImpl = typeof fetch;

export interface StreamingFetcherHooks {
  onResponseStart?: (response: Response) => void;
  onChunk?: (chunk: string) => void;
  onResponseEnd?: () => void;
}

export interface StreamingFetcherOptions {
  /**
   * Provide a custom fetch implementation. Defaults to Expo's fetch, then the React Native Fetch API polyfill.
   */
  fetchImplementation?: FetchImpl;
  /**
   * Force using the React Native Fetch API polyfill even when Expo is available.
   */
  forceReactNativeFetch?: boolean;
}

export interface StreamingResult {
  response: Response;
  stream: ReadableStream<Uint8Array> | null;
}

export type StreamingFetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
  hooks?: StreamingFetcherHooks,
) => Promise<StreamingResult>;

/**
 * Attempt to resolve a fetch implementation suitable for the current runtime.
 */
async function resolveFetch(options?: StreamingFetcherOptions): Promise<FetchImpl> {
  if (options?.fetchImplementation) {
    return options.fetchImplementation;
  }

  if (!options?.forceReactNativeFetch) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const expoModule = require('expo/fetch');
      const expoFetch: FetchImpl = expoModule.fetch ?? expoModule.default ?? expoModule;
      if (typeof expoFetch === 'function') {
        return expoFetch;
      }
    } catch (error) {
      // Expo is optional; ignore resolution failures.
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[chatkit-react-native] expo/fetch unavailable', error);
      }
    }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rnFetchModule = require('react-native-fetch-api');
    const rnFetch: FetchImpl = rnFetchModule.fetch ?? rnFetchModule.default ?? rnFetchModule;
    if (typeof rnFetch === 'function') {
      return ((input: RequestInfo | URL, init?: RequestInit) => {
        const config = {
          ...(init as any),
          reactNative: {
            textStreaming: true,
            ...((init as any)?.reactNative ?? {}),
          },
        };
        return rnFetch(input, config as RequestInit);
      }) as FetchImpl;
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[chatkit-react-native] react-native-fetch-api unavailable', error);
    }
  }

  if (typeof fetch !== 'undefined') {
    return fetch;
  }

  throw new Error(
    'No fetch implementation found. Provide `fetchImplementation` or install `expo/fetch` or `react-native-fetch-api`.',
  );
}

export function createStreamingFetcher(options?: StreamingFetcherOptions): StreamingFetcher {
  return async (input, init, hooks) => {
    const fetchImpl = await resolveFetch(options);
    const response = await fetchImpl(input, init as any);

    hooks?.onResponseStart?.(response);

    const stream = response.body;
    if (!stream) {
      const text = await response.text();
      if (text && hooks?.onChunk) {
        hooks.onChunk(text);
      }
      hooks?.onResponseEnd?.();
      return { response, stream: null };
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    async function pump(): Promise<void> {
      const { done, value } = await reader.read();
      if (done) {
        hooks?.onResponseEnd?.();
        return;
      }
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        if (chunk && hooks?.onChunk) {
          hooks.onChunk(chunk);
        }
      }
      await pump();
    }

    pump().catch((error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[chatkit-react-native] streaming error', error);
      }
      hooks?.onResponseEnd?.();
    });

    return { response, stream };
  };
}
