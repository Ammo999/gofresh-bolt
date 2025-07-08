import React from 'react';
import { Product } from '../types';
import { Clock, Package } from 'lucide-react';

interface RecentEntriesProps {
  products: Product[];
}

export const RecentEntries: React.FC<RecentEntriesProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Clock className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Recent Entries</h3>
        </div>
        <p className="text-gray-500 text-center">No recent entries</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Clock className="w-5 h-5 text-gray-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Recent Entries</h3>
      </div>
      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 mr-3">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.description}
                  className="w-12 h-12 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <Package className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{product.description}</p>
              <p className="text-sm text-gray-600">Barcode: {product.barcode}</p>
              <p className="text-sm font-semibold text-green-600">${product.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
