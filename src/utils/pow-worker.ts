import type { UnsignedEvent } from "nostr-tools";

// Inline worker code - self-contained POW mining
const workerCode = `
const utf8Encoder = new TextEncoder();

async function sha256Hex(message) {
  const msgBuffer = utf8Encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getPow(hex) {
  let count = 0;
  for (let i = 0; i < 64; i += 8) {
    const nibble = parseInt(hex.substring(i, i + 8), 16);
    if (nibble === 0) {
      count += 32;
    } else {
      count += Math.clz32(nibble);
      break;
    }
  }
  return count;
}

async function fastEventHash(evt) {
  return sha256Hex(JSON.stringify([0, evt.pubkey, evt.created_at, evt.kind, evt.tags, evt.content]));
}

async function minePow(unsigned, difficulty) {
  let count = 0;
  const event = { ...unsigned, tags: [...unsigned.tags] };
  const tag = ["nonce", count.toString(), difficulty.toString()];
  event.tags.push(tag);

  while (true) {
    const now = Math.floor(Date.now() / 1000);
    if (now !== event.created_at) {
      count = 0;
      event.created_at = now;
    }
    tag[1] = (++count).toString();
    event.id = await fastEventHash(event);
    if (getPow(event.id) >= difficulty) {
      break;
    }
  }
  return event;
}

self.onmessage = async (e) => {
  const { unsigned, difficulty } = e.data;
  try {
    const result = await minePow(unsigned, difficulty);
    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};
`;

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    const blob = new Blob([workerCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    worker = new Worker(url);
  }
  return worker;
}

export interface MinedEvent extends UnsignedEvent {
  id: string;
}

export function minePowAsync(
  unsigned: UnsignedEvent,
  difficulty: number,
): Promise<MinedEvent> {
  return new Promise((resolve, reject) => {
    const w = getWorker();

    const handler = (e: MessageEvent) => {
      w.removeEventListener("message", handler);
      if (e.data.success) {
        resolve(e.data.result);
      } else {
        reject(new Error(e.data.error));
      }
    };

    w.addEventListener("message", handler);
    w.postMessage({ unsigned, difficulty });
  });
}
