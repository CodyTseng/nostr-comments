import {
  bareNostrUser,
  loadNostrUser,
  NostrUser,
} from "@nostr/gadgets/metadata";
import { useEffect, useState } from "react";

export function useProfile(pubkey: string) {
  const [profile, setProfile] = useState<NostrUser>(() => {
    return bareNostrUser(pubkey);
  });

  useEffect(() => {
    loadNostrUser(pubkey).then(setProfile);
  }, [pubkey]);

  return { profile };
}
