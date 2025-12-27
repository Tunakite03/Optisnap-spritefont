import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { CharacterInfo } from '@/types';

interface SpacingAdjusterProps {
   characters: CharacterInfo[];
   bottomPadding: number;
   onBottomPaddingChange: (value: number) => void;
   onSpacingChange: (character: string, value: number) => void;
   spacingConfig: Record<string, number>;
}

export function SpacingAdjuster({
   characters,
   bottomPadding,
   onBottomPaddingChange,
   onSpacingChange,
   spacingConfig,
}: SpacingAdjusterProps) {
   if (characters.length === 0) {
      return null;
   }

   return (
      <Card className='p-6'>
         <h2 className='text-xl font-bold mb-4'>2. Adjust Spacing</h2>

         <div className='space-y-4'>
            <div>
               <label className='flex items-center justify-between mb-2'>
                  <span className='text-sm font-medium'>Bottom Padding</span>
                  <span className='text-sm text-gray-500'>{bottomPadding}px</span>
               </label>
               <input
                  type='range'
                  min='0'
                  max='100'
                  value={bottomPadding}
                  onChange={(e) => onBottomPaddingChange(Number(e.target.value))}
                  className='w-full'
               />
            </div>

            <div className='border-t pt-4'>
               <h3 className='text-sm font-medium mb-3'>Character Spacing</h3>
               <div className='grid grid-cols-2 gap-4 max-h-96 overflow-y-auto'>
                  {characters.map((char) => (
                     <div key={char.character}>
                        <label className='flex items-center justify-between mb-1'>
                           <span className='text-sm font-medium'>
                              '{char.character}' ({char.width}×{char.height}px)
                           </span>
                           <span className='text-sm text-gray-500'>
                              {spacingConfig[char.character] ?? char.spacing}px
                           </span>
                        </label>
                        <input
                           type='range'
                           min='0'
                           max={char.width + 20}
                           value={spacingConfig[char.character] ?? char.spacing}
                           onChange={(e) => onSpacingChange(char.character, Number(e.target.value))}
                           className='w-full'
                        />
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </Card>
   );
}
