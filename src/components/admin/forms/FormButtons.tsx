'use client';

interface FormButtonsProps {
  onCancel: () => void;
  onSave: () => void;
  saveText: string;
  cancelText: string;
  isLoading?: boolean;
  loadingText?: string;
}

export function FormButtons({ 
  onCancel, 
  onSave, 
  saveText, 
  cancelText, 
  isLoading = false,
  loadingText = 'Saving...'
}: FormButtonsProps) {
  return (
    <div className="flex justify-end space-x-3 p-6 border-t border-border bg-muted/30">
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cancelText}
      </button>
      <button
        type="submit"
        onClick={onSave}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        )}
        {isLoading ? loadingText : saveText}
      </button>
    </div>
  );
}