import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { ReferenceImage, GeneratedImage, AspectRatio, Project } from './types';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Modal from './components/Modal';
import ApiKeyModal from './components/ApiKeyModal';
import { analyzeImageStyle, synthesizeStyle, generateStyledImage } from './services/geminiService';
import { fileToGenerativePart } from './utils/file';

// Special value to indicate that the app is running in an authenticated AI Studio environment
const AI_STUDIO_SESSION = 'AI_STUDIO_SESSION';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true); // New state for auth check
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  const [imageCount, setImageCount] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('square');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      // As per the new requirement, first check for the environment variable.
      // This indicates we are in an environment like AI Studio.
      if (process.env.API_KEY) {
        console.log("AI Studio environment detected via process.env.API_KEY.");
        setApiKey(AI_STUDIO_SESSION);
      } else {
        // If the environment variable is not set, fall back to the user-provided key.
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) {
          setApiKey(storedKey);
        } else {
          // If no stored key, prompt the user to enter one.
          setIsApiModalOpen(true);
        }
      }
      setIsAuthChecking(false);
    };

    checkAuth();
  }, []);


  useEffect(() => {
    // Initialize with a default project if none exist and auth check is complete
    if (!isAuthChecking && projects.length === 0) {
      const defaultProjectId = self.crypto.randomUUID();
      setProjects([
        {
          id: defaultProjectId,
          name: 'Project 1',
          referenceImages: [],
          history: [],
          prompt: 'grafika do promocji webinaru z tekstem. Ninja trzymający ten napis "Jesteśmy LIVE".',
        },
      ]);
      setActiveProjectId(defaultProjectId);
    }
  }, [projects, isAuthChecking]);
  
  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const handleApiKeySave = (key: string) => {
    const trimmedKey = key.trim();
    if (trimmedKey) {
      setApiKey(trimmedKey);
      localStorage.setItem('gemini_api_key', trimmedKey);
      setIsApiModalOpen(false);
      setError(null);
    } else {
      setError("Klucz API nie może być pusty.");
    }
  };

  const updateActiveProject = (updatedData: Partial<Project>) => {
    if (!activeProjectId) return;
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p.id === activeProjectId ? { ...p, ...updatedData } : p
      )
    );
  };

  const addProject = () => {
    const newProjectId = self.crypto.randomUUID();
    const newProject: Project = {
      id: newProjectId,
      name: `Project ${projects.length + 1}`,
      referenceImages: [],
      history: [],
      prompt: '',
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProjectId);
  };

  const deleteProject = (idToDelete: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten projekt? Tej operacji nie można cofnąć.')) {
      setProjects(prev => {
        const remainingProjects = prev.filter(p => p.id !== idToDelete);
        if (activeProjectId === idToDelete) {
          setActiveProjectId(remainingProjects[0]?.id || null);
        }
        return remainingProjects;
      });
    }
  };

  const updateProjectName = (id: string, newName: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  };
  
  const handleGenerate = useCallback(async () => {
    const effectiveApiKey = apiKey === AI_STUDIO_SESSION ? process.env.API_KEY : apiKey;

    if (!effectiveApiKey) {
        setError('Klucz API Gemini nie jest skonfigurowany. Proszę go ustawić.');
        setIsApiModalOpen(true);
        return;
    }
    if (!activeProject) {
        setError('Nie wybrano aktywnego projektu.');
        return;
    }
    if (activeProject.referenceImages.length === 0) {
      setError('Proszę przesłać co najmniej jeden obraz referencyjny.');
      return;
    }
    if (!activeProject.prompt.trim()) {
      setError('Proszę wpisać prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
      
      let synthesizedStyle: string;
      const currentFingerprint = activeProject.referenceImages.map(img => img.id).sort();
      const cachedFingerprint = activeProject.styleFingerprint?.sort() ?? [];
      const isCacheValid = activeProject.cachedStylePrompt && JSON.stringify(currentFingerprint) === JSON.stringify(cachedFingerprint);

      if (isCacheValid) {
        synthesizedStyle = activeProject.cachedStylePrompt as string;
        setLoadingMessage(`Używanie zapamiętanego stylu...`);
      } else {
        setLoadingMessage('Krok 1/3: Analizowanie stylów obrazów referencyjnych...');
        const styleDescriptions = await Promise.all(
          activeProject.referenceImages.map(img => analyzeImageStyle(ai, img.part))
        );
        
        setLoadingMessage('Krok 2/3: Synteza spójnego opisu stylu...');
        synthesizedStyle = await synthesizeStyle(ai, styleDescriptions);
      }
      
      setLoadingMessage(`Generowanie ${imageCount} obrazów...`);

      const aspectRatioString = {
        portrait: '9:16',
        square: '1:1',
        landscape: '16:9',
      }[aspectRatio];

      const finalPrompt = `Aspect ratio: ${aspectRatioString}. Styl: ${synthesizedStyle}. Treść: ${activeProject.prompt}`;

      const imagePromises = Array.from({ length: imageCount }).map(() =>
        generateStyledImage(ai, finalPrompt)
      );

      const newImageBase64s = await Promise.all(imagePromises);

      const newGeneratedImages = newImageBase64s.map(base64 => ({
        id: self.crypto.randomUUID(),
        url: `data:image/png;base64,${base64}`
      }));

      setGeneratedImages(newGeneratedImages);
      updateActiveProject({
        history: [...newGeneratedImages, ...activeProject.history].slice(0, 20),
        cachedStylePrompt: synthesizedStyle,
        styleFingerprint: currentFingerprint,
      });

    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Wystąpił nieznany błąd.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [activeProject, imageCount, aspectRatio, apiKey]);
  
  const addImageToReferences = useCallback(async (imageUrl: string) => {
    if (!activeProject) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `ref-${Date.now()}.png`, { type: 'image/png' });
      const part = await fileToGenerativePart(file);
      const newRef: ReferenceImage = {
        id: self.crypto.randomUUID(),
        url: imageUrl,
        part: part
      };
      updateActiveProject({
        referenceImages: [...activeProject.referenceImages, newRef]
      });
    } catch (e) {
      console.error("Failed to add image to references:", e);
      setError("Nie udało się dodać obrazu do referencji.");
    }
  }, [activeProject]);

  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-200">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-dashed border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Weryfikacja uwierzytelnienia...</p>
        </div>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-200">
        <div className="text-center">
          <p className="text-xl mb-4">Nie masz żadnych projektów.</p>
          <button
            onClick={addProject}
            className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Stwórz pierwszy projekt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-gray-200 font-sans">
      <ApiKeyModal 
        isOpen={isApiModalOpen}
        onClose={() => { if (apiKey) setIsApiModalOpen(false) }}
        onSave={handleApiKeySave}
        currentApiKey={apiKey}
      />
      <Sidebar
        key={activeProject.id}
        referenceImages={activeProject.referenceImages}
        setReferenceImages={(images) => updateActiveProject({ referenceImages: images })}
        history={activeProject.history}
        prompt={activeProject.prompt}
        setPrompt={(prompt) => updateActiveProject({ prompt })}
        imageCount={imageCount}
        setImageCount={setImageCount}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        onGenerate={handleGenerate}
        isLoading={isLoading}
      />
      <MainContent
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onAddProject={addProject}
        onDeleteProject={deleteProject}
        onUpdateProjectName={updateProjectName}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        error={error}
        generatedImages={generatedImages}
        onZoomImage={setZoomedImage}
        onAddToReferences={addImageToReferences}
      />
      {zoomedImage && <Modal imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />}
    </div>
  );
};

export default App;