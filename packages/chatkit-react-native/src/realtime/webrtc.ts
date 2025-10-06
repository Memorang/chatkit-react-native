import { EventEmitter } from '../utils/EventEmitter';

type MaybePromise<T> = T | Promise<T>;

export interface WebRTCSignalling {
  negotiate(offer: RTCSessionDescriptionInit): MaybePromise<{
    answer: RTCSessionDescriptionInit;
    iceServers?: RTCIceServer[];
    iceCandidates?: RTCIceCandidateInit[];
  }>;
  sendIceCandidate?: (candidate: RTCIceCandidateInit) => MaybePromise<void>;
}

export interface WebRTCSessionOptions {
  signalling: WebRTCSignalling;
  peerConnection?: RTCPeerConnection;
  channelLabel?: string;
  onResponseStart?: () => void;
  onResponseChunk?: (chunk: string) => void;
  onResponseEnd?: () => void;
  onError?: (error: unknown) => void;
}

export interface WebRTCSession {
  connection: RTCPeerConnection;
  channel: RTCDataChannel | null;
  start: () => Promise<void>;
  close: () => void;
  send: (data: string | ArrayBuffer | ArrayBufferView) => void;
  events: EventEmitter;
}

export async function createWebRTCSession(options: WebRTCSessionOptions): Promise<WebRTCSession> {
  const {
    signalling,
    peerConnection = new RTCPeerConnection(),
    channelLabel = 'openai-chatkit',
    onResponseChunk,
    onResponseEnd,
    onResponseStart,
    onError,
  } = options;

  const events = new EventEmitter();
  const channel = peerConnection.createDataChannel(channelLabel);

  channel.binaryType = 'arraybuffer';

  channel.onmessage = (event) => {
    const value = typeof event.data === 'string' ? event.data : new TextDecoder().decode(event.data);
    events.emit('message', value);
    onResponseChunk?.(value);
  };

  channel.onopen = () => {
    events.emit('open');
    onResponseStart?.();
  };

  channel.onclose = () => {
    events.emit('close');
    onResponseEnd?.();
  };

  channel.onerror = (error) => {
    events.emit('error', error);
    onError?.(error);
  };

  peerConnection.onicecandidate = async (event) => {
    const candidate = event.candidate?.toJSON();
    if (!candidate) return;
    try {
      if (signalling.sendIceCandidate) {
        await signalling.sendIceCandidate(candidate);
      }
      events.emit('icecandidate', candidate);
    } catch (error) {
      events.emit('error', error);
      onError?.(error);
    }
  };

  peerConnection.ondatachannel = (event) => {
    // Remote peers may create their own channel; wire up the same handlers.
    const remoteChannel = event.channel;
    remoteChannel.onmessage = channel.onmessage;
    remoteChannel.onopen = channel.onopen;
    remoteChannel.onclose = channel.onclose;
    remoteChannel.onerror = channel.onerror;
  };

  async function start() {
    try {
      const offer = await peerConnection.createOffer({ offerToReceiveAudio: true });
      await peerConnection.setLocalDescription(offer);

      const { answer, iceServers, iceCandidates } = await signalling.negotiate(offer);

      if (iceServers?.length) {
        const configuration = peerConnection.getConfiguration();
        peerConnection.setConfiguration({ ...configuration, iceServers });
      }

      await peerConnection.setRemoteDescription(answer);

      if (iceCandidates?.length) {
        for (const candidate of iceCandidates) {
          await peerConnection.addIceCandidate(candidate);
        }
      }
    } catch (error) {
      events.emit('error', error);
      onError?.(error);
      throw error;
    }
  }

  function close() {
    try {
      if (channel.readyState === 'open' || channel.readyState === 'connecting') {
        channel.close();
      }
    } catch (error) {
      events.emit('error', error);
      onError?.(error);
    }
    peerConnection.close();
    onResponseEnd?.();
  }

  function send(data: string | ArrayBuffer | ArrayBufferView) {
    if (channel.readyState !== 'open') {
      throw new Error('RTCDataChannel is not open. Wait for `onopen` before sending messages.');
    }
    channel.send(data as any);
  }

  return {
    connection: peerConnection,
    channel,
    start,
    close,
    send,
    events,
  };
}
