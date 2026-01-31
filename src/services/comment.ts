import type { NostrEvent } from "nostr-tools";
import { subscribeEvents, queryEvents, publishEvent, getRelays } from "./nostr";
import { buildWebComment, getParentId } from "../utils/nip22";
import { minePowAsync } from "../utils/pow-worker";
import type { Signer } from "../signers/types";
import type { Comment } from "../types";

const COMMENT_KIND = 1111;

export interface FetchCommentsOptions {
  url: string;
  relays: string[];
  limit?: number;
  until?: number;
}

export interface SubscribeCommentsOptions {
  url: string;
  relays: string[];
  limit?: number;
  onEvent: (event: NostrEvent) => void;
  onEose?: () => void;
}

export function subscribeComments(
  options: SubscribeCommentsOptions,
): () => void {
  const { url, relays, limit = 50, onEvent, onEose } = options;

  // Support both with and without trailing slash
  const urls = [url];
  if (url.endsWith("/")) {
    urls.push(url.slice(0, -1));
  } else {
    urls.push(url + "/");
  }

  return subscribeEvents(
    relays,
    {
      kinds: [COMMENT_KIND],
      "#I": urls,
      limit,
    },
    onEvent,
    onEose,
  );
}

export async function fetchComments(
  options: FetchCommentsOptions,
): Promise<NostrEvent[]> {
  const { url, relays, limit = 50, until } = options;

  const urls = [url];
  if (url.endsWith("/")) {
    urls.push(url.slice(0, -1));
  } else {
    urls.push(url + "/");
  }

  return queryEvents(relays, {
    kinds: [COMMENT_KIND],
    "#I": urls,
    limit,
    ...(until ? { until } : {}),
  });
}

export async function publishComment(
  signer: Signer,
  options: {
    url: string;
    content: string;
    parentEvent?: NostrEvent | null;
    relays?: string[];
    mention?: string;
    pow?: number;
  },
): Promise<NostrEvent> {
  let template = buildWebComment(options);

  if (options.pow && options.pow > 0) {
    const pubkey = await signer.getPublicKey();
    const unsigned = { ...template, pubkey };
    const mined = await minePowAsync(unsigned, options.pow);
    template = { ...template, tags: mined.tags, created_at: mined.created_at };
  }

  const event = await signer.signEvent(template);
  await publishEvent(await getRelays(options.relays, options.mention), event);
  return event;
}

export function buildCommentTree(events: NostrEvent[]): Comment[] {
  // Create a map for quick event lookup by id
  const eventMap = new Map<string, NostrEvent>();
  events.forEach((event) => eventMap.set(event.id, event));

  // Find root comment id for any event (walk up the parent chain)
  const getRootParentId = (event: NostrEvent): string | null => {
    const parentId = getParentId(event);
    if (!parentId) return null; // This is already a root comment

    const parent = eventMap.get(parentId);
    if (!parent) return parentId; // Parent not in our data, treat parentId as root

    const grandParentId = getParentId(parent);
    if (!grandParentId) return parentId; // Parent is a root comment

    // Parent is also a reply, so find the root
    return getRootParentId(parent);
  };

  // Sort by created_at ascending for second-level comments (oldest first)
  const sorted = [...events].sort((a, b) => a.created_at - b.created_at);

  // Group by effective parent (root for level 1, root comment id for level 2+)
  const rootComments: NostrEvent[] = [];
  const childrenMap = new Map<string, Comment[]>();

  sorted.forEach((event) => {
    const parentId = getParentId(event);

    if (!parentId) {
      // This is a root comment
      rootComments.push(event);
    } else {
      // This is a reply - find which root it belongs to
      const rootParentId = getRootParentId(event);
      const effectiveParent = rootParentId || parentId;

      if (!childrenMap.has(effectiveParent)) {
        childrenMap.set(effectiveParent, []);
      }

      // Get the direct parent event for replyTo (only if it's not the root)
      const directParent = eventMap.get(parentId);
      const isDirectReplyToRoot = directParent && !getParentId(directParent);

      childrenMap.get(effectiveParent)!.push({
        event,
        children: [], // No further nesting in two-level mode
        replyTo: isDirectReplyToRoot ? undefined : directParent,
      });
    }
  });

  // Sort root comments by created_at descending (newest first)
  rootComments.sort((a, b) => b.created_at - a.created_at);

  // Build final tree
  return rootComments.map((event) => ({
    event,
    children: childrenMap.get(event.id) || [],
  }));
}
