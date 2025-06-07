'use client';

import { useState } from 'react';
import InvoiceUpload from './components/InvoiceUpload';
import InvoiceList from './components/InvoiceList';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger a refresh of the invoice list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Invoice Management System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload, track, and manage your PDF invoices with real-time processing updates
          </p>
        </header>

        <div className="space-y-8">
          <InvoiceUpload onUploadSuccess={handleUploadSuccess} />
          <InvoiceList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}