"use client"

import { useTranslations } from 'next-intl'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  type: 'delete' | 'approve' | 'reject'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ isOpen, title, message, type, onConfirm, onCancel }: ConfirmDialogProps) {
  const t = useTranslations('AdminPanel')

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <AlertTriangle className="w-6 h-6 text-red-600" />
      case 'approve':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'reject':
        return <XCircle className="w-6 h-6 text-red-600" />
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />
    }
  }

  const getButtonStyles = () => {
    switch (type) {
      case 'delete':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'approve':
        return 'bg-green-600 hover:bg-green-700 text-white'
      case 'reject':
        return 'bg-red-600 hover:bg-red-700 text-white'
      default:
        return 'bg-primary hover:bg-primary/90 text-primary-foreground'
    }
  }

  const getConfirmText = () => {
    switch (type) {
      case 'delete':
        return t('common.delete')
      case 'approve':
        return t('common.approve')
      case 'reject':
        return t('common.reject')
      default:
        return t('common.confirm')
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onCancel} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-card text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-card px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10">
                {getIcon()}
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-base font-semibold leading-6 text-foreground">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-muted/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto transition-colors ${getButtonStyles()}`}
              onClick={onConfirm}
            >
              {getConfirmText()}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-muted sm:mt-0 sm:w-auto transition-colors"
              onClick={onCancel}
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
