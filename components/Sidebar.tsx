
import React, { useRef } from 'react';
import type { ReferenceImage, AspectRatio, GeneratedImage } from '../types';
import { fileToGenerativePart } from '../utils/file';
import { UploadIcon, LightBulbIcon } from './icons';

interface SidebarProps {
  referenceImages: ReferenceImage[];
  setReferenceImages: (images: ReferenceImage[]) => void;
  history: GeneratedImage[];
  prompt: string;
  setPrompt: (prompt: string) => void;
  imageCount: number;
  setImageCount: (count: number) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  referenceImages,
  setReferenceImages,
  history,
  prompt,
  setPrompt,
  imageCount,
  setImageCount,
  aspectRatio,
  setAspectRatio,
  onGenerate,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesUpload = async (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      const newImages: ReferenceImage[] = await Promise.all(
        imageFiles.map(async (file) => {
          const part = await fileToGenerativePart(file);
          return {
            id: self.crypto.randomUUID(),
            url: URL.createObjectURL(file),
            part: part,
          };
        }),
      );
      setReferenceImages([...referenceImages, ...newImages]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesUpload(event.target.files);
  };

  const removeReferenceImage = (id: string) => {
    setReferenceImages(referenceImages.filter((img) => img.id !== id));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <aside className="w-full md:w-[360px] bg-gray-800 p-6 flex flex-col space-y-6 overflow-y-auto shrink-0">
      <header>
        <h1 className="text-2xl font-bold text-white">Style Mixer</h1>
        <p className="text-sm text-gray-400">Twórz zasoby graficzne w swoim unikalnym stylu wizualnym.</p>
      </header>
      
      {/* Reference Style */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-300">Styl Referencyjny</h2>
        <div 
          className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center text-gray-400 cursor-pointer hover:border-emerald-500 hover:text-emerald-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <UploadIcon className="mx-auto h-8 w-8 mb-2" />
          <p className="font-semibold">Kliknij, aby przesłać lub przeciągnij i upuść</p>
          <p className="text-xs">PNG, JPG, GIF do 10MB</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/png, image/jpeg, image/gif"
            className="hidden"
          />
        </div>
        {referenceImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {referenceImages.map((image) => (
              <div key={image.id} className="relative group">
                <img src={image.url} alt="Reference" className="rounded-md w-full h-full object-cover aspect-square" />
                <button
                  onClick={() => removeReferenceImage(image.id)}
                  className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Usuń obraz referencyjny ${image.id}`}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-300">Historia (Ostatnie 20)</h2>
        <div className="border border-gray-700 bg-gray-900/50 rounded-lg p-3 min-h-[80px] flex items-center justify-center">
          {history.length > 0 ? (
            <div className="grid grid-cols-5 gap-2 w-full">
              {history.map((item) => (
                <img key={item.id} src={item.url} alt="Generated" className="rounded-md w-full h-full object-cover aspect-square" />
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">Twoje ostatnie generacje pojawią się tutaj.</p>
          )}
        </div>
      </div>
      
      {/* Prompt */}
      <div className="space-y-2 flex-grow flex flex-col">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-300">Prompt</h2>
          <LightBulbIcon className="h-5 w-5 text-yellow-400" />
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Opisz, co chcesz wygenerować..."
          className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none flex-grow"
        />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Ilość obrazków</label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => setImageCount(num)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition ${imageCount === num ? 'bg-emerald-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Proporcje</label>
          <div className="grid grid-cols-3 gap-2">
            {(['portrait', 'square', 'landscape'] as AspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition capitalize ${aspectRatio === ratio ? 'bg-emerald-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full py-3 px-4 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Generowanie...' : 'Generuj'}
      </button>
    </aside>
  );
};

export default Sidebar;
