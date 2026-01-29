import { nip19 } from "nostr-tools";
import { useProfile } from "../hooks/useProfile";

interface UsernameProps {
  pubkey: string;
  className?: string;
}

export function Username({ pubkey, className = "" }: UsernameProps) {
  const { profile } = useProfile(pubkey);

  const npub = nip19.npubEncode(pubkey);
  const profileUrl = `https://jumble.social/users/${npub}`;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`nc-username ${className}`}
      title={pubkey}
    >
      {profile.shortName}
    </a>
  );
}
