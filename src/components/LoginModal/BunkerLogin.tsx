import { useState } from "react";
import { Key } from "lucide-react";
import { useSigner } from "../../hooks/useSigner";
import { useI18n } from "../../i18n";

interface BunkerLoginProps {
  onSuccess: () => void;
}

export function BunkerLogin({ onSuccess }: BunkerLoginProps) {
  const { loginWithBunker, loading, error } = useSigner();
  const { t } = useI18n();
  const [bunkerUrl, setBunkerUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bunkerUrl.trim()) return;

    await loginWithBunker(bunkerUrl.trim());

    if (!error) {
      onSuccess();
    }
  };

  return (
    <div className="nc-login-option nc-login-option--bunker">
      <div className="nc-login-option__icon">
        <Key size={24} />
      </div>
      <div className="nc-login-option__content">
        <h4>{t("bunkerLogin")}</h4>
        <p>{t("bunkerLoginDesc")}</p>

        <form onSubmit={handleSubmit} className="nc-bunker-form">
          <input
            type="text"
            value={bunkerUrl}
            onInput={(e) => setBunkerUrl((e.target as HTMLInputElement).value)}
            placeholder={t("bunkerUrlPlaceholder")}
            className="nc-bunker-form__input"
          />
          <button
            type="submit"
            disabled={loading || !bunkerUrl.trim()}
            className="nc-bunker-form__submit"
          >
            {loading ? t("connecting") : t("connect")}
          </button>
        </form>

        {error && <p className="nc-login-option__error">{error}</p>}
      </div>
    </div>
  );
}
