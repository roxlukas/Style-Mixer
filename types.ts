import type { Part } from '@google/genai';

export interface ReferenceImage {
  id: string;
  url: string;
  part: Part;
}

export interface GeneratedImage {
  id: string;
  url: string;
}

export type AspectRatio = 'portrait' | 'square' | 'landscape';

export interface Project {
  id: string;
  name: string;
  referenceImages: ReferenceImage[];
  history: GeneratedImage[];
  prompt: string;
  cachedStylePrompt?: string;
  styleFingerprint?: string[];
}
