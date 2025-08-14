'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Shield,
  Wifi,
  Phone,
  Monitor,
  Server,
  Zap,
  Grid3X3,
  Database,
  Cloud,
  Lock,
  Network,
  Smartphone,
  Laptop,
  HardDrive,
  Router,
  Cable,
  Cpu,
  MemoryStick,
  Printer,
  Camera,
  Headphones,
  Keyboard,
  Mouse,
  Gamepad2,
  Tablet,
  Watch,
  Tv,
  Radio,
  Bluetooth,
  Usb,
  Wifi as WifiIcon,
  Search,
  X
} from 'lucide-react';

// Available icons for categories
const AVAILABLE_ICONS = {
  // Security & Protection
  shield: { icon: Shield, name: 'Shield', category: 'security' },
  lock: { icon: Lock, name: 'Lock', category: 'security' },
  
  // Networking
  wifi: { icon: Wifi, name: 'WiFi', category: 'networking' },
  network: { icon: Network, name: 'Network', category: 'networking' },
  router: { icon: Router, name: 'Router', category: 'networking' },
  cable: { icon: Cable, name: 'Cable', category: 'networking' },
  bluetooth: { icon: Bluetooth, name: 'Bluetooth', category: 'networking' },
  
  // Communication
  phone: { icon: Phone, name: 'Phone', category: 'communication' },
  smartphone: { icon: Smartphone, name: 'Smartphone', category: 'communication' },
  headphones: { icon: Headphones, name: 'Headphones', category: 'communication' },
  radio: { icon: Radio, name: 'Radio', category: 'communication' },
  
  // Computing
  monitor: { icon: Monitor, name: 'Monitor', category: 'computing' },
  laptop: { icon: Laptop, name: 'Laptop', category: 'computing' },
  tablet: { icon: Tablet, name: 'Tablet', category: 'computing' },
  cpu: { icon: Cpu, name: 'CPU', category: 'computing' },
  memory: { icon: MemoryStick, name: 'Memory', category: 'computing' },
  
  // Storage & Servers
  server: { icon: Server, name: 'Server', category: 'storage' },
  database: { icon: Database, name: 'Database', category: 'storage' },
  harddrive: { icon: HardDrive, name: 'Hard Drive', category: 'storage' },
  cloud: { icon: Cloud, name: 'Cloud', category: 'storage' },
  
  // Peripherals
  printer: { icon: Printer, name: 'Printer', category: 'peripherals' },
  camera: { icon: Camera, name: 'Camera', category: 'peripherals' },
  keyboard: { icon: Keyboard, name: 'Keyboard', category: 'peripherals' },
  mouse: { icon: Mouse, name: 'Mouse', category: 'peripherals' },
  usb: { icon: Usb, name: 'USB', category: 'peripherals' },
  
  // Entertainment
  tv: { icon: Tv, name: 'TV', category: 'entertainment' },
  gamepad: { icon: Gamepad2, name: 'Gamepad', category: 'entertainment' },
  watch: { icon: Watch, name: 'Watch', category: 'entertainment' },
  
  // General
  zap: { icon: Zap, name: 'Power', category: 'general' },
  grid: { icon: Grid3X3, name: 'Grid', category: 'general' }
};

const ICON_CATEGORIES = {
  security: 'Security',
  networking: 'Networking',
  communication: 'Communication',
  computing: 'Computing',
  storage: 'Storage',
  peripherals: 'Peripherals',
  entertainment: 'Entertainment',
  general: 'General'
};

interface IconPickerProps {
  selectedIcon?: string;
  onIconSelect: (iconKey: string) => void;
  className?: string;
}

export function IconPicker({ selectedIcon, onIconSelect, className = '' }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const t = useTranslations('Admin.forms.category');

  // Filter icons based on search and category
  const filteredIcons = Object.entries(AVAILABLE_ICONS).filter(([key, iconData]) => {
    const matchesSearch = searchTerm === '' || 
      iconData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || iconData.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleIconSelect = (iconKey: string) => {
    onIconSelect(iconKey);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedIconData = selectedIcon ? AVAILABLE_ICONS[selectedIcon as keyof typeof AVAILABLE_ICONS] : null;
  const SelectedIconComponent = selectedIconData?.icon;

  return (
    <div className={`relative ${className}`}>
      {/* Selected Icon Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-border rounded-md bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <div className="flex items-center gap-2">
          {SelectedIconComponent ? (
            <>
              <SelectedIconComponent className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-foreground">{selectedIconData.name}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">{t('selectIcon')}</span>
          )}
        </div>
        <Grid3X3 className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Icon Picker Modal */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search and Filter Header */}
          <div className="p-3 border-b border-border">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(ICON_CATEGORIES).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          {/* Icons Grid */}
          <div className="p-2 max-h-60 overflow-y-auto">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-6 gap-1">
                {filteredIcons.map(([key, iconData]) => {
                  const IconComponent = iconData.icon;
                  const isSelected = selectedIcon === key;
                  
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleIconSelect(key)}
                      className={`p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        isSelected ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500' : 'text-muted-foreground'
                      }`}
                      title={iconData.name}
                    >
                      <IconComponent className="h-5 w-5 mx-auto" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No icons found
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="p-2 border-t border-border">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}