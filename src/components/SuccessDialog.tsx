import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

interface SuccessDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   outputPath: string;
   spriteWidth: number;
   spriteHeight: number;
}

export const SuccessDialog = ({ open, onOpenChange, outputPath, spriteWidth, spriteHeight }: SuccessDialogProps) => {
   return (
      <Dialog
         open={open}
         onOpenChange={onOpenChange}
      >
         <DialogContent>
            <DialogHeader>
               <div className='flex items-center gap-3 mb-2'>
                  <div className='w-12 h-12 rounded-full bg-green-100 flex items-center justify-center'>
                     <svg
                        className='w-6 h-6 text-green-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                     >
                        <path
                           strokeLinecap='round'
                           strokeLinejoin='round'
                           strokeWidth={2}
                           d='M5 13l4 4L19 7'
                        />
                     </svg>
                  </div>
                  <DialogTitle className='text-xl'>Sprite Font Generated Successfully!</DialogTitle>
               </div>
               <DialogDescription className='space-y-3 pt-2'>
                  <div className='bg-gray-50 rounded-lg p-4 space-y-2'>
                     <div className='flex items-start gap-2'>
                        <span className='text-gray-600 font-medium min-w-[80px]'>Output:</span>
                        <span className='text-gray-900 break-all flex-1'>{outputPath}</span>
                     </div>
                     <div className='flex items-center gap-2'>
                        <span className='text-gray-600 font-medium min-w-[80px]'>Size:</span>
                        <span className='text-gray-900'>
                           {spriteWidth} × {spriteHeight} px
                        </span>
                     </div>
                     <div className='flex items-center gap-2'>
                        <span className='text-gray-600 font-medium min-w-[80px]'>Config:</span>
                        <span className='text-gray-900'>config.txt</span>
                     </div>
                  </div>
               </DialogDescription>
            </DialogHeader>
            <DialogFooter>
               <Button
                  onClick={() => onOpenChange(false)}
                  className='bg-green-600 hover:bg-green-700'
               >
                  OK
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};
