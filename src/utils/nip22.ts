import { seenOn } from "@nostr/gadgets/store";
import type { EventTemplate, NostrEvent } from "nostr-tools";

const COMMENT_KIND = 1111;

export interface WebCommentOptions {
  url: string;
  content: string;
  parentEvent?: NostrEvent | null;
  authorPubkeys?: string[];
}

export function buildWebComment(options: WebCommentOptions): EventTemplate {
  const { url, content, authorPubkeys, parentEvent } = options;
  const author =
    authorPubkeys && authorPubkeys.length > 0 ? authorPubkeys[0] : null;

  const tags: string[][] = [
    ["I", url],
    ["K", "web"],
  ];

  if (author) {
    tags.push(["P", author]);
  }

  if (parentEvent) {
    const hints = seenOn(parentEvent);

    tags.push([
      "e",
      parentEvent.id,
      hints.length ? hints[0] : "",
      parentEvent.pubkey,
    ]);
    tags.push(["k", "1111"]);
    tags.push(["p", parentEvent.pubkey]);
  } else {
    tags.push(["i", url]);
    tags.push(["k", "web"]);
    if (author) {
      tags.push(["p", author]);
    }
  }

  return {
    kind: COMMENT_KIND,
    content,
    tags,
    created_at: Math.floor(Date.now() / 1000),
  };
}

export function isReply(event: NostrEvent): boolean {
  return event.tags.some((tag) => tag[0] === "e");
}

export function getParentId(event: NostrEvent): string | null {
  const eTag = event.tags.find((tag) => tag[0] === "e");
  return eTag ? eTag[1] : null;
}

export function getRootUrl(event: NostrEvent): string | null {
  const iTag = event.tags.find((tag) => tag[0] === "I");
  return iTag ? iTag[1] : null;
}
