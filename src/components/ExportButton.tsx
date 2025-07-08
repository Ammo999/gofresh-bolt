import React, { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { database } from '../utils/database';
import { Product } from '../types';

export const ExportButton: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      
      // Get all products from database
      const products = await database.getAllProducts();
      
      if (products.length === 0) {
        alert('No products to export');
        return;
      }

      // Prepare data for Excel
      const excelData = products.map((product: Product) => ({
        'ID': product.id,
        'Barcode': product.barcode,
        'Description': product.description,
        'Price': `$${product.price.toFixed(2)}`,
        'Image URL': product.imageUrl || '',
        'Created Date': new Date(product.createdAt).toLocaleDateString(),
        'Created Time': new Date(product.createdAt).toLocaleTimeString()
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 8 },   // ID
        { wch: 15 },  // Barcode
        { wch: 40 },  // Description
        { wch: 12 },  // Price
        { wch: 50 },  // Image URL
        { wch: 15 },  // Created Date
        { wch: 15 }   // Created Time
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS format
      const filename = `barcode-products-${dateStr}-${timeStr}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);
      
      // Show success message
      alert(`Successfully exported ${products.length} products to ${filename}`);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToExcel}
      disabled={isExporting}
      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-medium"
    >
      {isExporting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Exporting...
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export to Excel
        </>
      )}
    </button>
  );
};
