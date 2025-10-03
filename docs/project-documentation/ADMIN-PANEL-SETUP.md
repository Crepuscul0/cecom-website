# Panel de Administración CECOM

## Descripción

Sistema completo de administración con control de acceso basado en roles para CECOM. Permite gestionar usuarios, tickets, cotizaciones, aplicaciones y VPNs con diferentes niveles de acceso.

## Estructura de Roles

### 1. **Admin (Administrador)**
- Acceso completo al CMS existente
- Gestión de usuarios (aprobar/rechazar registros)
- Acceso a todos los módulos: Tickets, Cotizaciones, Aplicaciones, VPNs
- Puede cambiar roles de usuarios aprobados

### 2. **Employee (Empleado)**
- Acceso a módulos operativos: Tickets, Cotizaciones, Aplicaciones, VPNs
- No puede gestionar usuarios
- No tiene acceso al CMS

### 3. **User (Usuario Externo)**
- Debe registrarse y esperar aprobación del administrador
- Una vez aprobado, puede crear solicitudes en los módulos
- Solo ve sus propias solicitudes

## Funcionalidades Implementadas

### ✅ Sistema de Autenticación
- Registro de usuarios con aprobación requerida
- Inicio de sesión con Supabase Auth
- Control de acceso basado en roles
- Workflow de aprobación de usuarios

### ✅ Gestión de Usuarios (Solo Admin)
- Lista de todos los usuarios registrados
- Filtros por estado de aprobación
- Aprobar/rechazar usuarios pendientes
- Cambiar roles de usuarios aprobados
- Estadísticas de usuarios

### ✅ Gestión de Tickets
- Crear, editar y eliminar tickets
- Estados: Abierto, En Progreso, Resuelto, Cerrado
- Prioridades: Baja, Media, Alta, Urgente
- Categorización personalizable
- Filtros y búsqueda avanzada

### ✅ Gestión de Cotizaciones
- Crear cotizaciones para clientes
- Gestión de productos en formato JSON
- Estados: Borrador, Enviada, Aprobada, Rechazada, Expirada
- Fechas de validez
- Seguimiento de montos

### ✅ Gestión de Aplicaciones
- Solicitudes de desarrollo de aplicaciones
- Tipos: Web App, Mobile App, Desktop, API, etc.
- Estados: Enviada, En Revisión, Aprobada, Rechazada, Desplegada
- Requerimientos en formato JSON

### ✅ Gestión de VPNs
- Configuración de conexiones VPN
- Ubicaciones de servidores
- Estados: Solicitada, Configurando, Activa, Suspendida, Terminada
- Fechas de expiración
- Configuración técnica en JSON

## Estructura de Base de Datos

### Tablas Principales

1. **user_profiles** - Perfiles de usuario con roles y aprobación
2. **tickets** - Sistema de tickets de soporte
3. **cotizaciones** - Cotizaciones de productos/servicios
4. **aplicaciones** - Solicitudes de desarrollo
5. **vpns** - Configuraciones de VPN

### Políticas RLS (Row Level Security)

- Los usuarios solo ven sus propios registros
- Empleados y admins ven todos los registros
- Admins pueden gestionar usuarios

## Rutas del Sistema

### Autenticación
- `/auth` - Página de login/registro

### Panel de Administración
- `/admin-panel` - Dashboard principal
- `/admin-panel/users` - Gestión de usuarios (Solo Admin)
- `/admin-panel/tickets` - Gestión de tickets
- `/admin-panel/cotizaciones` - Gestión de cotizaciones
- `/admin-panel/aplicaciones` - Gestión de aplicaciones
- `/admin-panel/vpns` - Gestión de VPNs

### CMS (Solo Admin)
- `/admin` - Redirige al panel de administración
- El CMS existente sigue funcionando para administradores

## Configuración Requerida

### Variables de Entorno
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Dependencias
- `@supabase/supabase-js` - Cliente de Supabase
- `lucide-react` - Iconos
- `react-hook-form` - Manejo de formularios
- `zod` - Validación de esquemas

## Uso del Sistema

### Para Administradores
1. Iniciar sesión con credenciales de admin
2. Acceder a "Usuarios" para aprobar nuevos registros
3. Gestionar todos los módulos operativos
4. Acceso completo al CMS existente

### Para Empleados
1. Iniciar sesión (cuenta debe estar aprobada)
2. Acceder a módulos operativos
3. Gestionar tickets, cotizaciones, aplicaciones y VPNs

### Para Usuarios Externos
1. Registrarse en `/auth`
2. Esperar aprobación del administrador
3. Una vez aprobado, crear y gestionar solicitudes

## Seguridad

- **Autenticación**: Supabase Auth con JWT
- **Autorización**: Row Level Security (RLS)
- **Validación**: Zod schemas en formularios
- **Control de Acceso**: Verificación de roles en componentes
- **Aprobación**: Workflow de aprobación para nuevos usuarios

## Características Técnicas

- **Framework**: Next.js 15 con App Router
- **Base de Datos**: PostgreSQL con Supabase
- **Estilos**: Tailwind CSS
- **Componentes**: Shadcn/ui
- **Estado**: React Context y hooks
- **Formularios**: React Hook Form + Zod
- **Iconos**: Lucide React

## Próximos Pasos

1. Configurar notificaciones por email para aprobaciones
2. Implementar dashboard con métricas avanzadas
3. Agregar sistema de comentarios en tickets
4. Implementar historial de cambios
5. Agregar exportación de reportes
