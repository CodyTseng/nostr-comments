import { useState } from "react";
import type { NostrEvent } from "nostr-tools";
import { useSigner } from "../hooks/useSigner";
import { publishComment, publishReply } from "../services/comment";
import { useI18n } from "../i18n";
import { Avatar } from "./Avatar";
import { Username } from "./Username";

interface CommentEditorProps {
  url: string;
  relays?: string[];
  authorPubkeys?: string[];
  parentEvent?: NostrEvent | null;
  onClearParent?: () => void;
  onPublished?: (event: NostrEvent) => void;
  onLoginRequired: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function CommentEditor({
  url,
  relays,
  authorPubkeys,
  parentEvent,
  onClearParent,
  onPublished,
  onLoginRequired,
  onError,
  className = "",
}: CommentEditorProps) {
  const { signer, signerInfo, isLoggedIn } = useSigner();
  const { t } = useI18n();
  const [content, setContent] = useState("");
  const [publishing, setPublishing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    if (!isLoggedIn || !signer) {
      onLoginRequired();
      return;
    }

    setPublishing(true);
    try {
      let event: NostrEvent;

      if (parentEvent) {
        event = await publishReply(signer, {
          url,
          content: content.trim(),
          parentEvent,
          relays,
          authorPubkeys,
        });
      } else {
        event = await publishComment(signer, {
          url,
          content: content.trim(),
          relays,
          authorPubkeys,
        });
      }

      setContent("");
      onClearParent?.();
      onPublished?.(event);
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error("Failed to publish"));
    } finally {
      setPublishing(false);
    }
  };

  const handleFocus = () => {
    if (!isLoggedIn) {
      onLoginRequired();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`nc-editor ${className}`}>
      {parentEvent && (
        <div className="nc-editor__reply-to">
          <span className="nc-editor__reply-to-label">{t("replyTo")}</span>
          <Username
            pubkey={parentEvent.pubkey}
            className="nc-editor__reply-to-author"
          />
          <span className="nc-editor__reply-to-content">
            {parentEvent.content}
          </span>
          <button
            type="button"
            onClick={onClearParent}
            className="nc-editor__cancel-reply"
          >
            {t("cancel")}
          </button>
        </div>
      )}

      <div className="nc-editor__main">
        {isLoggedIn && signerInfo && (
          <Avatar pubkey={signerInfo.pubkey} size={40} />
        )}

        <div className="nc-editor__input-wrapper">
          <textarea
            value={content}
            onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)}
            onFocus={handleFocus}
            placeholder={t("writeComment")}
            className="nc-editor__textarea"
            rows={3}
          />

          <div className="nc-editor__actions">
            <button
              type="submit"
              disabled={!content.trim() || publishing || !isLoggedIn}
              className="nc-editor__submit"
            >
              {publishing ? t("publishing") : t("publish")}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
