import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface StableDialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const StableDialog = React.forwardRef<
  HTMLDivElement,
  StableDialogProps
>(({ open, onClose, children, className }, ref) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
      
      {/* Dialog Content */}
      <div
        ref={ref}
        className={cn(
          "relative z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background border shadow-lg rounded-lg p-6",
          className
        )}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        {children}
      </div>
    </div>
  );
});

StableDialog.displayName = "StableDialog";

export { StableDialog };