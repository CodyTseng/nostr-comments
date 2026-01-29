import type { NostrEvent, EventTemplate } from 'nostr-tools'
import { subscribeEvents, queryEvents, publishEvent } from './nostr'
import type { Signer } from '../signers/types'

const REACTION_KIND = 7

export interface FetchReactionsOptions {
  eventIds: string[]
  relays: string[]
}

export interface SubscribeReactionsOptions {
  eventIds: string[]
  relays: string[]
  onEvent: (event: NostrEvent) => void
  onEose?: () => void
}

export function subscribeReactions(options: SubscribeReactionsOptions): () => void {
  const { eventIds, relays, onEvent, onEose } = options

  if (eventIds.length === 0) {
    onEose?.()
    return () => {}
  }

  return subscribeEvents(
    relays,
    {
      kinds: [REACTION_KIND],
      '#e': eventIds
    },
    onEvent,
    onEose
  )
}

export async function fetchReactions(options: FetchReactionsOptions): Promise<NostrEvent[]> {
  const { eventIds, relays } = options

  if (eventIds.length === 0) {
    return []
  }

  return queryEvents(relays, {
    kinds: [REACTION_KIND],
    '#e': eventIds
  })
}

export function buildReactionEvent(
  targetEvent: NostrEvent,
  content: string = '+'
): EventTemplate {
  return {
    kind: REACTION_KIND,
    content,
    tags: [
      ['e', targetEvent.id],
      ['p', targetEvent.pubkey]
    ],
    created_at: Math.floor(Date.now() / 1000)
  }
}

export async function publishReaction(
  signer: Signer,
  relays: string[],
  targetEvent: NostrEvent,
  content: string = '+'
): Promise<NostrEvent> {
  const template = buildReactionEvent(targetEvent, content)
  const event = await signer.signEvent(template)
  await publishEvent(relays, event)
  return event
}

export function countLikes(reactions: NostrEvent[], eventId: string): number {
  return reactions.filter(r => {
    const eTag = r.tags.find(t => t[0] === 'e')
    return eTag && eTag[1] === eventId && (r.content === '+' || r.content === '')
  }).length
}

export function hasLiked(
  reactions: NostrEvent[],
  eventId: string,
  pubkey: string
): boolean {
  return reactions.some(r => {
    const eTag = r.tags.find(t => t[0] === 'e')
    return (
      eTag &&
      eTag[1] === eventId &&
      r.pubkey === pubkey &&
      (r.content === '+' || r.content === '')
    )
  })
}
