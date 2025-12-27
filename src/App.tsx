import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Toaster, toast } from 'sonner';
import { TitleBar } from '@/components/TitleBar';
import { ImageUploader } from '@/components/ImageUploader';
import { SpacingAdjuster } from '@/components/SpacingAdjuster';
import { PreviewPanel } from '@/components/PreviewPanel';
import { SuccessDialog } from '@/components/SuccessDialog';
import { CharacterInfo, LoadImagesResponse, GenerateSpriteFontResponse, PreviewResponse } from '@/types';
import './App.css';

function App() {
   const [directory, setDirectory] = useState('');
   const [characters, setCharacters] = useState('0123456789');
   const [characterInfos, setCharacterInfos] = useState<CharacterInfo[]>([]);
   const [bottomPadding, setBottomPadding] = useState(0);
   const [spacingConfig, setSpacingConfig] = useState<Record<string, number>>({});
   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
   const [isGenerating, setIsGenerating] = useState(false);
   const [successDialogOpen, setSuccessDialogOpen] = useState(false);
   const [successData, setSuccessData] = useState<{
      outputPath: string;
      spriteWidth: number;
      spriteHeight: number;
   } | null>(null);
   const [loadError, setLoadError] = useState<string>('');

   // Load character images when directory and characters change
   useEffect(() => {
      if (directory && characters) {
         loadCharacterImages();
      }
   }, [directory, characters]);

   // Generate preview when spacing or padding changes
   useEffect(() => {
      if (directory && characters && characterInfos.length > 0) {
         generatePreview();
      }
   }, [spacingConfig, bottomPadding]);

   const loadCharacterImages = async () => {
      try {
         setLoadError('');
         const response: LoadImagesResponse = await invoke('load_character_images', {
            request: {
               directory,
               characters,
            },
         });

         setCharacterInfos(response.characters);

         // Initialize spacing config
         const initialSpacing: Record<string, number> = {};
         response.characters.forEach((char) => {
            initialSpacing[char.character] = char.spacing;
         });
         setSpacingConfig(initialSpacing);
      } catch (error) {
         const errorMessage = String(error);
         console.error('Failed to load character images:', error);
         setLoadError(errorMessage);
         toast.error('Failed to load images', {
            description: errorMessage,
            duration: 4000,
         });
      }
   };

   const generatePreview = async () => {
      try {
         const response: PreviewResponse = await invoke('generate_preview', {
            request: {
               directory,
               characters,
               spacingConfig,
               bottomPadding,
            },
         });

         if (response.success) {
            setPreviewUrl(response.previewBase64);
         }
      } catch (error) {
         console.error('Failed to generate preview:', error);
      }
   };

   const handleSpacingChange = (character: string, value: number) => {
      setSpacingConfig((prev) => ({
         ...prev,
         [character]: value,
      }));
   };

   const handleGenerate = async () => {
      if (!directory) {
         toast.error('Please select a directory first');
         return;
      }

      try {
         setIsGenerating(true);

         const { save } = await import('@tauri-apps/plugin-dialog');
         const savePath = await save({
            defaultPath: `${directory}/sprite_font.png`,
            filters: [
               {
                  name: 'PNG Image',
                  extensions: ['png'],
               },
            ],
         });

         if (!savePath) {
            setIsGenerating(false);
            return;
         }

         const response: GenerateSpriteFontResponse = await invoke('generate_sprite_font', {
            request: {
               directory,
               characters,
               spacingConfig,
               bottomPadding,
               outputPath: savePath,
            },
         });

         if (response.success) {
            setSuccessData({
               outputPath: response.outputPath,
               spriteWidth: response.spriteWidth,
               spriteHeight: response.spriteHeight,
            });
            setSuccessDialogOpen(true);
         }
      } catch (error) {
         console.error('Failed to generate sprite font:', error);
         toast.error('Failed to generate sprite font', {
            description: String(error),
            duration: 4000,
         });
      } finally {
         setIsGenerating(false);
      }
   };

   const canGenerate = directory && characters && characterInfos.length > 0 ? true : false;

   return (
      <div className='h-screen flex flex-col bg-gray-100'>
         <Toaster
            position='top-right'
            richColors
         />
         <TitleBar />

         <main className='flex-1 overflow-auto p-6'>
            <div className='max-w-6xl mx-auto space-y-6'>
               <div className='text-center mb-8'>
                  <h1 className='text-3xl font-bold text-gray-800'>Sprite Font Generator</h1>
                  <p className='text-gray-600 mt-2'>Create sprite fonts from individual character images</p>
               </div>

               <ImageUploader
                  onDirectorySelected={setDirectory}
                  onCharactersChange={setCharacters}
                  characters={characters}
                  error={loadError}
               />

               <SpacingAdjuster
                  characters={characterInfos}
                  bottomPadding={bottomPadding}
                  onBottomPaddingChange={setBottomPadding}
                  onSpacingChange={handleSpacingChange}
                  spacingConfig={spacingConfig}
               />

               <PreviewPanel
                  previewUrl={previewUrl}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                  canGenerate={canGenerate}
               />
            </div>
         </main>

         {successData && (
            <SuccessDialog
               open={successDialogOpen}
               onOpenChange={setSuccessDialogOpen}
               outputPath={successData.outputPath}
               spriteWidth={successData.spriteWidth}
               spriteHeight={successData.spriteHeight}
            />
         )}
      </div>
   );
}

export default App;
