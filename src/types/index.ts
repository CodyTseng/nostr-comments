import type { NostrEvent } from "nostr-tools";
import type { Signer } from "../signers/types";

export interface Comment {
  event: NostrEvent;
  children: Comment[];
  /** Parent comment event when this is a nested reply (depth >= 2) */
  replyTo?: NostrEvent;
}

export interface Profile {
  pubkey: string;
  name?: string;
  displayName?: string;
  picture?: string;
  nip05?: string;
  about?: string;
}

export interface Translations {
  comments: string;
  writeComment: string;
  reply: string;
  replyTo: string;
  publish: string;
  publishing: string;
  computing: string;
  cancel: string;
  login: string;
  logout: string;
  loginRequired: string;
  loginDescription: string;
  extensionLogin: string;
  extensionLoginDesc: string;
  bunkerLogin: string;
  bunkerLoginDesc: string;
  bunkerUrlPlaceholder: string;
  connect: string;
  connecting: string;
  tempAccount: string;
  tempAccountDesc: string;
  tempAccountCreated: string;
  createAccount: string;
  copyKey: string;
  keyCopied: string;
  downloadKey: string;
  keyCompatibility: string;
  startCommenting: string;
  importKey: string;
  importKeyDesc: string;
  importKeyPlaceholder: string;
  importKeyError: string;
  like: string;
  liked: string;
  loadMore: string;
  loading: string;
  noComments: string;
  error: string;
  retry: string;
  anonymous: string;
  timeJustNow: string;
  timeMinutesAgo: string;
  timeHoursAgo: string;
  timeDaysAgo: string;
}

export interface NostrCommentsProps {
  url: string;
  /** Public key to mention in comments (receives notifications) */
  mention?: string;
  relays?: string[];
  pageSize?: number;
  locale?: string;
  translations?: Partial<Translations>;
  theme?: "light" | "dark" | "auto";
  headless?: boolean;
  classNames?: {
    root?: string;
    list?: string;
    item?: string;
    editor?: string;
    loginModal?: string;
  };
  /** External signer instance. When provided, the login modal will be skipped. */
  signer?: Signer;
  enabledSigners?: ("nip07" | "bunker" | "temp")[];
  /** POW difficulty (number of leading zero bits). Requires more computation time but helps prevent spam. */
  pow?: number;
  onCommentPublished?: (event: NostrEvent) => void;
  onError?: (error: Error) => void;
}
