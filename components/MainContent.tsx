
import React, { useState, useRef, useEffect } from 'react';
import type { GeneratedImage, Project } from '../types';
import ImageCard from './ImageCard';
import { SettingsIcon, ReloadIcon, ExpandIcon, CloseIcon } from './icons';

interface MainContentProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
  onDeleteProject: (id: string) => void;
  onUpdateProjectName: (id: string, newName: string) => void;
  onOpenApiModal: () => void;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  generatedImages: GeneratedImage[];
  onZoomImage: (url: string) => void;
  onAddToReferences: (url: string) => void;
}

const ProjectTab: React.FC<{
  project: Project;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdateName: (newName: string) => void;
}> = ({ project, isActive, onSelect, onDelete, onUpdateName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleNameClick = () => {
    if (isActive) {
      setIsEditing(true);
    } else {
      onSelect();
    }
  };

  const handleBlur = () => {
    if (name.trim()) {
      onUpdateName(name);
    } else {
      setName(project.name); // Revert if empty
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setName(project.name);
      setIsEditing(false);
    }
  };

  const activeClasses = 'text-white border-b-2 border-emerald-500';
  const inactiveClasses = 'text-gray-400 hover:text-white';

  return (
    <div
      className={`relative flex items-center space-x-2 py-2 px-3 cursor-pointer group ${isActive ? activeClasses : inactiveClasses}`}
      onClick={handleNameClick}
    >
      <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent text-sm text-white outline-none border-b border-gray-500"
        />
      ) : (
        <span className="text-sm">{project.name}</span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="text-gray-600 hover:text-red-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Usuń projekt ${project.name}`}
      >
        <CloseIcon className="h-3 w-3" />
      </button>
    </div>
  );
};


const MainContent: React.FC<MainContentProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onAddProject,
  onDeleteProject,
  onUpdateProjectName,
  onOpenApiModal,
  isLoading,
  loadingMessage,
  error,
  generatedImages,
  onZoomImage,
  onAddToReferences,
}) => {
  return (
    <main className="flex-1 flex flex-col bg-gray-900">
      <header className="flex justify-between items-center p-2 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          {projects.map(project => (
            <ProjectTab
              key={project.id}
              project={project}
              isActive={project.id === activeProjectId}
              onSelect={() => onSelectProject(project.id)}
              onDelete={() => onDeleteProject(project.id)}
              onUpdateName={(newName) => onUpdateProjectName(project.id, newName)}
            />
          ))}
          <button onClick={onAddProject} className="text-gray-400 text-2xl px-2 hover:text-white" aria-label="Dodaj nowy projekt">+</button>
        </div>
        <div className="flex items-center space-x-4 text-gray-400 pr-2">
          <button onClick={onOpenApiModal} title="Ustawienia API" className="hover:text-white transition-colors">
            <SettingsIcon className="h-5 w-5" />
          </button>
          <ReloadIcon className="h-5 w-5" />
          <ExpandIcon className="h-5 w-5" />
        </div>
      </header>

      <div className="flex-1 p-8 flex items-center justify-center overflow-auto">
        {isLoading && (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-dashed border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white">Style Mixer remiksuje Twoje obrazy...</h2>
            <p className="text-gray-400 mt-1">{loadingMessage || 'The mixer is grinding. This may take a moment.'}</p>
          </div>
        )}
        
        {!isLoading && error && (
          <div className="text-center text-red-400 bg-red-900/50 p-6 rounded-lg">
            <h3 className="font-bold">Błąd Generowania</h3>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && generatedImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {generatedImages.map((image) => (
              <ImageCard
                key={image.id}
                imageUrl={image.url}
                onDownload={() => downloadImage(image.url)}
                onZoom={() => onZoomImage(image.url)}
                onAddToReferences={() => onAddToReferences(image.url)}
              />
            ))}
          </div>
        )}

        {!isLoading && !error && generatedImages.length === 0 && (
          <div className="text-center text-gray-500">
            <p>Twoje wygenerowane zasoby pojawią się tutaj.</p>
          </div>
        )}
      </div>
    </main>
  );
};

// Dummy download function to be replaced by a proper implementation
const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `style-mixer-gen-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default MainContent;
