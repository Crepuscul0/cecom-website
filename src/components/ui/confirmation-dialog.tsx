import * as React from "react"
import { AlertTriangle, Trash2, HelpCircle } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  icon?: React.ReactNode
  loading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = "default",
  icon,
  loading = false,
}: ConfirmationDialogProps) {
  const t = useTranslations('Admin.confirmDialog')

  const handleConfirm = () => {
    onConfirm()
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const getIcon = () => {
    if (icon) return icon
    
    switch (variant) {
      case "destructive":
        return <AlertTriangle className="h-6 w-6 text-destructive" />
      default:
        return <HelpCircle className="h-6 w-6 text-primary" />
    }
  }

  const getTitle = () => {
    if (title) return title
    return variant === "destructive" ? t('deleteTitle') : t('title')
  }

  const getDescription = () => {
    if (description) return description
    return variant === "destructive" ? t('deleteMessage') : t('message')
  }

  const getConfirmText = () => {
    if (confirmText) return confirmText
    return variant === "destructive" ? t('deleteConfirm') : t('confirm')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <DialogTitle className="text-left">
              {getTitle()}
            </DialogTitle>
          </div>
          <DialogDescription className="text-left">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText || t('cancel')}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                {getConfirmText()}
              </>
            ) : (
              getConfirmText()
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook personalizado para facilitar el uso
export function useConfirmationDialog() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<Partial<ConfirmationDialogProps>>({})

  const showConfirmation = React.useCallback((options: Partial<ConfirmationDialogProps>) => {
    setConfig(options)
    setIsOpen(true)
  }, [])

  const hideConfirmation = React.useCallback(() => {
    setIsOpen(false)
    setConfig({})
  }, [])

  return {
    isOpen,
    config,
    showConfirmation,
    hideConfirmation,
  }
}