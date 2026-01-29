import type { NostrEvent } from "nostr-tools";
import { useI18n } from "../i18n";
import type { Comment, Translations } from "../types";
import { Avatar } from "./Avatar";
import { Username } from "./Username";

interface CommentItemProps {
  comment: Comment;
  relays?: string[];
  onReply: (event: NostrEvent) => void;
  onLoginRequired: () => void;
  currentPubkey?: string;
  className?: string;
  /** Whether this is a child comment (second level) */
  isChild?: boolean;
}

function formatDate(
  timestamp: number,
  t: (key: keyof Translations) => string,
  locale: string,
): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t("timeJustNow");
  if (minutes < 60)
    return t("timeMinutesAgo").replace("{{n}}", String(minutes));
  if (hours < 24) return t("timeHoursAgo").replace("{{n}}", String(hours));
  if (days < 30) return t("timeDaysAgo").replace("{{n}}", String(days));

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CommentItem({
  comment,
  relays,
  onReply,
  onLoginRequired,
  currentPubkey,
  className = "",
  isChild = false,
}: CommentItemProps) {
  const { event, children, replyTo } = comment;
  const { t, locale } = useI18n();

  const hasChildren = !isChild && children.length > 0;

  return (
    <div className={`nc-comment ${className}`}>
      <div className="nc-comment__main">
        <Avatar pubkey={event.pubkey} size={isChild ? 28 : 40} />

        <div className="nc-comment__content">
          <div className="nc-comment__header">
            <Username pubkey={event.pubkey} className="nc-comment__author" />
          </div>

          {replyTo && (
            <div className="nc-comment__reply-preview">
              <Username
                pubkey={replyTo.pubkey}
                className="nc-comment__reply-preview-author"
              />
              <span className="nc-comment__reply-preview-text">
                {replyTo.content.replace(/\n/g, " ")}
              </span>
            </div>
          )}

          <p className="nc-comment__text">{event.content}</p>

          <div className="nc-comment__actions">
            <span className="nc-comment__time">
              {formatDate(event.created_at, t, locale)}
            </span>
            <button
              type="button"
              className="nc-comment__reply-btn"
              onClick={() => onReply(event)}
            >
              {t("reply")}
            </button>
          </div>
        </div>

        {/* Vertical line below avatar when has children */}
        {hasChildren && <div className="nc-comment__vline" />}
      </div>

      {hasChildren && (
        <div className="nc-comment__children">
          {children.map((child, index) => (
            <div
              key={child.event.id}
              className={`nc-comment__child-wrapper ${index < children.length - 1 ? "nc-comment__child-wrapper--continue" : ""}`}
            >
              {/* Curved connector line */}
              <div className="nc-comment__connector" />
              {/* Continuing vertical line for non-last items */}
              {index < children.length - 1 && (
                <div className="nc-comment__connector-line" />
              )}
              <CommentItem
                comment={child}
                relays={relays}
                onReply={onReply}
                onLoginRequired={onLoginRequired}
                currentPubkey={currentPubkey}
                isChild={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
