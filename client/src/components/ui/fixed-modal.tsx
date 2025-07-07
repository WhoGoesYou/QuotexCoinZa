import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FixedModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const FixedModal = React.forwardRef<
  HTMLDivElement,
  FixedModalProps
>(({ open, onClose, children, className }, ref) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div
        ref={ref}
        className={cn(
          "relative z-[1000] w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden",
          className
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-[1001] p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
        
        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[90vh] p-6">
          {children}
        </div>
      </div>
    </div>
  );
});

FixedModal.displayName = "FixedModal";

export { FixedModal };