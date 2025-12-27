import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
   onDirectorySelected: (directory: string) => void;
   onCharactersChange: (characters: string) => void;
   characters: string;
   error?: string;
}

export function ImageUploader({ onDirectorySelected, onCharactersChange, characters, error }: ImageUploaderProps) {
   const [directory, setDirectory] = useState('');

   const handleBrowse = async () => {
      try {
         const { open } = await import('@tauri-apps/plugin-dialog');
         const selected = await open({
            directory: true,
            multiple: false,
            title: 'Select Character Images Directory',
         });

         if (selected && typeof selected === 'string') {
            setDirectory(selected);
            onDirectorySelected(selected);
         }
      } catch (error) {
         console.error('Failed to open directory:', error);
      }
   };

   return (
      <Card className='p-6'>
         <h2 className='text-xl font-bold mb-4'>1. Select Images Directory</h2>

         <div className='space-y-4'>
            <div>
               <label className='block text-sm font-medium mb-2'>Characters (order matters)</label>
               <input
                  type='text'
                  value={characters}
                  onChange={(e) => onCharactersChange(e.target.value)}
                  placeholder='0123456789,.'
                  className={`w-full px-3 py-2 border rounded-md ${
                     error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
               />
               {error ? (
                  <div className='mt-2 p-3 bg-red-50 border border-red-200 rounded-md'>
                     <div className='flex items-start gap-2'>
                        <svg
                           className='w-5 h-5 text-red-600 mt-0.5 flex-shrink-0'
                           fill='none'
                           stroke='currentColor'
                           viewBox='0 0 24 24'
                        >
                           <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                           />
                        </svg>
                        <div className='flex-1'>
                           <p className='text-sm font-medium text-red-800'>Failed to load images</p>
                           <p className='text-sm text-red-700 mt-1'>{error}</p>
                        </div>
                     </div>
                  </div>
               ) : (
                  <p className='text-sm text-gray-500 mt-1'>
                     Enter characters in the order they should appear. Each character should have a corresponding PNG
                     file (e.g., "0.png", "1.png", ",.png", "..png")
                  </p>
               )}
            </div>
            <div>
               <label className='block text-sm font-medium mb-2'>Directory containing character PNG files</label>
               <div className='flex gap-2'>
                  <input
                     type='text'
                     value={directory}
                     readOnly
                     placeholder='No directory selected...'
                     className='flex-1 px-3 py-2 border rounded-md bg-gray-50'
                  />
                  <Button onClick={handleBrowse}>Browse...</Button>
               </div>
            </div>
         </div>
      </Card>
   );
}
