'use client';

import { useState } from 'react';

interface IconPickerProps {
 value: string;
 onChange: (icon: string) => void;
 className?: string;
}

const AVAILABLE_ICONS = [
 { name: 'shield', icon: '🛡️', label: 'Escudo' },
 { name: 'network', icon: '🌐', label: 'Red' },
 { name: 'phone', icon: '📞', label: 'Teléfono' },
 { name: 'server', icon: '🖥️', label: 'Servidor' },
 { name: 'database', icon: '🗄️', label: 'Base de datos' },
 { name: 'cloud', icon: '☁️', label: 'Nube' },
 { name: 'security', icon: '🔒', label: 'Seguridad' },
 { name: 'wifi', icon: '📶', label: 'WiFi' },
 { name: 'router', icon: '📡', label: 'Router' },
 { name: 'laptop', icon: '💻', label: 'Laptop' },
 { name: 'mobile', icon: '📱', label: 'Móvil' },
 { name: 'storage', icon: '💾', label: 'Almacenamiento' },
 { name: 'backup', icon: '💿', label: 'Respaldo' },
 { name: 'monitor', icon: '🖥️', label: 'Monitor' },
 { name: 'printer', icon: '🖨️', label: 'Impresora' },
 { name: 'camera', icon: '📹', label: 'Cámara' },
 { name: 'microphone', icon: '🎤', label: 'Micrófono' },
 { name: 'headphones', icon: '🎧', label: 'Audífonos' },
 { name: 'cable', icon: '🔌', label: 'Cable' },
 { name: 'battery', icon: '🔋', label: 'Batería' },
 { name: 'power', icon: '⚡', label: 'Energía' },
 { name: 'settings', icon: '⚙️', label: 'Configuración' },
 { name: 'tools', icon: '🔧', label: 'Herramientas' },
 { name: 'support', icon: '🛠️', label: 'Soporte' },
 { name: 'analytics', icon: '📊', label: 'Análisis' },
 { name: 'chart', icon: '📈', label: 'Gráfico' },
 { name: 'document', icon: '📄', label: 'Documento' },
 { name: 'folder', icon: '📁', label: 'Carpeta' },
 { name: 'email', icon: '📧', label: 'Email' },
 { name: 'message', icon: '💬', label: 'Mensaje' },
 { name: 'notification', icon: '🔔', label: 'Notificación' },
 { name: 'warning', icon: '⚠️', label: 'Advertencia' },
 { name: 'error', icon: '❌', label: 'Error' },
 { name: 'success', icon: '✅', label: 'Éxito' },
 { name: 'info', icon: 'ℹ️', label: 'Información' },
 { name: 'star', icon: '⭐', label: 'Estrella' },
 { name: 'heart', icon: '❤️', label: 'Corazón' },
 { name: 'fire', icon: '🔥', label: 'Fuego' },
 { name: 'rocket', icon: '🚀', label: 'Cohete' },
 { name: 'target', icon: '🎯', label: 'Objetivo' },
 { name: 'key', icon: '🔑', label: 'Llave' },
 { name: 'lock', icon: '🔐', label: 'Candado' },
 { name: 'unlock', icon: '🔓', label: 'Desbloqueado' },
 { name: 'eye', icon: '👁️', label: 'Ojo' },
 { name: 'search', icon: '🔍', label: 'Buscar' },
 { name: 'filter', icon: '🔽', label: 'Filtro' },
 { name: 'sort', icon: '🔄', label: 'Ordenar' },
 { name: 'refresh', icon: '🔄', label: 'Actualizar' },
 { name: 'download', icon: '⬇️', label: 'Descargar' },
 { name: 'upload', icon: '⬆️', label: 'Subir' },
 { name: 'share', icon: '📤', label: 'Compartir' },
 { name: 'link', icon: '🔗', label: 'Enlace' },
 { name: 'copy', icon: '📋', label: 'Copiar' },
 { name: 'paste', icon: '📄', label: 'Pegar' },
 { name: 'cut', icon: '✂️', label: 'Cortar' },
 { name: 'edit', icon: '✏️', label: 'Editar' },
 { name: 'delete', icon: '🗑️', label: 'Eliminar' },
 { name: 'add', icon: '➕', label: 'Agregar' },
 { name: 'remove', icon: '➖', label: 'Quitar' },
 { name: 'check', icon: '✔️', label: 'Verificar' },
 { name: 'close', icon: '❌', label: 'Cerrar' },
 { name: 'menu', icon: '☰', label: 'Menú' },
 { name: 'home', icon: '🏠', label: 'Inicio' },
 { name: 'user', icon: '👤', label: 'Usuario' },
 { name: 'users', icon: '👥', label: 'Usuarios' },
 { name: 'team', icon: '👨‍👩‍👧‍👦', label: 'Equipo' },
 { name: 'building', icon: '🏢', label: 'Edificio' },
 { name: 'location', icon: '📍', label: 'Ubicación' },
 { name: 'map', icon: '🗺️', label: 'Mapa' },
 { name: 'calendar', icon: '📅', label: 'Calendario' },
 { name: 'clock', icon: '🕐', label: 'Reloj' },
 { name: 'timer', icon: '⏱️', label: 'Cronómetro' },
 { name: 'alarm', icon: '⏰', label: 'Alarma' }
];

