import type { EventTemplate, VerifiedEvent } from "nostr-tools";
import { generateSecretKey } from "nostr-tools";
import {
  BunkerSigner as Nip46Signer,
  parseBunkerInput,
} from "nostr-tools/nip46";
import type { Signer } from "./types";

export class BunkerSigner implements Signer {
  private signer: Nip46Signer;
  private cachedPubKey: string | undefined;

  constructor(signer: Nip46Signer) {
    this.signer = signer;
  }

  async connect(): Promise<void> {
    await this.signer.connect();
  }

  async getPublicKey(): Promise<string> {
    if (!this.cachedPubKey) {
      this.cachedPubKey = await this.signer.getPublicKey();
    }
    return this.cachedPubKey;
  }

  async signEvent(event: EventTemplate): Promise<VerifiedEvent> {
    return await this.signer.signEvent(event);
  }

  async close(): Promise<void> {
    await this.signer.close();
  }

  static async create(bunkerUrl: string): Promise<BunkerSigner> {
    const bunkerPointer = await parseBunkerInput(bunkerUrl);
    if (!bunkerPointer) {
      throw new Error("Invalid bunker input");
    }

    const signer = Nip46Signer.fromBunker(generateSecretKey(), bunkerPointer, {
      onauth: (url) => {
        window.open(url, "_blank");
      },
    });
    return new BunkerSigner(signer);
  }
}
