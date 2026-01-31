import { pool } from "@nostr/gadgets/global";
import { loadRelayList } from "@nostr/gadgets/lists";
import type { Filter, NostrEvent } from "nostr-tools";
import { normalizeURL } from "nostr-tools/utils";
import { isValidPubkey } from "../utils/pubkey";

const DEFAULT_RELAYS = [
  "wss://relay.damus.io/",
  "wss://nos.lol/",
  "wss://nostr.mom/",
];

export function getDefaultRelays(): string[] {
  return [...DEFAULT_RELAYS];
}

export async function queryEvents(
  relays: string[],
  filter: Filter,
): Promise<NostrEvent[]> {
  return pool.querySync(relays, filter);
}

export function subscribeEvents(
  relays: string[],
  filter: Filter,
  onEvent: (event: NostrEvent) => void,
  onEose?: () => void,
): () => void {
  const sub = pool.subscribeMany(relays, filter, {
    onevent: onEvent,
    oneose: onEose,
  });
  return () => sub.close();
}

export async function publishEvent(
  relays: string[],
  event: NostrEvent,
): Promise<void> {
  await Promise.any(pool.publish(relays, event));
}

export async function getRelays(relays?: string[], mention?: string) {
  const relaySet = new Set<string>();
  if (relays && relays.length > 0) {
    relays.forEach((r) => relaySet.add(normalizeURL(r)));
  }
  if (mention && isValidPubkey(mention)) {
    const relayList = await loadRelayList(mention);
    relayList.items.forEach((item) => {
      if (item.read) {
        relaySet.add(item.url);
      }
    });
  }
  if (relaySet.size === 0) {
    getDefaultRelays().forEach((r) => relaySet.add(r));
  }
  return Array.from(relaySet);
}
