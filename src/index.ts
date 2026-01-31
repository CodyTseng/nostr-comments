// Main component
export { NostrComments } from "./NostrComments";

// Types
export type {
  NostrCommentsProps,
  Comment,
  Profile,
  Translations,
} from "./types";

// Signers
export { Nip07Signer, TempSigner, BunkerSigner } from "./signers";
export type { Signer, SignerType, SignerInfo } from "./signers";

// Hooks
export { useSigner, useComments, useProfile, isLoggedIn } from "./hooks";
export type { UseCommentsOptions } from "./hooks";

// Components
export {
  Avatar,
  Username,
  CommentItem,
  CommentList,
  CommentEditor,
  LoginModal,
} from "./components";

// Services
export {
  getDefaultRelays,
  queryEvents,
  subscribeEvents,
  publishEvent,
} from "./services/nostr";

export {
  subscribeComments,
  fetchComments,
  publishComment,
  buildCommentTree,
} from "./services/comment";

export {
  subscribeReactions,
  fetchReactions,
  publishReaction,
  countLikes,
  hasLiked,
  buildReactionEvent,
} from "./services/reaction";

// Utils
export {
  buildWebComment,
  isReply,
  getParentId,
  getRootUrl,
} from "./utils/nip22";

export {
  getColorFromPubkey,
  generateAvatarSvg,
  getAvatarDataUrl,
} from "./utils/avatar";

// i18n
export { I18nProvider, useI18n, en, zhCN } from "./i18n";

// Styles - auto-injected by vite-plugin-css-injected-by-js
import "./styles/base.css";
