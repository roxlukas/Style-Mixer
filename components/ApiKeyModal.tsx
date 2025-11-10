
import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentApiKey: string | null;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentApiKey }) => {
  const [key, setKey] = useState('');

  useEffect(() => {
    if (currentApiKey) {
      setKey(currentApiKey);
    }
  }, [currentApiKey]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(key);
  };

  const hasApiKey = !!currentApiKey;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={hasApiKey ? onClose : undefined} // Prevent closing by clicking overlay if no key is set
    >
      <div 
        className="relative w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {hasApiKey && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
            aria-label="Zamknij"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        )}
        <h2 className="text-xl font-bold mb-4">Konfiguracja Klucza API Gemini</h2>
        <p className="text-gray-400 mb-4 text-sm">
          Aby korzystać z aplikacji, potrzebujesz klucza API Google Gemini. Wklej swój klucz poniżej. Zostanie on zapisany lokalnie w Twojej przeglądarce.
        </p>
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
            Twój Klucz API
          </label>
          <input
            id="apiKey"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Wprowadź swój klucz API..."
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
        </div>
        <p className="text-xs text-gray-500 mb-6">
          Nie masz klucza? Wygeneruj go w{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline"
          >
            Google AI Studio
          </a>.
        </p>
        <button
          onClick={handleSave}
          disabled={!key.trim()}
          className="w-full py-2 px-4 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Zapisz Klucz
        </button>
      </div>
    </div>
  );
};

export default ApiKeyModal;
