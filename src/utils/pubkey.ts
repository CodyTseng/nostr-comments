const HEX_64_REGEX = /^[0-9a-f]{64}$/i;

export function isValidPubkey(pubkey: string): boolean {
  return HEX_64_REGEX.test(pubkey);
}