export function IconPicker({ value, onChange, className = '' }: IconPickerProps) {
 const [isOpen, setIsOpen] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');

 const filteredIcons = AVAILABLE_ICONS.filter(icon =>
 icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
 icon.name.toLowerCase().includes(searchTerm.toLowerCase())
 );

 const selectedIcon = AVAILABLE_ICONS.find(icon => icon.name === value);

 const handleSelect = (iconName: string) => {
 onChange(iconName);
 setIsOpen(false);
 setSearchTerm('');
 };

 return (
 <div className={`relative ${className}`}>
 <button
 type="button"
 onClick={() => setIsOpen(!isOpen)}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring text-foreground flex items-center justify-between"
 >
 <div className="flex items-center space-x-2">
 {selectedIcon ? (
 <>
 <span className="text-lg">{selectedIcon.icon}</span>
 <span className="text-sm">{selectedIcon.label}</span>
 </>
 ) : (
 <span className="text-muted-foreground">Seleccionar icono</span>
 )}
 </div>
 <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </button>

 {isOpen && (
 <div className="absolute z-50 mt-1 w-full bg-background dark:bg-[#0a1222] border border-border rounded-md shadow-lg max-h-80 overflow-hidden">
 {/* Search */}
 <div className="p-3 border-b border-border">
 <input
 type="text"
 placeholder="Buscar icono..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
 />
 </div>

 {/* Icons Grid */}
 <div className="max-h-64 overflow-y-auto p-2">
 <div className="grid grid-cols-6 gap-2">
 {filteredIcons.map((icon) => (
 <button
 key={icon.name}
 type="button"
 onClick={() => handleSelect(icon.name)}
 className={`p-2 rounded-md hover:bg-accent flex flex-col items-center space-y-1 transition-colors ${
 value === icon.name 
 ? 'bg-blue-100 border-2 border-blue-500' 
 : 'border-2 border-transparent'
 }`}
 title={icon.label}
 >
 <span className="text-lg">{icon.icon}</span>
 <span className="text-xs text-muted-foreground text-center leading-tight">
 {icon.label}
 </span>
 </button>
 ))}
 </div>
 
 {filteredIcons.length === 0 && (
 <div className="text-center py-4 text-muted-foreground">
 No se encontraron iconos
 </div>
 )}
 </div>

 {/* Clear selection */}
 <div className="p-2 border-t border-border">
 <button
 type="button"
 onClick={() => handleSelect('')}
 className="w-full px-3 py-2 text-sm text-muted-foreground hover:text-gray-800 hover:bg-accent rounded-md transition-colors"
 >
 Sin icono
 </button>
 </div>
 </div>
 )}
 </div>
 );
}