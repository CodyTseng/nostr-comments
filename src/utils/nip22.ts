import { seenOn } from "@nostr/gadgets/store";
import type { EventTemplate, NostrEvent } from "nostr-tools";

const COMMENT_KIND = 1111;

export interface WebCommentOptions {
  url: string;
  content: string;
  authorPubkeys?: string[];
}

export interface ReplyCommentOptions {
  url: string;
  content: string;
  parentEvent: NostrEvent;
  authorPubkeys?: string[];
}

export function buildWebComment(options: WebCommentOptions): EventTemplate {
  const { url, content, authorPubkeys } = options;

  const tags: string[][] = [
    ["I", url],
    ["K", "web"],
    ["i", url],
    ["k", "web"],
  ];

  if (authorPubkeys && authorPubkeys.length > 0) {
    tags.push(["P", authorPubkeys[0]]);
    tags.push(["p", authorPubkeys[0]]);
  }

  return {
    kind: COMMENT_KIND,
    content,
    tags,
    created_at: Math.floor(Date.now() / 1000),
  };
}

export function buildReplyComment(options: ReplyCommentOptions): EventTemplate {
  const { url, content, parentEvent, authorPubkeys } = options;

  const tags: string[][] = [
    ["I", url],
    ["K", "web"],
  ];

  if (authorPubkeys && authorPubkeys.length > 0) {
    tags.push(["P", authorPubkeys[0]]);
  }

  const hints = seenOn(parentEvent);

  tags.push([
    "e",
    parentEvent.id,
    hints.length ? hints[0] : "",
    parentEvent.pubkey,
  ]);
  tags.push(["k", "1111"]);
  tags.push(["p", parentEvent.pubkey]);

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
