import React, { useEffect, useState } from 'react';
import { SearchResult, SearchImageResult } from '../types';
import { cleanDescription } from '../utils/serperAPI';

interface SearchResultsProps {
  results: SearchResult[];
  images: SearchImageResult[];
  onSelectResult: (description: string, imageUrl: string) => void;
  onNavigate: (direction: 'up' | 'down') => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  images, 
  onSelectResult,
  onNavigate 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const newIndex = selectedIndex > 0 ? selectedIndex - 1 : results.length - 1;
        setSelectedIndex(newIndex);
        onNavigate('up');
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        const newIndex = selectedIndex < results.length - 1 ? selectedIndex + 1 : 0;
        setSelectedIndex(newIndex);
        onNavigate('down');
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleSelectResult(selectedIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, results.length, onNavigate]);

  const handleSelectResult = (index: number) => {
    const result = results[index];
    const image = images[index];
    if (result) {
      const cleanedDescription = cleanDescription(result.title);
      const imageUrl = image?.imageUrl || '';
      console.log('Selected result:', cleanedDescription, 'Image URL:', imageUrl);
      onSelectResult(cleanedDescription, imageUrl);
    }
  };

  const handleMouseEnter = (index: number) => {
    setSelectedIndex(index);
  };

  if (results.length === 0) {
    return (
      <div className="text-center text-gray-500 p-8">
        No results found. Please enter description manually.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result, index) => {
        const imageUrl = images[index]?.imageUrl || '';
        
        return (
          <div
            key={index}
            className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedIndex === index 
                ? 'bg-blue-100 border-2 border-blue-500 shadow-md' 
                : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => handleSelectResult(index)}
            onMouseEnter={() => handleMouseEnter(index)}
          >
            <div className="flex-shrink-0 mr-4">
              {imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={result.title}
                    className="w-20 h-20 object-cover rounded-lg shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.log('Thumbnail image failed to load:', imageUrl);
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.placeholder')) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center placeholder';
                        placeholder.innerHTML = '📦';
                        parent.appendChild(placeholder);
                      }
                    }}
                    onLoad={() => {
                      console.log('Thumbnail image loaded successfully:', imageUrl);
                    }}
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  📦
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-1 ${
                selectedIndex === index ? 'text-blue-800' : 'text-gray-800'
              }`}>
                {result.title}
              </h3>
              {result.snippet && (
                <p className="text-sm text-gray-600 line-clamp-2">{result.snippet}</p>
              )}
              {imageUrl && (
                <p className="text-xs text-gray-400 mt-1">Image: {imageUrl.substring(0, 50)}...</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
