import { GoogleGenAI, Modality, Part } from '@google/genai';

const STYLE_ANALYSIS_PROMPT = `Przeanalizuj styl artystyczny tego obrazu. Opisz zwięźle kluczowe cechy, w tym paletę kolorów, kreskę, teksturę, kompozycję i ogólny nastrój. Skup się wyłącznie na stylu.`;

export const analyzeImageStyle = async (ai: GoogleGenAI, imagePart: Part): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: STYLE_ANALYSIS_PROMPT }] },
        });
        return response.text;
    } catch (error) {
        console.error('Error analyzing image style:', error);
        throw new Error('Nie udało się przeanalizować stylu obrazu.');
    }
};

export const synthesizeStyle = async (ai: GoogleGenAI, descriptions: string[]): Promise<string> => {
    const synthesisPrompt = `Na podstawie poniższych opisów stylów różnych obrazów, stwórz jeden, spójny opis stylu, który oddaje wspólne elementy i artystyczną esencję. Ten opis zostanie użyty jako prompt stylu dla modelu generującego obrazy. Skup się na stworzeniu zunifikowanego przewodnika po stylu. Oto opisy:\n\n---\n${descriptions.join('\n---\n')}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: synthesisPrompt,
        });
        return response.text;
    } catch (error) {
        console.error('Error synthesizing style:', error);
        throw new Error('Nie udało się zsyntetyzować stylu.');
    }
};

export const generateStyledImage = async (ai: GoogleGenAI, prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts ?? []) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error('Nie znaleziono danych obrazu w odpowiedzi API.');
    } catch (error) {
        console.error('Error generating styled image:', error);
        throw new Error('Nie udało się wygenerować obrazu.');
    }
};