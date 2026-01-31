import { seenOn } from "@nostr/gadgets/store";
import type { EventTemplate, NostrEvent } from "nostr-tools";
import { isValidPubkey } from "./pubkey";

const COMMENT_KIND = 1111;

export interface WebCommentOptions {
  url: string;
  content: string;
  parentEvent?: NostrEvent | null;
  mention?: string;
}

export function buildWebComment(options: WebCommentOptions): EventTemplate {
  const { url, content, parentEvent } = options;
  const mention = options.mention && isValidPubkey(options.mention) ? options.mention : undefined;

  const tags: string[][] = [
    ["I", url],
    ["K", "web"],
  ];

  if (mention) {
    tags.push(["P", mention]);
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
    if (mention) {
      tags.push(["p", mention]);
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
