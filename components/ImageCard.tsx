
import React from 'react';
import { DownloadIcon, ZoomIcon, AddIcon } from './icons';

interface ImageCardProps {
  imageUrl: string;
  onDownload: () => void;
  onZoom: () => void;
  onAddToReferences: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ imageUrl, onDownload, onZoom, onAddToReferences }) => {
  return (
    <div className="relative group rounded-lg overflow-hidden aspect-square shadow-lg">
      <img src={imageUrl} alt="Generated asset" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
        <div className="flex space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={onDownload}
            title="Pobierz"
            className="p-3 bg-gray-800/80 text-white rounded-full hover:bg-emerald-600 transition-colors"
          >
            <DownloadIcon className="h-6 w-6" />
          </button>
          <button
            onClick={onZoom}
            title="Powiększ"
            className="p-3 bg-gray-800/80 text-white rounded-full hover:bg-emerald-600 transition-colors"
          >
            <ZoomIcon className="h-6 w-6" />
          </button>
          <button
            onClick={onAddToReferences}
            title="Dodaj do referencji"
            className="p-3 bg-gray-800/80 text-white rounded-full hover:bg-emerald-600 transition-colors"
          >
            <AddIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
