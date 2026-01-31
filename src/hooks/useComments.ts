import type { NostrEvent } from "nostr-tools";
import { getPow } from "nostr-tools/nip13";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildCommentTree,
  fetchComments,
  subscribeComments,
} from "../services/comment";
import { getRelays } from "../services/nostr";
import type { Comment } from "../types";

export interface UseCommentsOptions {
  url: string;
  mention?: string;
  relays?: string[];
  pageSize?: number;
  pow?: number;
}

export function useComments(options: UseCommentsOptions) {
  const { url, relays, mention, pageSize = 50, pow = 18 } = options;

  const [events, setEvents] = useState<NostrEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [until, setUntil] = useState<number | undefined>();

  // Use JSON string as stable dependency for relays array
  const relaysKey = JSON.stringify(relays);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    setEvents([]);

    const buffer: NostrEvent[] = [];
    let hasEosed = false;

    const unsub = subscribeComments({
      url,
      relays: await getRelays(relays, mention),
      limit: pageSize,
      onEvent: (evt) => {
        if (hasEosed) {
          setEvents((prev) => {
            // Avoid duplicates
            if (prev.some((e) => e.id === evt.id)) return prev;
            return [evt, ...prev];
          });
        } else {
          buffer.push(evt);
        }
      },
      onEose: () => {
        hasEosed = true;
        const sorted = buffer.sort((a, b) => b.created_at - a.created_at);
        const sliced = sorted.slice(0, pageSize);
        setEvents(sliced);
        setUntil(
          sliced.length >= pageSize
            ? sliced[sliced.length - 1].created_at - 1
            : undefined,
        );
        setLoading(false);
      },
    });

    return unsub;
  }, [url, pageSize, relaysKey, mention]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || until === undefined) return;

    setLoadingMore(true);
    try {
      const moreEvents = await fetchComments({
        url,
        relays: await getRelays(relays, mention),
        limit: pageSize,
        until,
      });

      if (moreEvents.length === 0) {
        setUntil(undefined);
        return;
      }

      setEvents((prev) => {
        const newEvents = moreEvents.filter(
          (evt) => !prev.some((e) => e.id === evt.id),
        );
        return [...prev, ...newEvents];
      });
      setUntil(moreEvents[moreEvents.length - 1].created_at - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }, [url, pageSize, loading, loadingMore, until, relaysKey, mention]);

  useEffect(() => {
    const promise = loadComments();
    return () => {
      promise.then((unsub) => unsub());
    };
  }, [loadComments]);

  const addEvent = useCallback((event: NostrEvent) => {
    setEvents((prev) => {
      if (prev.some((e) => e.id === event.id)) return prev;
      return [event, ...prev];
    });
  }, []);

  const { comments, commentCount } = useMemo(() => {
    // Filter events by POW requirement
    const filteredEvents =
      pow && pow > 0 ? events.filter((evt) => getPow(evt.id) >= pow) : events;

    const tree = buildCommentTree(filteredEvents);
    let count = 0;
    const countAll = (items: Comment[]) => {
      items.forEach((item) => {
        count++;
        countAll(item.children);
      });
    };
    countAll(tree);
    return { comments: tree, commentCount: count };
  }, [events, pow]);

  return {
    comments,
    commentCount,
    events,
    loading,
    loadingMore,
    error,
    hasMore: until !== undefined,
    reload: loadComments,
    loadMore,
    addEvent,
  };
}
