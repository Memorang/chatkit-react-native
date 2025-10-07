export interface StreamingHooks {
  onChunk: (chunk: string) => void | Promise<void>;
  onResponseEnd: () => void | Promise<void>;
}

export async function pump(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
  hooks: StreamingHooks,
): Promise<void> {
  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      const flushed = decoder.decode();
      if (flushed.length > 0) {
        await hooks.onChunk(flushed);
      }
      await hooks.onResponseEnd();
      reader.releaseLock?.();
      break;
    }

    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      if (chunk.length > 0) {
        await hooks.onChunk(chunk);
      }
    }
  }
}
