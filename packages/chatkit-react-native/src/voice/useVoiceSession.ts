import * as React from 'react';

type RecordingOptions = import('expo-av').Audio.RecordingOptions;
type SpeechOptions = import('expo-speech').SpeechOptions;

export interface VoiceSessionOptions {
  recordingOptions?: RecordingOptions;
  speechOptions?: SpeechOptions;
}

export interface VoiceSession {
  isRecording: boolean;
  isSpeaking: boolean;
  transcript: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  speak: (text: string) => Promise<void>;
  resetTranscript: () => void;
}

let expoAudio: typeof import('expo-av');
let expoSpeech: typeof import('expo-speech');

async function ensureModules() {
  if (!expoAudio) {
    try {
      expoAudio = await import('expo-av');
    } catch (error) {
      throw new Error(
        'expo-av is required for voice capture. Install it with `expo install expo-av` or `pnpm add expo-av`.',
        { cause: error },
      );
    }
  }
  if (!expoSpeech) {
    try {
      expoSpeech = await import('expo-speech');
    } catch (error) {
      throw new Error(
        'expo-speech is required for text-to-speech playback. Install it with `expo install expo-speech` or `pnpm add expo-speech`.',
        { cause: error },
      );
    }
  }
}

async function startRecording(options?: RecordingOptions) {
  await expoAudio.Audio.requestPermissionsAsync();
  const { recording } = await expoAudio.Audio.Recording.createAsync(options);
  await recording.startAsync();
  return recording;
}

async function stopRecordingInstance(recording: import('expo-av').Audio.Recording | null) {
  if (!recording) return null;
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    return uri ?? null;
  } finally {
  }
}

async function speak(text: string, options?: SpeechOptions) {
  await new Promise<void>((resolve) => {
    expoSpeech.speak(text, {
      ...(options ?? {}),
      onDone: (...args) => {
        options?.onDone?.(...args);
        resolve();
      },
      onStopped: (...args) => {
        options?.onStopped?.(...args);
        resolve();
      },
      onError: (...args) => {
        options?.onError?.(...args);
        resolve();
      },
    });
  });
}

export function useVoiceSession(options: VoiceSessionOptions = {}): VoiceSession {
  const recordingRef = React.useRef<import('expo-av').Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [transcript, setTranscript] = React.useState<string | null>(null);

  const start = React.useCallback(async () => {
    await ensureModules();
    if (isRecording) return;
    setIsRecording(true);
    try {
      const recording = await startRecording(options.recordingOptions);
      recordingRef.current = recording;
    } catch (error) {
      setIsRecording(false);
      throw error;
    }
  }, [isRecording, options.recordingOptions]);

  const stop = React.useCallback(async () => {
    await ensureModules();
    const uri = await stopRecordingInstance(recordingRef.current);
    recordingRef.current = null;
    setIsRecording(false);
    setTranscript(uri);
    return uri;
  }, []);

  const play = React.useCallback(
    async (text: string) => {
      await ensureModules();
      if (!text) return;
      setIsSpeaking(true);
      try {
        await speak(text, options.speechOptions);
      } finally {
        setIsSpeaking(false);
      }
    },
    [options.speechOptions],
  );

  const resetTranscript = React.useCallback(() => setTranscript(null), []);

  return {
    isRecording,
    isSpeaking,
    transcript,
    startRecording: start,
    stopRecording: stop,
    speak: play,
    resetTranscript,
  };
}
