import type { EventTemplate, VerifiedEvent } from 'nostr-tools'

export interface Signer {
  getPublicKey(): Promise<string>
  signEvent(event: EventTemplate): Promise<VerifiedEvent>
}

export type SignerType = 'nip07' | 'bunker' | 'temp'

export interface SignerInfo {
  type: SignerType
  pubkey: string
}
