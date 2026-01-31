import { useSyncExternalStore, useCallback } from "react";
import { Nip07Signer, TempSigner, BunkerSigner } from "../signers";
import type { Signer, SignerInfo } from "../signers/types";

// Simple store for global signer state
interface SignerState {
  signer: Signer | null;
  signerInfo: SignerInfo | null;
  loading: boolean;
  error: string | null;
}

let state: SignerState = {
  signer: null,
  signerInfo: null,
  loading: false,
  error: null,
};

const listeners = new Set<() => void>();

function setState(partial: Partial<SignerState>) {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function isLoggedIn() {
  return state.signer !== null;
}

export async function setExternalSigner(signer: Signer): Promise<boolean> {
  setState({ loading: true, error: null });

  try {
    const pubkey = await signer.getPublicKey();
    setState({
      signer,
      signerInfo: { type: "nip07", pubkey }, // Use nip07 as default type for external signers
      loading: false,
      error: null,
    });
    return true;
  } catch (err) {
    setState({
      loading: false,
      error: err instanceof Error ? err.message : "Failed to get public key",
    });
    return false;
  }
}

export function useSigner() {
  const { signer, signerInfo, loading, error } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );

  const loginWithNip07 = useCallback(async () => {
    if (!Nip07Signer.isAvailable()) {
      setState({ error: "NIP-07 extension not found" });
      return;
    }

    setState({ loading: true, error: null });

    try {
      const nip07Signer = new Nip07Signer();
      const pubkey = await nip07Signer.getPublicKey();
      setState({
        signer: nip07Signer,
        signerInfo: { type: "nip07", pubkey },
        loading: false,
      });
    } catch (err) {
      setState({
        error: err instanceof Error ? err.message : "Login failed",
        loading: false,
      });
    }
  }, []);

  const loginWithTemp = useCallback(async () => {
    setState({ loading: true, error: null });

    try {
      const tempSigner = new TempSigner();
      const pubkey = await tempSigner.getPublicKey();
      setState({
        signer: tempSigner,
        signerInfo: { type: "temp", pubkey },
        loading: false,
      });
    } catch (err) {
      setState({
        error: err instanceof Error ? err.message : "Login failed",
        loading: false,
      });
    }
  }, []);

  const loginWithNsec = useCallback(async (nsec: string) => {
    setState({ loading: true, error: null });

    try {
      const tempSigner = TempSigner.fromNsec(nsec.trim());
      const pubkey = await tempSigner.getPublicKey();
      setState({
        signer: tempSigner,
        signerInfo: { type: "temp", pubkey },
        loading: false,
      });
    } catch (err) {
      setState({
        error: err instanceof Error ? err.message : "Invalid nsec",
        loading: false,
      });
      throw err;
    }
  }, []);

  const loginWithBunker = useCallback(async (bunkerUrl: string) => {
    setState({ loading: true, error: null });

    try {
      const bunkerSigner = await BunkerSigner.create(bunkerUrl);
      await bunkerSigner.connect();
      const pubkey = await bunkerSigner.getPublicKey();
      setState({
        signer: bunkerSigner,
        signerInfo: { type: "bunker", pubkey },
        loading: false,
      });
    } catch (err) {
      setState({
        error: err instanceof Error ? err.message : "Login failed",
        loading: false,
      });
    }
  }, []);

  const logout = useCallback(() => {
    if (state.signerInfo?.type === "bunker" && state.signer) {
      (state.signer as BunkerSigner).close();
    }
    setState({
      signer: null,
      signerInfo: null,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState({ error: null });
  }, []);

  const getTempSigner = useCallback((): TempSigner | null => {
    if (state.signerInfo?.type === "temp") {
      return state.signer as TempSigner;
    }
    return null;
  }, []);

  return {
    signer,
    signerInfo,
    loading,
    error,
    isLoggedIn: signer !== null,
    loginWithNip07,
    loginWithTemp,
    loginWithNsec,
    loginWithBunker,
    logout,
    clearError,
    getTempSigner,
    isNip07Available: Nip07Signer.isAvailable(),
  };
}
