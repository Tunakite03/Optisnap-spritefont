// Character info from loaded images
export interface CharacterInfo {
   character: string;
   width: number;
   height: number;
   spacing: number;
   offsetY: number;
}

// Request to load character images
export interface LoadImagesRequest {
   directory: string;
   characters: string;
}

// Response from loading images
export interface LoadImagesResponse {
   characters: CharacterInfo[];
   maxWidth: number;
   maxHeight: number;
}

// Request to generate sprite font
export interface GenerateSpriteFontRequest {
   directory: string;
   characters: string;
   spacingConfig: Record<string, number>;
   bottomPadding: number;
   outputPath: string;
}

// Response from sprite font generation
export interface GenerateSpriteFontResponse {
   success: boolean;
   outputPath: string;
   spriteWidth: number;
   spriteHeight: number;
   configData: string;
}

// Preview request
export interface PreviewRequest {
   directory: string;
   characters: string;
   spacingConfig: Record<string, number>;
   bottomPadding: number;
}

// Preview response
export interface PreviewResponse {
   success: boolean;
   previewBase64: string;
   width: number;
   height: number;
}
