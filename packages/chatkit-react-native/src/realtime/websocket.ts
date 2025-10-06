import { EventEmitter } from '../utils/EventEmitter';

export interface WebSocketOptions {
  headers?: Record<string, string>;
}

export interface WebSocketSessionOptions {
  url: string;
  protocols?: string | string[];
  init?: WebSocketOptions;
  onResponseStart?: () => void;
  onResponseChunk?: (chunk: string) => void;
  onResponseEnd?: () => void;
  onError?: (error: unknown) => void;
}

export interface WebSocketSession {
  socket: WebSocket;
  events: EventEmitter;
  send: (data: string | ArrayBufferLike | Blob) => void;
  close: (code?: number, reason?: string) => void;
}

export function createWebSocketSession(options: WebSocketSessionOptions): WebSocketSession {
  const { url, protocols, init, onResponseChunk, onResponseEnd, onResponseStart, onError } = options;

  const socket: WebSocket = new (WebSocket as any)(url, protocols, init);
  const events = new EventEmitter();

  socket.onopen = () => {
    events.emit('open');
    onResponseStart?.();
  };

  socket.onmessage = (event) => {
    const data = typeof event.data === 'string' ? event.data : String(event.data);
    events.emit('message', data);
    onResponseChunk?.(data);
  };

  socket.onerror = (event) => {
    events.emit('error', event);
    onError?.(event);
  };

  socket.onclose = (event) => {
    events.emit('close', event);
    onResponseEnd?.();
  };

  function send(data: string | ArrayBufferLike | Blob) {
    if (socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open. Wait for the connection to open before sending messages.');
    }
    socket.send(data);
  }

  function close(code?: number, reason?: string) {
    socket.close(code, reason);
  }

  return { socket, events, send, close };
}
