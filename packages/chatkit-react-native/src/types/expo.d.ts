declare module 'expo/fetch' {
  export const fetch: typeof globalThis.fetch;
  export default fetch;
}

declare module 'expo-av' {
  export namespace Audio {
    interface RecordingOptions {
      [key: string]: unknown;
    }
    class Recording {
      startAsync(): Promise<void>;
      stopAndUnloadAsync(): Promise<void>;
      getURI(): string | null;
    }
    function requestPermissionsAsync(): Promise<{ status: 'granted' | 'denied' }>;
    namespace Recording {
      function createAsync(options?: RecordingOptions): Promise<{ recording: Recording }>;
    }
  }
}

declare module 'expo-speech' {
  export interface SpeechOptions {
    language?: string;
    pitch?: number;
    rate?: number;
    voice?: string;
    onDone?: (...args: any[]) => void;
    onStopped?: (...args: any[]) => void;
    onError?: (...args: any[]) => void;
  }
  export function speak(text: string, options?: SpeechOptions): void;
}

declare module 'react-native-fetch-api' {
  export const fetch: typeof globalThis.fetch;
  export default fetch;
}
