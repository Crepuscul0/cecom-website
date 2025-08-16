import { useTranslations } from 'next-intl'
import { useToast } from '@/components/ui/toast'

export function useErrorHandler() {
  const tErrors = useTranslations('Admin.errors')
  const tCommon = useTranslations('Common.states')
  const { addToast } = useToast()

  const showError = (errorKey: string, fallbackMessage?: string) => {
    const message = tErrors(errorKey) || fallbackMessage || 'An error occurred'
    
    addToast({
      title: tCommon('error'),
      description: message,
      variant: 'error',
      duration: 5000,
    })
  }

  const showSuccess = (message: string) => {
    addToast({
      title: tCommon('success'),
      description: message,
      variant: 'success',
      duration: 3000,
    })
  }

  return {
    showError,
    showSuccess,
  }
}