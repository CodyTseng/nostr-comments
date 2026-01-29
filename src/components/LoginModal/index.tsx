import { useEffect, useState } from 'react'
import { ChevronLeft, Check, Copy, Download, Upload, X, Plus } from 'lucide-react'
import { useSigner } from '../../hooks/useSigner'
import { useI18n } from '../../i18n'
import { TempSigner } from '../../signers'
import { Nip07Login } from './Nip07Login'
import { BunkerLogin } from './BunkerLogin'
import { Avatar } from '../Avatar'
import { Username } from '../Username'
import type { SignerType } from '../../signers/types'

type ModalView = 'list' | 'create' | 'import'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  enabledSigners?: SignerType[]
  className?: string
}

export function LoginModal({
  isOpen,
  onClose,
  enabledSigners = ['nip07', 'bunker', 'temp'],
  className = ''
}: LoginModalProps) {
  const { isLoggedIn, signerInfo, logout, loginWithNsec, loading, getTempSigner } = useSigner()
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const [view, setView] = useState<ModalView>('list')

  // Create flow state
  const [pendingSigner, setPendingSigner] = useState<TempSigner | null>(null)
  const [createCopied, setCreateCopied] = useState(false)
  const [createDownloaded, setCreateDownloaded] = useState(false)

  // Import flow state
  const [nsecInput, setNsecInput] = useState('')
  const [importError, setImportError] = useState<string | null>(null)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setView('list')
      setPendingSigner(null)
      setCreateCopied(false)
      setCreateDownloaded(false)
      setNsecInput('')
      setImportError(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (view !== 'list') {
          handleBack()
        } else {
          onClose()
        }
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
    }
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, view, onClose])

  if (!isOpen) return null

  const handleSuccess = () => {
    onClose()
  }

  const handleBack = () => {
    setView('list')
    setPendingSigner(null)
    setCreateCopied(false)
    setCreateDownloaded(false)
    setNsecInput('')
    setImportError(null)
  }

  // Logged-in state handlers
  const handleCopyKey = async () => {
    const tempSigner = getTempSigner()
    if (tempSigner) {
      await tempSigner.copyNsec()
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const handleDownloadKey = () => {
    const tempSigner = getTempSigner()
    if (tempSigner) {
      tempSigner.downloadKeyFile()
    }
  }

  // Create flow handlers
  const handleCreateCopyKey = async () => {
    if (pendingSigner) {
      await pendingSigner.copyNsec()
      setCreateCopied(true)
      setTimeout(() => setCreateCopied(false), 3000)
    }
  }

  const handleCreateDownloadKey = () => {
    if (pendingSigner) {
      pendingSigner.downloadKeyFile()
      setCreateDownloaded(true)
    }
  }

  const handleStartCommenting = async () => {
    if (pendingSigner) {
      const nsec = pendingSigner.getNsec()
      await loginWithNsec(nsec)
      handleSuccess()
    }
  }

  // Import flow handlers
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nsecInput.trim()) return

    setImportError(null)
    try {
      await loginWithNsec(nsecInput)
      handleSuccess()
    } catch {
      setImportError(t('importKeyError'))
    }
  }

  const isTempAccount = signerInfo?.type === 'temp'
  const tempSigner = isTempAccount ? getTempSigner() : null
  const nsec = tempSigner?.getNsec() || ''

  // Get modal title based on view
  const getTitle = () => {
    if (isLoggedIn) return t('logout')
    if (view === 'create') return t('createAccount')
    if (view === 'import') return t('importKey')
    return t('login')
  }

  // Render back button
  const renderBackButton = () => (
    <button
      type="button"
      onClick={handleBack}
      className="nc-modal__back"
      aria-label="Back"
    >
      <ChevronLeft size={20} />
    </button>
  )

  // Render create view (key already generated)
  const renderCreateView = () => {
    if (!pendingSigner) return null
    const nsec = pendingSigner.getNsec()

    return (
      <div className="nc-temp-view nc-temp-view--created">
        <div className="nc-temp-view__header">
          <div className="nc-temp-view__icon nc-temp-view__icon--success">
            <Check size={24} />
          </div>
          <h4 className="nc-temp-view__title">{t('tempAccountCreated')}</h4>
        </div>

        <div className="nc-temp-view__key-section">
          <div className="nc-temp-view__key-box">
            <code className="nc-temp-view__key-code">{nsec}</code>
            <div className="nc-temp-view__key-actions">
              <button
                type="button"
                onClick={handleCreateCopyKey}
                className={`nc-temp-view__key-btn ${createCopied ? 'nc-temp-view__key-btn--success' : ''}`}
                title={t('copyKey')}
              >
                {createCopied ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <button
                type="button"
                onClick={handleCreateDownloadKey}
                className={`nc-temp-view__key-btn ${createDownloaded ? 'nc-temp-view__key-btn--success' : ''}`}
                title={t('downloadKey')}
              >
                {createDownloaded ? <Check size={16} /> : <Download size={16} />}
              </button>
            </div>
          </div>
          <p className="nc-temp-view__key-hint">{t('keyCompatibility')}</p>
        </div>

        <button
          type="button"
          onClick={handleStartCommenting}
          className="nc-temp-view__submit"
        >
          {t('startCommenting')}
        </button>
      </div>
    )
  }

  // Render import view
  const renderImportView = () => (
    <div className="nc-temp-view">
      <div className="nc-temp-view__icon">
        <Upload size={32} />
      </div>
      <h4 className="nc-temp-view__title">{t('importKey')}</h4>
      <p className="nc-temp-view__desc">{t('importKeyDesc')}</p>

      <form onSubmit={handleImport} className="nc-temp-view__form">
        <input
          type="password"
          value={nsecInput}
          onInput={(e) => {
            setNsecInput((e.target as HTMLInputElement).value)
            setImportError(null)
          }}
          placeholder={t('importKeyPlaceholder')}
          className="nc-temp-view__input"
          autoComplete="off"
        />
        {importError && <p className="nc-temp-view__error">{importError}</p>}
        <button
          type="submit"
          disabled={loading || !nsecInput.trim()}
          className="nc-temp-view__submit"
        >
          {t('login')}
        </button>
      </form>
    </div>
  )

  return (
    <div className={`nc-modal-overlay ${className}`} onClick={onClose}>
      <div className="nc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nc-modal__header">
          {view !== 'list' && !isLoggedIn && renderBackButton()}
          <h3>{getTitle()}</h3>
          <button
            type="button"
            onClick={onClose}
            className="nc-modal__close"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="nc-modal__body">
          {isLoggedIn && signerInfo ? (
            <div className="nc-logged-in">
              <div className="nc-logged-in__user">
                <Avatar pubkey={signerInfo.pubkey} size={48} />
                <div className="nc-logged-in__info">
                  <Username pubkey={signerInfo.pubkey} className="nc-logged-in__name" />
                  <span className="nc-logged-in__type">
                    {signerInfo.type === 'nip07' && t('extensionLogin')}
                    {signerInfo.type === 'bunker' && t('bunkerLogin')}
                    {signerInfo.type === 'temp' && t('tempAccount')}
                  </span>
                </div>
              </div>

              {isTempAccount && (
                <div className="nc-logged-in__temp-backup">
                  <div className="nc-temp-nsec">
                    <code className="nc-temp-nsec__code">{nsec}</code>
                  </div>

                  <p className="nc-login-option__compatibility">{t('keyCompatibility')}</p>

                  <div className="nc-temp-actions">
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className={`nc-temp-actions__btn ${copied ? 'nc-temp-actions__btn--success' : ''}`}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? t('keyCopied') : t('copyKey')}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadKey}
                      className="nc-temp-actions__btn"
                    >
                      <Download size={16} />
                      {t('downloadKey')}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => { logout(); onClose() }}
                className="nc-logged-in__logout"
              >
                {t('logout')}
              </button>
            </div>
          ) : view === 'create' ? (
            renderCreateView()
          ) : view === 'import' ? (
            renderImportView()
          ) : (
            <>
              <p className="nc-modal__description">{t('loginDescription')}</p>
              <div className="nc-login-options">
                {enabledSigners.includes('nip07') && (
                  <Nip07Login onSuccess={handleSuccess} />
                )}
                {enabledSigners.includes('bunker') && (
                  <BunkerLogin onSuccess={handleSuccess} />
                )}
                {enabledSigners.includes('temp') && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const signer = new TempSigner()
                        setPendingSigner(signer)
                        setView('create')
                      }}
                      className="nc-login-option"
                    >
                      <div className="nc-login-option__icon">
                        <Plus size={24} />
                      </div>
                      <div className="nc-login-option__content">
                        <h4>{t('createAccount')}</h4>
                        <p>{t('tempAccountDesc')}</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setView('import')}
                      className="nc-login-option"
                    >
                      <div className="nc-login-option__icon">
                        <Upload size={24} />
                      </div>
                      <div className="nc-login-option__content">
                        <h4>{t('importKey')}</h4>
                        <p>{t('importKeyDesc')}</p>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
