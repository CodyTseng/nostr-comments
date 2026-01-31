import type { NostrEvent } from "nostr-tools";
import { useEffect, useState } from "react";
import { CommentEditor } from "./components/CommentEditor";
import { CommentList } from "./components/CommentList";
import { LoginModal } from "./components/LoginModal";
import { useComments } from "./hooks/useComments";
import { useSigner } from "./hooks/useSigner";
import { I18nProvider, useI18n } from "./i18n";
import type { SignerType } from "./signers/types";
import type { NostrCommentsProps } from "./types";
import { ensureStyles } from "./utils/ensureStyles";

function NostrCommentsInner({
  url,
  authorPubkeys,
  relays,
  pageSize = 50,
  enabledSigners = ["nip07", "bunker", "temp"],
  pow = 18,
  classNames = {},
  onCommentPublished,
  onError,
}: Omit<NostrCommentsProps, "locale" | "translations" | "theme" | "headless">) {
  const { t } = useI18n();
  const { signerInfo } = useSigner();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [parentEvent, setParentEvent] = useState<NostrEvent | null>(null);

  const {
    comments,
    commentCount,
    loading,
    loadingMore,
    error,
    hasMore,
    reload,
    loadMore,
    addEvent,
  } = useComments({ url, relays, authors: authorPubkeys, pageSize, pow });

  const handlePublished = (event: NostrEvent) => {
    addEvent(event);
    onCommentPublished?.(event);
  };

  const handleError = (err: Error) => {
    onError?.(err);
  };

  const handleReply = (event: NostrEvent) => {
    setParentEvent(event);
    // Scroll to editor
    const editor = document.querySelector(".nc-editor");
    if (editor) {
      editor.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className={`nc-root ${classNames.root || ""}`}>
      <div className="nc-header">
        <h3 className="nc-title">
          {t("comments")}
          {commentCount > 0 && (
            <span className="nc-count">({commentCount})</span>
          )}
        </h3>
      </div>

      <CommentEditor
        url={url}
        relays={relays}
        authorPubkeys={authorPubkeys}
        pow={pow}
        parentEvent={parentEvent}
        onClearParent={() => setParentEvent(null)}
        onPublished={handlePublished}
        onLoginRequired={() => setShowLoginModal(true)}
        onError={handleError}
        className={classNames.editor}
      />

      <CommentList
        comments={comments}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        error={error}
        relays={relays}
        onReply={handleReply}
        onLoginRequired={() => setShowLoginModal(true)}
        onLoadMore={loadMore}
        onRetry={reload}
        currentPubkey={signerInfo?.pubkey}
        className={classNames.list}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        enabledSigners={enabledSigners as SignerType[]}
        className={classNames.loginModal}
      />
    </div>
  );
}

export function NostrComments({
  locale,
  translations,
  theme = "auto",
  headless = false,
  ...props
}: NostrCommentsProps) {
  // Ensure styles are injected (handles Astro View Transitions, etc.)
  useEffect(() => {
    if (!headless) {
      ensureStyles();
    }
  }, [headless]);

  return (
    <I18nProvider locale={locale} translations={translations}>
      <div
        className="nostr-comments"
        data-theme={theme}
        data-headless={headless ? "true" : undefined}
      >
        <NostrCommentsInner {...props} />
      </div>
    </I18nProvider>
  );
}
