import {
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
  nip19
} from 'nostr-tools'
import type { EventTemplate, VerifiedEvent } from 'nostr-tools'
import type { Signer } from './types'

export class TempSigner implements Signer {
  private secretKey: Uint8Array
  private pubkey: string

  constructor(secretKey?: Uint8Array) {
    // Always generate a new key if not provided
    // Never save to localStorage for security
    this.secretKey = secretKey || generateSecretKey()
    this.pubkey = getPublicKey(this.secretKey)
  }

  async getPublicKey(): Promise<string> {
    return this.pubkey
  }

  async signEvent(event: EventTemplate): Promise<VerifiedEvent> {
    return finalizeEvent(event, this.secretKey)
  }

  getNsec(): string {
    return nip19.nsecEncode(this.secretKey)
  }

  getNpub(): string {
    return nip19.npubEncode(this.pubkey)
  }

  exportKeyFile(): { nsec: string; npub: string; pubkey: string } {
    return {
      nsec: this.getNsec(),
      npub: this.getNpub(),
      pubkey: this.pubkey
    }
  }

  downloadKeyFile(): void {
    const data = this.exportKeyFile()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nostr-key-${this.pubkey.slice(0, 8)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  copyNsec(): Promise<void> {
    return navigator.clipboard.writeText(this.getNsec())
  }

  static fromNsec(nsec: string): TempSigner {
    const { type, data } = nip19.decode(nsec)
    if (type !== 'nsec') {
      throw new Error('Invalid nsec')
    }
    return new TempSigner(data)
  }
}
