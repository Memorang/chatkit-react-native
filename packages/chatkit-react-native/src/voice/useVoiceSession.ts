import { useCallback, useRef, useState } from 'react';
import * as expoAudio from 'expo-av';

export type RecordingOptions = expoAudio.Audio.RecordingOptions;

export interface UseVoiceSessionOptions {
  /**
   * Optional recording options to pass through to Expo when creating a new recording.
   */
  recordingOptions?: RecordingOptions;
}

export interface VoiceSession {
  /** Indicates whether a recording is currently active. */
  isRecording: boolean;
  /** Starts a new recording session. */
  startRecording: () => Promise<void>;
  /** Stops the active recording session and returns the captured audio. */
  stopRecording: () => Promise<expoAudio.Audio.Recording | null>;
  /** Resets the current recording state. */
  reset: () => void;
}

const DEFAULT_RECORDING_OPTIONS = expoAudio.Audio.RecordingOptionsPresets.HIGH_QUALITY;

/**
 * A small React hook that encapsulates the lifecycle of an Expo voice recording session.
 */
export function useVoiceSession(options: UseVoiceSessionOptions = {}): VoiceSession {
  const recordingRef = useRef<expoAudio.Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const reset = useCallback(() => {
    recordingRef.current = null;
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    if (recordingRef.current) {
      throw new Error('A recording session is already in progress.');
    }

    setIsRecording(true);

    const permission = await expoAudio.Audio.requestPermissionsAsync();

    if (permission.status !== 'granted') {
      reset();
      throw new Error('Microphone permission was denied. Enable microphone access to record audio.');
    }

    const { recording } = await expoAudio.Audio.Recording.createAsync(
      options.recordingOptions ?? DEFAULT_RECORDING_OPTIONS,
    );

    recordingRef.current = recording;
  }, [options.recordingOptions, reset]);

  const stopRecording = useCallback(async () => {
    const recording = recordingRef.current;

    if (!recording) {
      return null;
    }

    try {
      await recording.stopAndUnloadAsync();
      return recording;
    } finally {
      reset();
    }
  }, [reset]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    reset,
  };
}
