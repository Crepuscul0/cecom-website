'use client';

import { Plus, X } from 'lucide-react';

interface FormListProps {
  label: string;
  items: string[];
  onItemsChange: (items: string[]) => void;
  addButtonText: string;
  removeButtonText: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function FormList({
  label,
  items,
  onItemsChange,
  addButtonText,
  removeButtonText,
  placeholder = '',
  required = false,
  error
}: FormListProps) {
  const addItem = () => {
    onItemsChange([...items, '']);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onItemsChange(newItems);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              title={removeButtonText}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        >
          <Plus className="h-4 w-4" />
          {addButtonText}
        </button>
      </div>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}