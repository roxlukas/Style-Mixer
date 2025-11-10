
import React from 'react';
import { CloseIcon } from './icons';

interface ModalProps {
  imageUrl: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] bg-gray-900 p-2 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={imageUrl} alt="Zoomed view" className="max-w-full max-h-[85vh] object-contain rounded" />
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-gray-700 text-white rounded-full p-2 hover:bg-red-500 transition-colors"
          aria-label="Zamknij"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default Modal;
