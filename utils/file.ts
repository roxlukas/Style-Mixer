import type { Part } from '@google/genai';

export const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // The result includes the data URL prefix (e.g., "data:image/png;base64,"), so we split it off.
        const base64Data = reader.result.split(',')[1];
        if (base64Data) {
            resolve(base64Data);
        } else {
            reject(new Error('Could not extract base64 data from file.'));
        }
      } else {
        reject(new Error('Failed to read file. Reader result is not a string.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file.'));
    };
    
    reader.readAsDataURL(file);
  });

  const data = await base64EncodedDataPromise;

  return {
    inlineData: { data, mimeType: file.type },
  };
};

export const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `style-mixer-gen-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};