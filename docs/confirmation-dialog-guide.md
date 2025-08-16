# Guía de Componentes de Confirmación

Esta guía explica cómo usar los nuevos componentes de confirmación modular que reemplazan los diálogos nativos del navegador (`confirm()` y `alert()`).

## Componentes Disponibles

### 1. ConfirmationDialog (Componente Base)

Componente base para cualquier tipo de confirmación.

```tsx
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onConfirm={() => {
        // Lógica de confirmación
        console.log('Confirmado!')
        setIsOpen(false)
      }}
      title="Confirmar Acción"
      description="¿Estás seguro de que quieres realizar esta acción?"
      variant="default" // o "destructive"
      loading={false}
    />
  )
}
```

### 2. DeleteConfirmationDialog (Componente Especializado)

Componente específico para confirmaciones de eliminación con traducciones automáticas.

```tsx
import { DeleteConfirmationDialog } from '@/components/admin/DeleteConfirmationDialog'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DeleteConfirmationDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onConfirm={async () => {
        // Lógica de eliminación
        await deleteItem()
      }}
      itemType="category" // "category" | "vendor" | "product" | "page"
      itemName="Nombre del elemento"
      loading={false}
    />
  )
}
```

### 3. Hook useDeleteConfirmation

Hook que simplifica el manejo de confirmaciones de eliminación.

```tsx
import { useDeleteConfirmation } from '@/components/admin/DeleteConfirmationDialog'

function MyComponent() {
  const deleteConfirmation = useDeleteConfirmation()

  const handleDelete = (item) => {
    deleteConfirmation.showDeleteConfirmation(
      'category', // tipo de elemento
      async () => {
        // Lógica de eliminación
        await deleteCategory(item.id)
        // Refrescar datos
        onRefresh()
      },
      item.name // nombre del elemento (opcional)
    )
  }

  return (
    <div>
      <button onClick={() => handleDelete(category)}>
        Eliminar
      </button>

      <DeleteConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.hideConfirmation}
        onConfirm={deleteConfirmation.handleConfirm}
        itemType={deleteConfirmation.config.itemType}
        itemName={deleteConfirmation.config.itemName}
        loading={deleteConfirmation.loading}
      />
    </div>
  )
}
```

## Sistema de Notificaciones Toast

Para reemplazar `alert()`, se incluye un sistema de toast.

### ToastProvider

Debe envolver la aplicación o sección donde se usarán los toasts:

```tsx
import { ToastProvider } from '@/components/ui/toast'

function App() {
  return (
    <ToastProvider>
      {/* Tu aplicación */}
    </ToastProvider>
  )
}
```

### Hook useToast

```tsx
import { useToast } from '@/components/ui/toast'

function MyComponent() {
  const { addToast } = useToast()

  const showSuccess = () => {
    addToast({
      title: 'Éxito',
      description: 'Operación completada correctamente',
      variant: 'success',
      duration: 3000
    })
  }

  const showError = () => {
    addToast({
      title: 'Error',
      description: 'Algo salió mal',
      variant: 'error',
      duration: 5000
    })
  }

  return (
    <div>
      <button onClick={showSuccess}>Mostrar Éxito</button>
      <button onClick={showError}>Mostrar Error</button>
    </div>
  )
}
```

### Hook useErrorHandler

Hook especializado para manejo de errores con traducciones automáticas:

```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler'

function MyComponent() {
  const { showError, showSuccess } = useErrorHandler()

  const handleOperation = async () => {
    try {
      await someOperation()
      showSuccess('Operación completada')
    } catch (error) {
      showError('deleteCategory') // Usa la clave de traducción
    }
  }

  return (
    <button onClick={handleOperation}>
      Realizar Operación
    </button>
  )
}
```

## Características

### Internacionalización
- Todos los componentes soportan traducciones automáticas
- Las claves de traducción están en `messages/es.json` y `messages/en.json`
- Sección `Admin.confirmDialog` para diálogos de confirmación

### Accesibilidad
- Navegación por teclado completa
- Roles ARIA apropiados
- Foco automático en elementos importantes
- Soporte para lectores de pantalla

### Diseño Responsivo
- Adaptable a diferentes tamaños de pantalla
- Animaciones suaves de entrada y salida
- Consistente con el sistema de diseño existente

### Estados de Carga
- Indicadores de carga durante operaciones asíncronas
- Deshabilitación de botones durante la carga
- Prevención de múltiples envíos

## Migración desde confirm() y alert()

### Antes:
```tsx
const handleDelete = async (id) => {
  if (!confirm('¿Estás seguro?')) {
    return
  }
  
  try {
    await deleteItem(id)
    onRefresh()
  } catch (error) {
    alert('Error al eliminar')
  }
}
```

### Después:
```tsx
const deleteConfirmation = useDeleteConfirmation()
const { showError } = useErrorHandler()

const handleDelete = (item) => {
  deleteConfirmation.showDeleteConfirmation(
    'category',
    async () => {
      try {
        await deleteItem(item.id)
        onRefresh()
      } catch (error) {
        showError('deleteCategory')
        throw error // Para mantener el estado de carga
      }
    },
    item.name
  )
}

// En el JSX:
<DeleteConfirmationDialog
  open={deleteConfirmation.isOpen}
  onOpenChange={deleteConfirmation.hideConfirmation}
  onConfirm={deleteConfirmation.handleConfirm}
  itemType={deleteConfirmation.config.itemType}
  itemName={deleteConfirmation.config.itemName}
  loading={deleteConfirmation.loading}
/>
```

## Personalización

Los componentes pueden personalizarse mediante props:

- `variant`: "default" | "destructive"
- `icon`: Icono personalizado
- `title`: Título personalizado
- `description`: Descripción personalizada
- `confirmText`: Texto del botón de confirmación
- `cancelText`: Texto del botón de cancelación

## Beneficios

1. **Profesional**: Diálogos consistentes con el diseño de la aplicación
2. **Accesible**: Cumple con estándares de accesibilidad
3. **Internacionalizado**: Soporte completo para múltiples idiomas
4. **Modular**: Fácil de reutilizar y mantener
5. **Tipado**: TypeScript completo para mejor DX
6. **Responsive**: Funciona en todos los dispositivos