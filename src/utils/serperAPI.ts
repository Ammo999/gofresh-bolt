import { SerperResponse, SearchResult, SearchImageResult } from '../types';

const SERPER_API_KEY = 'e2fc74c35ecf8f360c25442761ca58b6a0de8b2d';

export async function searchSerper(barcode: string): Promise<{ results: SearchResult[], images: SearchImageResult[] }> {
  const url = 'https://google.serper.dev/search';
  
  const requestOptions = {
    method: 'POST',
    headers: {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: barcode,
      num: 8,
      gl: 'us',
      hl: 'en',
      type: 'search'
    })
  };

  try {
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: any = await response.json();
    
    console.log('Full SerperAPI Response:', result);
    
    // Extract organic results
    const organicResults = result.organic || [];
    const results: SearchResult[] = organicResults.slice(0, 8).map((item: any) => ({
      title: item.title || '',
      link: item.link || '',
      snippet: item.snippet || ''
    }));
    
    // Try to get images from multiple possible locations in the response
    let imageResults: any[] = [];
    
    // Check if images are in the main images array
    if (result.images && Array.isArray(result.images)) {
      imageResults = result.images;
    }
    // Check if images are nested in organic results
    else if (organicResults.length > 0) {
      // Try to extract images from organic results if they contain image data
      imageResults = organicResults.map((item: any) => ({
        title: item.title,
        imageUrl: item.thumbnail || item.image || ''
      })).filter((item: any) => item.imageUrl);
    }
    
    // If still no images, make a separate image search
    if (imageResults.length === 0) {
      try {
        const imageSearchOptions = {
          method: 'POST',
          headers: {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: barcode,
            num: 8,
            gl: 'us',
            hl: 'en',
            type: 'images'
          })
        };
        
        const imageResponse = await fetch(url, imageSearchOptions);
        if (imageResponse.ok) {
          const imageResult = await imageResponse.json();
          console.log('Image search response:', imageResult);
          if (imageResult.images) {
            imageResults = imageResult.images;
          }
        }
      } catch (imageError) {
        console.warn('Image search failed:', imageError);
      }
    }
    
    const images: SearchImageResult[] = imageResults.slice(0, 8).map((item: any, index: number) => ({
      title: item.title || results[index]?.title || `Image ${index + 1}`,
      imageUrl: item.imageUrl || item.src || item.url || ''
    })).filter(img => img.imageUrl);
    
    console.log('Processed results:', results);
    console.log('Processed images:', images);
    
    // If we still don't have images, try to use placeholder images based on the search results
    if (images.length === 0 && results.length > 0) {
      console.log('No images found, using placeholder strategy');
      // Create placeholder images for each result
      const placeholderImages = results.map((result, index) => ({
        title: result.title,
        imageUrl: `https://via.placeholder.com/150x150/cccccc/666666?text=Product+${index + 1}`
      }));
      return { results, images: placeholderImages };
    }
    
    return { results, images };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch search results');
  }
}

export function cleanDescription(description: string): string {
  const dashIndex = description.indexOf('-');
  return dashIndex !== -1 ? description.substring(0, dashIndex).trim() : description;
}
