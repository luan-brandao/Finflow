import { useState } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => Promise<void> | void
  onClose: () => void
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Excluir',
  cancelText = 'Cancelar',
  onConfirm,
  onClose
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleConfirm = async () => {
    setLoading(true)
    setError('')
    try {
      await onConfirm()
      onClose()
    } catch (err: any) {
      console.error(err)
      setError('Ocorreu um erro ao processar sua solicitação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white border border-slate-200/80 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-6 animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 id="confirm-modal-title" className="text-base font-bold text-slate-900 leading-snug">
              {title}
            </h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-600 rounded-xl text-xs font-bold transition-all"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
