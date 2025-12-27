import * as React from 'react';

export interface DialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   children: React.ReactNode;
}

export interface DialogContentProps {
   children: React.ReactNode;
   className?: string;
}

export interface DialogHeaderProps {
   children: React.ReactNode;
   className?: string;
}

export interface DialogTitleProps {
   children: React.ReactNode;
   className?: string;
}

export interface DialogDescriptionProps {
   children: React.ReactNode;
   className?: string;
}

export interface DialogFooterProps {
   children: React.ReactNode;
   className?: string;
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
   if (!open) return null;

   return (
      <div className='fixed inset-0 z-50 flex items-center justify-center'>
         <div
            className='fixed inset-0 bg-black/50 backdrop-blur-sm'
            onClick={() => onOpenChange(false)}
         />
         {children}
      </div>
   );
};

export const DialogContent = ({ children, className = '' }: DialogContentProps) => {
   return (
      <div className={`relative z-50 bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 ${className}`}>{children}</div>
   );
};

export const DialogHeader = ({ children, className = '' }: DialogHeaderProps) => {
   return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
};

export const DialogTitle = ({ children, className = '' }: DialogTitleProps) => {
   return <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h2>;
};

export const DialogDescription = ({ children, className = '' }: DialogDescriptionProps) => {
   return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
};

export const DialogFooter = ({ children, className = '' }: DialogFooterProps) => {
   return <div className={`flex justify-end gap-2 p-6 pt-0 ${className}`}>{children}</div>;
};
