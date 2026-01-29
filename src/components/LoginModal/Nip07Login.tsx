import { Lock } from 'lucide-react'
import { useSigner } from '../../hooks/useSigner'
import { useI18n } from '../../i18n'

interface Nip07LoginProps {
  onSuccess: () => void
}

export function Nip07Login({ onSuccess }: Nip07LoginProps) {
  const { loginWithNip07, loading, error, isNip07Available } = useSigner()
  const { t } = useI18n()

  const handleClick = async () => {
    await loginWithNip07()
    onSuccess()
  }

  if (!isNip07Available) {
    return (
      <div className="nc-login-option nc-login-option--disabled">
        <div className="nc-login-option__icon">
          <Lock size={24} />
        </div>
        <div className="nc-login-option__content">
          <h4>{t('extensionLogin')}</h4>
          <p>{t('extensionLoginDesc')}</p>
          <p className="nc-login-option__hint">No extension detected</p>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="nc-login-option"
    >
      <div className="nc-login-option__icon">
        <Lock size={24} />
      </div>
      <div className="nc-login-option__content">
        <h4>{t('extensionLogin')}</h4>
        <p>{t('extensionLoginDesc')}</p>
        {error && <p className="nc-login-option__error">{error}</p>}
      </div>
    </button>
  )
}
