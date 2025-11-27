import React, { useState, useRef } from 'react';
import { editImageWithGemini } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { Spinner } from './Spinner';

export const ImageEditor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
      }
      try {
        setError(null);
        setResultImage(null); // Reset result on new upload
        const base64 = await fileToBase64(file);
        setSelectedImage(base64);
        setMimeType(file.type);
      } catch (err) {
        setError("Failed to process image.");
        console.error(err);
      }
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const generatedImage = await editImageWithGemini(selectedImage, mimeType, prompt);
      setResultImage(generatedImage);
    } catch (err: any) {
      setError(err.message || "Something went wrong while generating the image.");
    } finally {
      setLoading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-full flex flex-col">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-purple-500 text-3xl">✨</span> Magic Studio
          </h2>
          <p className="text-gray-500 text-sm mt-1">Powered by Gemini 2.5 Flash Image ("Nano Banana")</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 min-h-0">
          {/* Input Section */}
          <div className="flex flex-col gap-4 overflow-y-auto">
            
            {/* Upload Area */}
            <div 
              onClick={triggerFileUpload}
              className={`relative group cursor-pointer border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all h-64 md:h-80 ${
                selectedImage 
                  ? 'border-purple-200 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              
              {selectedImage ? (
                <div className="relative w-full h-full">
                  <img 
                    src={selectedImage} 
                    alt="Source" 
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <span className="text-white font-medium bg-black/50 px-3 py-1 rounded-full">Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white group-hover:text-purple-500 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-medium">Click to upload image</p>
                  <p className="text-xs mt-1">JPG, PNG, WebP supported</p>
                </div>
              )}
            </div>

            {/* Prompt Area */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What would you like to change?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Add a retro filter, remove the person in background, turn the cat into a tiger..."
                className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent min-h-[100px] text-sm resize-none"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !selectedImage || !prompt.trim()}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95"
                >
                  {loading ? <Spinner /> : <span className="text-lg">✨</span>}
                  {loading ? 'Processing...' : 'Generate Magic'}
                </button>
              </div>
              {error && (
                <div className="mt-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="flex flex-col h-full border rounded-xl bg-gray-50 overflow-hidden relative">
             <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b p-3 z-10">
               <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Result</span>
             </div>
             
             <div className="flex-1 flex items-center justify-center p-4">
                {loading ? (
                  <div className="text-center">
                    <div className="animate-pulse flex flex-col items-center">
                       <div className="h-48 w-48 bg-gray-200 rounded-lg mb-4"></div>
                       <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <p className="text-gray-400 text-sm mt-4">Consulting the AI...</p>
                  </div>
                ) : resultImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img 
                      src={resultImage} 
                      alt="Generated" 
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    />
                     <a 
                      href={resultImage} 
                      download="gemini-edit.png"
                      className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all"
                      title="Download"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-3 opacity-20" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p>Your edited image will appear here</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
