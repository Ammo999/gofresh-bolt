import React, { useState, useEffect, useRef } from 'react';
import { Scan, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { database } from './utils/database';
import { searchSerper } from './utils/serperAPI';
import { SearchResults } from './components/SearchResults';
import { ProductImage } from './components/ProductImage';
import { RecentEntries } from './components/RecentEntries';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ExportButton } from './components/ExportButton';
import { Product, SearchResult, SearchImageResult } from './types';

function App() {
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchImages, setSearchImages] = useState<SearchImageResult[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDuplicateWarning, setIsDuplicateWarning] = useState(false);

  const barcodeRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        await database.init();
        await loadRecentProducts();
      } catch (err) {
        console.error('Database initialization error:', err);
      }
    };
    initDB();
  }, []);

  const loadRecentProducts = async () => {
    try {
      const products = await database.getLastProducts(3);
      setRecentProducts(products);
    } catch (err) {
      console.error('Error loading recent products:', err);
    }
  };

  const clearForm = () => {
    setBarcode('');
    setDescription('');
    setPrice('');
    setCurrentImageUrl('');
    setSearchResults([]);
    setSearchImages([]);
    setError('');
    setSuccess('');
    setIsDuplicateWarning(false);
    barcodeRef.current?.focus();
  };

  const handleBarcodeChange = async (value: string) => {
    setBarcode(value);
    setError('');
    setSuccess('');
    setIsDuplicateWarning(false);
    
    if (value.length >= 8) {
      try {
        // Check for duplicate first
        const existingProduct = await database.getProductByBarcode(value);
        if (existingProduct) {
          setIsDuplicateWarning(true);
          setError('Barcode already exists in database!');
          setTimeout(() => {
            setBarcode('');
            setError('');
            setIsDuplicateWarning(false);
            barcodeRef.current?.focus();
          }, 2000);
          return;
        }

        // Search for the barcode
        setIsLoading(true);
        const { results, images } = await searchSerper(value);
        setSearchResults(results);
        setSearchImages(images);
        
        if (results.length === 0) {
          descriptionRef.current?.focus();
        }
      } catch (err) {
        setError('Failed to search for barcode');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectResult = (selectedDescription: string, imageUrl: string) => {
    console.log('App received selected result:', selectedDescription, 'Image URL:', imageUrl);
    setDescription(selectedDescription);
    setCurrentImageUrl(imageUrl);
    setSearchResults([]);
    setSearchImages([]);
    priceRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barcode || !description || !price) {
      setError('Please fill in all fields');
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError('Please enter a valid price');
      return;
    }

    try {
      const product = {
        barcode,
        description,
        price: numericPrice,
        imageUrl: currentImageUrl,
        createdAt: new Date()
      };

      await database.addProduct(product);
      setSuccess('Product saved successfully!');
      await loadRecentProducts();
      
      setTimeout(() => {
        clearForm();
      }, 1000);
    } catch (err) {
      if (err instanceof Error && err.message.includes('constraint')) {
        setError('Barcode already exists in database!');
      } else {
        setError('Failed to save product');
      }
      console.error('Save error:', err);
    }
  };

  const handleNextBarcode = () => {
    clearForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Scan className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Barcode Scanner</h1>
          </div>
          <p className="text-gray-600 text-lg">Scan, Search, and Save Product Information</p>
          <div className="mt-4">
            <ExportButton />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-2">
                    Barcode
                  </label>
                  <input
                    ref={barcodeRef}
                    type="text"
                    id="barcode"
                    value={barcode}
                    onChange={(e) => handleBarcodeChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="Enter or scan barcode"
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    ref={descriptionRef}
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="Product description"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 text-lg">$</span>
                    <input
                      ref={priceRef}
                      type="number"
                      id="price"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
                  >
                    Save Product
                  </button>
                  <button
                    type="button"
                    onClick={handleNextBarcode}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
                  >
                    Next Barcode
                  </button>
                </div>
              </form>

              {error && (
                <div className={`mt-4 p-4 rounded-lg flex items-center ${
                  isDuplicateWarning ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <AlertCircle className={`w-5 h-5 mr-2 ${
                    isDuplicateWarning ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                  <span className={isDuplicateWarning ? 'text-yellow-800' : 'text-red-800'}>{error}</span>
                </div>
              )}

              {success && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800">{success}</span>
                </div>
              )}
            </div>

            {/* Search Results */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Search Results</h3>
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <LoadingSpinner />
                ) : searchResults.length > 0 ? (
                  <SearchResults
                    results={searchResults}
                    images={searchImages}
                    onSelectResult={handleSelectResult}
                    onNavigate={() => {}}
                  />
                ) : (
                  <div className="text-center text-gray-500 p-8">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>Enter a barcode to search for products</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Product Image and Recent Entries */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Product Image</h3>
              <ProductImage imageUrl={currentImageUrl} alt={description} />
            </div>

            <RecentEntries products={recentProducts} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
