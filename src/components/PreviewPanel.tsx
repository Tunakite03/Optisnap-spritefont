import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PreviewPanelProps {
   previewUrl: string | null;
   onGenerate: () => void;
   isGenerating: boolean;
   canGenerate: boolean;
}

export function PreviewPanel({ previewUrl, onGenerate, isGenerating, canGenerate }: PreviewPanelProps) {
   return (
      <Card className='p-6'>
         <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-bold'>3. Preview & Generate</h2>
            <Button
               onClick={onGenerate}
               disabled={!canGenerate || isGenerating}
               className='bg-green-600 hover:bg-green-700'
            >
               {isGenerating ? 'Generating...' : 'Generate Sprite Font'}
            </Button>
         </div>

         <div className='border rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center'>
            {previewUrl ? (
               <div className='w-full overflow-auto'>
                  <img
                     src={previewUrl}
                     alt='Sprite Font Preview'
                     className='max-w-full h-auto'
                     style={{ imageRendering: 'pixelated' }}
                  />
               </div>
            ) : (
               <p className='text-gray-400'>
                  {canGenerate
                     ? 'Adjust spacing and click Generate to create sprite font'
                     : 'Select a directory and enter characters to start'}
               </p>
            )}
         </div>
      </Card>
   );
}
