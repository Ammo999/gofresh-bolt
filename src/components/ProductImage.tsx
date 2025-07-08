import React from 'react';
import { Package } from 'lucide-react';

interface ProductImageProps {
  imageUrl: string;
  alt: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ imageUrl, alt }) => {
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    setImageError(false);
    setIsLoading(true);
  }, [imageUrl]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
    console.log('Image failed to load:', imageUrl);
  };

  if (!imageUrl || imageError) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
        <Package className="w-16 h-16 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">No image available</p>
        {imageUrl && imageError && (
          <p className="text-xs text-red-500 mt-1 px-2 text-center">Failed to load image</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
};
