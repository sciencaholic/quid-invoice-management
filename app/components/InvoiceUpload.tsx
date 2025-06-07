'use client';

import { useState, useCallback, useEffect } from 'react';
import { Invoice } from '../types/invoice';
import StatusBadge from './StatusBadge';

interface InvoiceUploadProps {
  onUploadSuccess: () => void;
}

export default function InvoiceUpload({ onUploadSuccess }: InvoiceUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedInvoices, setUploadedInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string>('');

  // Poll for status updates
  useEffect(() => {
    if (uploadedInvoices.length === 0) return;

    const interval = setInterval(async () => {
      const pendingOrProcessing = uploadedInvoices.filter(
        inv => inv.status === 'Pending' || inv.status === 'Processing'
      );

      if (pendingOrProcessing.length === 0) {
        clearInterval(interval);
        return;
      }

      // Fetch updated statuses
      const updates = await Promise.all(
        pendingOrProcessing.map(async (invoice) => {
          try {
            const response = await fetch(`/api/invoices/${invoice.id}`);
            if (response.ok) {
              return await response.json();
            }
          } catch (error) {
            console.error('Error fetching invoice status:', error);
          }
          return invoice;
        })
      );

      setUploadedInvoices(prev => {
        const updated = [...prev];
        updates.forEach(updatedInvoice => {
          const index = updated.findIndex(inv => inv.id === updatedInvoice.id);
          if (index !== -1) {
            updated[index] = updatedInvoice;
          }
        });
        return updated;
      });
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [uploadedInvoices]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    setSelectedFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      file => file.type === 'application/pdf'
    );
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/invoices/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Fetch the uploaded invoices
        const invoices = await Promise.all(
          result.invoiceIds.map(async (id: string) => {
            const invResponse = await fetch(`/api/invoices/${id}`);
            return invResponse.json();
          })
        );

        setUploadedInvoices(invoices);
        setSelectedFiles([]);
        onUploadSuccess();
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (error) {
      setError('Failed to upload files');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Upload Invoices
      </h2>
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-gray-600">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-xl font-medium mb-3 text-gray-700">Drag and drop PDF files here</p>
          <p className="text-gray-500 mb-4">or</p>
          <label className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg">
            Choose Files
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          <p className="text-sm text-gray-500 mt-4">Only PDF files are accepted</p>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Selected Files ({selectedFiles.length})
          </h3>
          <div className="space-y-3 max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-4">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex justify-between items-center text-sm bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <span className="truncate font-medium text-gray-900">{file.name}</span>
                <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium shadow-md hover:shadow-lg flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload {selectedFiles.length} File(s)
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Upload Progress */}
      {uploadedInvoices.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Upload Progress
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-4">
            {uploadedInvoices.map((invoice) => (
              <div key={invoice.id} className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{invoice.fileName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {invoice.clientName} • <span className="font-medium">${invoice.amount.toLocaleString()}</span>
                  </p>
                </div>
                <div className="ml-4">
                  <StatusBadge 
                    status={invoice.status} 
                    showSpinner={invoice.status === 'Processing'} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}