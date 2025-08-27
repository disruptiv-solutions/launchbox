import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";
import { Button } from "./button";

const modalVariants = cva(
  "fixed inset-0 z-50 flex items-center justify-center p-4",
  {
    variants: {
      variant: {
        default: "",
        center: "",
        top: "items-start pt-20",
        bottom: "items-end pb-20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const modalOverlayVariants = cva(
  "fixed inset-0 transition-opacity",
  {
    variants: {
      variant: {
        default: "bg-black/50 backdrop-blur-sm",
        dark: "bg-black/70 backdrop-blur-md",
        light: "bg-white/70 backdrop-blur-md",
        glass: "backdrop-blur-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const modalContentVariants = cva(
  "relative w-full max-w-lg transform overflow-hidden rounded-lg text-left shadow-xl transition-all animate-scale-in",
  {
    variants: {
      variant: {
        default: "bg-[var(--card)] border border-[var(--border)]",
        glass: "glass-card",
        elevated: "bg-[var(--card)] border border-[var(--border)] shadow-2xl",
        gradient: "gradient-surface border border-[var(--border)]",
      },
      size: {
        sm: "max-w-sm",
        default: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-7xl mx-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ModalProps
  extends VariantProps<typeof modalVariants>,
    VariantProps<typeof modalContentVariants> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  overlayVariant?: VariantProps<typeof modalOverlayVariants>["variant"];
  className?: string;
}

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({
    isOpen,
    onClose,
    children,
    title,
    description,
    variant: modalVariant = "default",
    variant: contentVariant = "default",
    size = "default",
    overlayVariant = "default",
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    className,
    ...props
  }, ref) => {
    const modalRef = React.useRef<HTMLDivElement>(null);

    // Handle escape key
    React.useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (closeOnEscape && event.key === "Escape") {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
        return () => {
          document.removeEventListener("keydown", handleEscape);
          document.body.style.overflow = "unset";
        };
      }
    }, [isOpen, closeOnEscape, onClose]);

    // Handle overlay click
    const handleOverlayClick = (event: React.MouseEvent) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    };

    // Focus management
    React.useEffect(() => {
      if (isOpen && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        firstElement?.focus();
      }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <>
        {/* Overlay */}
        <div
          className={cn(modalOverlayVariants({ variant: overlayVariant }))}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          className={cn(modalVariants({ variant: modalVariant }))}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          aria-describedby={description ? "modal-description" : undefined}
        >
          <div
            ref={modalRef}
            className={cn(modalContentVariants({ variant: contentVariant, size, className }))}
            {...props}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 pb-4">
                <div>
                  {title && (
                    <h3
                      id="modal-title"
                      className="text-lg font-semibold text-[var(--card-foreground)]"
                    >
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p
                      id="modal-description"
                      className="mt-1 text-sm text-[var(--muted-foreground)]"
                    >
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onClose}
                    className="ml-4 hover:bg-[var(--accent)]"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <div className={cn(title || showCloseButton ? "px-6 pb-6" : "p-6")}>
              {children}
            </div>
          </div>
        </div>
      </>
    );
  }
);

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
      {...props}
    >
      {children}
    </div>
  )
);

const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6", className)}
      {...props}
    >
      {children}
    </div>
  )
);

const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-end space-x-3 p-6 pt-4 border-t border-[var(--border)]", className)}
      {...props}
    >
      {children}
    </div>
  )
);

const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-[var(--card-foreground)]", className)}
    {...props}
  />
));

const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[var(--muted-foreground)]", className)}
    {...props}
  />
));

Modal.displayName = "Modal";
ModalHeader.displayName = "ModalHeader";
ModalBody.displayName = "ModalBody";
ModalFooter.displayName = "ModalFooter";
ModalTitle.displayName = "ModalTitle";
ModalDescription.displayName = "ModalDescription";

export { Modal, ModalHeader, ModalBody, ModalFooter, ModalTitle, ModalDescription };