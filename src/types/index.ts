export interface Product {
  id?: number;
  barcode: string;
  description: string;
  price: number;
  imageUrl?: string;
  createdAt: Date;
}

export interface SearchResult {
  title: string;
  link: string;
  snippet?: string;
}

export interface SearchImageResult {
  title: string;
  imageUrl: string;
}

export interface SerperResponse {
  organic: SearchResult[];
  images: SearchImageResult[];
}
