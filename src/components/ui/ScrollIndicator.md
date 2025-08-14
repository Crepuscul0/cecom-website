# ScrollIndicator Component

Un componente modular para mostrar indicadores de scroll en contenedores scrollables.

## Características

- ✅ Detección automática de contenido scrollable
- ✅ Se oculta automáticamente cuando se llega al final
- ✅ Múltiples variantes de diseño
- ✅ Animaciones suaves
- ✅ Hook personalizado para fácil integración
- ✅ Responsive y accesible
- ✅ Soporte completo de internacionalización (i18n)
- ✅ Traducciones automáticas basadas en el idioma activo

## Uso Básico

### Con el Hook (Recomendado)

```tsx
import { useScrollIndicator } from '@/components/ui/ScrollIndicator';

function MyComponent() {
  const { containerRef, ScrollIndicator } = useScrollIndicator();

  return (
    <div className="relative">
      <div ref={containerRef} className="max-h-96 overflow-y-auto">
        {/* Contenido scrollable */}
      </div>
      <ScrollIndicator />
    </div>
  );
}
```

### Uso Directo

```tsx
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { useRef } from 'react';

function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div ref={containerRef} className="max-h-96 overflow-y-auto">
        {/* Contenido scrollable */}
      </div>
      <ScrollIndicator containerRef={containerRef} />
    </div>
  );
}
```

## Variantes

### Default
```tsx
<ScrollIndicator variant="default" text="Más contenido abajo" />
```

### Minimal
```tsx
<ScrollIndicator variant="minimal" />
```

### Arrow Only
```tsx
<ScrollIndicator variant="arrow-only" />
```

## Props

### ScrollIndicator

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `containerRef` | `RefObject<HTMLDivElement>` | - | Referencia al contenedor scrollable |
| `className` | `string` | `''` | Clases CSS adicionales |
| `text` | `string` | `undefined` | Texto personalizado (usa traducción automática si no se proporciona) |
| `variant` | `'default' \| 'minimal' \| 'arrow-only'` | `'default'` | Variante visual |

### useScrollIndicator Hook

Retorna:
- `containerRef`: Referencia para el contenedor
- `ScrollIndicator`: Componente pre-configurado

## Ejemplo con ScrollableTableContainer

```tsx
import { ScrollableTableContainer } from '@/components/admin/tables/ScrollableTableContainer';

function MyTable() {
  return (
    <ScrollableTableContainer 
      maxHeight="max-h-80"
      indicatorText="Más filas disponibles"
      indicatorVariant="minimal"
    >
      <table>
        {/* Contenido de la tabla */}
      </table>
    </ScrollableTableContainer>
  );
}
```

## Internacionalización

El componente soporta automáticamente múltiples idiomas usando next-intl:

### Traducciones Disponibles

**Español (es.json)**
```json
{
  "Admin": {
    "scrollIndicator": {
      "moreRowsBelow": "Más filas abajo",
      "moreContentBelow": "Más contenido abajo",
      "scrollDown": "Desplázate hacia abajo"
    }
  }
}
```

**Inglés (en.json)**
```json
{
  "Admin": {
    "scrollIndicator": {
      "moreRowsBelow": "More rows below",
      "moreContentBelow": "More content below", 
      "scrollDown": "Scroll down"
    }
  }
}
```

### Uso con Traducciones Personalizadas

```tsx
// Usa traducción específica
<ScrollIndicator text={t('Admin.scrollIndicator.scrollDown')} />

// Usa traducción automática (recomendado)
<ScrollIndicator /> // Usa 'moreRowsBelow' automáticamente
```

## Personalización CSS

El componente usa las siguientes clases CSS que puedes personalizar:

- `.scroll-indicator`: Animación principal
- `.scroll-indicator-fade-in`: Animación de entrada
- Colores basados en el sistema de design (primary, muted, etc.)