import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog, useConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { DeleteConfirmationDialog, useDeleteConfirmation } from '../DeleteConfirmationDialog'
import { useToast } from '@/components/ui/toast'
import { useErrorHandler } from '@/hooks/useErrorHandler'

/**
 * Componente de ejemplo que demuestra el uso de los nuevos diálogos de confirmación
 * Este archivo es solo para referencia y no se usa en producción
 */
export function ConfirmationExample() {
  const t = useTranslations('Admin')
  const { addToast } = useToast()
  const { showError, showSuccess } = useErrorHandler()
  
  // Ejemplo 1: Diálogo de confirmación básico
  const basicConfirmation = useConfirmationDialog()
  
  // Ejemplo 2: Diálogo de confirmación destructiva
  const [destructiveOpen, setDestructiveOpen] = useState(false)
  
  // Ejemplo 3: Confirmación de eliminación con hook
  const deleteConfirmation = useDeleteConfirmation()

  const handleBasicConfirmation = () => {
    basicConfirmation.showConfirmation({
      title: 'Confirmar Acción',
      description: 'Esta es una acción que requiere confirmación. ¿Deseas continuar?',
      onConfirm: () => {
        addToast({
          title: 'Confirmado',
          description: 'La acción se ejecutó correctamente',
          variant: 'success'
        })
      }
    })
  }

  const handleDestructiveAction = async () => {
    // Simular una operación que puede fallar
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (Math.random() > 0.5) {
      showSuccess('Operación completada exitosamente')
      setDestructiveOpen(false)
    } else {
      throw new Error('Operación falló')
    }
  }

  const handleDeleteExample = () => {
    const exampleItem = {
      id: '123',
      name: 'Ejemplo de Categoría'
    }

    deleteConfirmation.showDeleteConfirmation(
      'category',
      async () => {
        // Simular eliminación
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        if (Math.random() > 0.3) {
          showSuccess('Elemento eliminado correctamente')
        } else {
          showError('deleteCategory')
          throw new Error('Error al eliminar')
        }
      },
      exampleItem.name
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Ejemplos de Diálogos de Confirmación</h2>
        <p className="text-muted-foreground mb-6">
          Estos ejemplos muestran cómo usar los nuevos componentes de confirmación 
          que reemplazan los diálogos nativos del navegador.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Ejemplo 1: Confirmación Básica */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Confirmación Básica</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Diálogo de confirmación estándar para acciones generales.
          </p>
          <Button onClick={handleBasicConfirmation}>
            Mostrar Confirmación
          </Button>
        </div>

        {/* Ejemplo 2: Confirmación Destructiva */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Confirmación Destructiva</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Para acciones que pueden tener consecuencias importantes.
          </p>
          <Button 
            variant="destructive" 
            onClick={() => setDestructiveOpen(true)}
          >
            Acción Destructiva
          </Button>
        </div>

        {/* Ejemplo 3: Eliminación con Hook */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Eliminación con Hook</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Usando el hook especializado para eliminaciones.
          </p>
          <Button 
            variant="destructive" 
            onClick={handleDeleteExample}
          >
            Eliminar Elemento
          </Button>
        </div>
      </div>

      {/* Diálogos */}
      <ConfirmationDialog
        open={basicConfirmation.isOpen}
        onOpenChange={basicConfirmation.hideConfirmation}
        onConfirm={basicConfirmation.config.onConfirm || (() => {})}
        title={basicConfirmation.config.title}
        description={basicConfirmation.config.description}
        variant={basicConfirmation.config.variant}
      />

      <ConfirmationDialog
        open={destructiveOpen}
        onOpenChange={setDestructiveOpen}
        onConfirm={handleDestructiveAction}
        title="Acción Destructiva"
        description="Esta acción puede tener consecuencias importantes. ¿Estás seguro de que deseas continuar?"
        variant="destructive"
      />

      <DeleteConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.hideConfirmation}
        onConfirm={deleteConfirmation.handleConfirm}
        itemType={deleteConfirmation.config.itemType}
        itemName={deleteConfirmation.config.itemName}
        loading={deleteConfirmation.loading}
      />

      {/* Información adicional */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Características:</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Internacionalización completa</li>
          <li>• Estados de carga automáticos</li>
          <li>• Accesibilidad mejorada</li>
          <li>• Diseño consistente</li>
          <li>• Manejo de errores integrado</li>
          <li>• Animaciones suaves</li>
        </ul>
      </div>
    </div>
  )
}