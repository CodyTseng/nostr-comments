import type { NostrEvent } from "nostr-tools";
import { useI18n } from "../i18n";
import type { Comment } from "../types";
import { CommentItem } from "./CommentItem";

interface CommentListProps {
  comments: Comment[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  relays?: string[];
  onReply: (event: NostrEvent) => void;
  onLoginRequired: () => void;
  onLoadMore: () => void;
  onRetry: () => void;
  currentPubkey?: string;
  className?: string;
}

export function CommentList({
  comments,
  loading,
  loadingMore,
  hasMore,
  error,
  relays,
  onReply,
  onLoginRequired,
  onLoadMore,
  onRetry,
  currentPubkey,
  className = "",
}: CommentListProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className={`nc-list nc-list--loading ${className}`}>
        <div className="nc-loading">
          <div className="nc-loading__spinner" />
          <span>{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`nc-list nc-list--error ${className}`}>
        <div className="nc-error">
          <span>
            {t("error")}: {error}
          </span>
          <button type="button" onClick={onRetry} className="nc-error__retry">
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className={`nc-list nc-list--empty ${className}`}>
        <p className="nc-empty">{t("noComments")}</p>
      </div>
    );
  }

  return (
    <div className={`nc-list ${className}`}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.event.id}
          comment={comment}
          relays={relays}
          onReply={onReply}
          onLoginRequired={onLoginRequired}
          currentPubkey={currentPubkey}
        />
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="nc-load-more"
        >
          {loadingMore ? t("loading") : t("loadMore")}
        </button>
      )}
    </div>
  );
}
