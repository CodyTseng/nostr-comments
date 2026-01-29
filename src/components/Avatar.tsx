import { nip19 } from "nostr-tools";
import { useProfile } from "../hooks/useProfile";
import { getAvatarDataUrl } from "../utils/avatar";

interface AvatarProps {
  pubkey: string;
  size?: number;
  className?: string;
}

export function Avatar({ pubkey, size = 32, className = "" }: AvatarProps) {
  const { profile } = useProfile(pubkey);

  const src = profile.image || getAvatarDataUrl(pubkey, size);
  const npub = nip19.npubEncode(pubkey);
  const profileUrl = `https://jumble.social/users/${npub}`;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`nc-avatar-link ${className}`}
    >
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="nc-avatar"
        style={{
          height: "fit-content",
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = getAvatarDataUrl(pubkey, size);
        }}
      />
    </a>
  );
}
