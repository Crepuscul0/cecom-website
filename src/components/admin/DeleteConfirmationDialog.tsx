import * as React from "react"
import { Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

export interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  itemType: "category" | "vendor" | "product" | "page"
  itemName?: string
  loading?: boolean
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  itemType,
  itemName,
  loading = false,
}: DeleteConfirmationDialogProps) {
  const t = useTranslations('Admin')

  const getTitle = () => {
    switch (itemType) {
      case "category":
        return t('confirmations.deleteCategory')
      case "vendor":
        return t('confirmations.deleteVendor')
      case "product":
        return t('confirmations.deleteProduct')
      default:
        return t('confirmDialog.deleteTitle')
    }
  }

  const getDescription = () => {
    const baseMessage = t('confirmDialog.deleteMessage')
    if (itemName) {
      return `${baseMessage}\n\n"${itemName}"`
    }
    return baseMessage
  }

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={getTitle()}
      description={getDescription()}
      variant="destructive"
      icon={<Trash2 className="h-6 w-6 text-destructive" />}
      loading={loading}
    />
  )
}

// Hook específico para confirmaciones de eliminación
export function useDeleteConfirmation() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<{
    itemType: DeleteConfirmationDialogProps['itemType']
    itemName?: string
    onConfirm: () => void
  }>({
    itemType: "category",
    onConfirm: () => {},
  })
  const [loading, setLoading] = React.useState(false)

  const showDeleteConfirmation = React.useCallback((
    itemType: DeleteConfirmationDialogProps['itemType'],
    onConfirm: () => void | Promise<void>,
    itemName?: string
  ) => {
    setConfig({ itemType, itemName, onConfirm })
    setIsOpen(true)
  }, [])

  const handleConfirm = React.useCallback(async () => {
    setLoading(true)
    try {
      await config.onConfirm()
      setIsOpen(false)
    } catch (error) {
      console.error('Error in confirmation:', error)
    } finally {
      setLoading(false)
    }
  }, [config.onConfirm])

  const hideConfirmation = React.useCallback(() => {
    setIsOpen(false)
    setLoading(false)
  }, [])

  return {
    isOpen,
    loading,
    showDeleteConfirmation,
    hideConfirmation,
    handleConfirm,
    config,
  }
}