import type { EventTemplate, VerifiedEvent } from 'nostr-tools'
import type { Signer } from './types'

declare global {
  interface Window {
    nostr?: {
      getPublicKey: () => Promise<string>
      signEvent: (event: EventTemplate) => Promise<VerifiedEvent>
    }
  }
}

export class Nip07Signer implements Signer {
  private cachedPubKey: string | undefined

  static isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.nostr
  }

  async getPublicKey(): Promise<string> {
    if (!window.nostr) {
      throw new Error('NIP-07 extension not available')
    }
    if (!this.cachedPubKey) {
      this.cachedPubKey = await window.nostr.getPublicKey()
    }
    return this.cachedPubKey
  }

  async signEvent(event: EventTemplate): Promise<VerifiedEvent> {
    if (!window.nostr) {
      throw new Error('NIP-07 extension not available')
    }
    return window.nostr.signEvent(event)
  }
}
