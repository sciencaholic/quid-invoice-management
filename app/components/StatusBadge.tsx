'use client';

interface StatusBadgeProps {
  status: 'Pending' | 'Processing' | 'Processed' | 'Failed';
  showSpinner?: boolean;
}

export default function StatusBadge({ status, showSpinner = false }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-1 ring-yellow-200';
      case 'Processing':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-200';
      case 'Processed':
        return 'bg-green-50 text-green-700 border-green-200 ring-1 ring-green-200';
      case 'Failed':
        return 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 ring-1 ring-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'Pending':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Processing':
        return showSpinner ? (
          <div className="animate-spin h-3 w-3 border-2 border-blue-600 rounded-full border-t-transparent"></div>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'Processed':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'Failed':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyles()}`}>
      {getStatusIcon()}
      {status}
    </span>
  );
}