import { Invoice, PaginatedInvoices } from '../types/invoice';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// In-memory storage
const invoices = new Map<string, Invoice>();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const InvoiceStorage = {
  // Create a new invoice
  create: (data: Omit<Invoice, 'id'>): Invoice => {
    const invoice: Invoice = {
      id: uuidv4(),
      ...data,
    };
    invoices.set(invoice.id, invoice);
    return invoice;
  },

  // Get invoice by ID
  getById: (id: string): Invoice | undefined => {
    return invoices.get(id);
  },

  // Update invoice
  update: (id: string, updates: Partial<Invoice>): Invoice | undefined => {
    const invoice = invoices.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice = { ...invoice, ...updates };
    invoices.set(id, updatedInvoice);
    return updatedInvoice;
  },

  // Get paginated invoices with filtering and sorting
  getPaginated: (params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    search?: string;
  }): PaginatedInvoices => {
    const {
      page = 1,
      limit = 10,
      sortBy = 'uploadDate',
      sortOrder = 'desc',
      status,
      search
    } = params;

    let filtered = Array.from(invoices.values());

    // Filter by status
    if (status) {
      filtered = filtered.filter(invoice => invoice.status === status);
    }

    // Filter by search (fileName or clientName)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.fileName.toLowerCase().includes(searchLower) ||
        invoice.clientName.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = (a as any)[sortBy];
      let bValue = (b as any)[sortBy];

      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = filtered.slice(startIndex, endIndex);

    return {
      data,
      total: filtered.length,
      page,
      limit
    };
  },

  // Get all invoices (for internal use)
  getAll: (): Invoice[] => {
    return Array.from(invoices.values());
  }
};

// Generate mock data
const generateMockData = () => {
  const clientNames = ['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Blue Ocean Ltd', 'Metro Dynamics'];
  
  return {
    clientName: clientNames[Math.floor(Math.random() * clientNames.length)],
    amount: Math.floor(Math.random() * 10000) + 500 // $500 - $10,500
  };
};

export { generateMockData };

// Simulated processing function
export const simulateProcessing = (invoiceId: string) => {
  // Random processing time between 15-45 seconds
  const processingTime = Math.floor(Math.random() * 30000) + 15000;
  
  // Set status to Processing and start time
  InvoiceStorage.update(invoiceId, {
    status: 'Processing',
    processingStartTime: new Date()
  });

  setTimeout(() => {
    // 80% success rate
    const isSuccess = Math.random() < 0.8;
    
    InvoiceStorage.update(invoiceId, {
      status: isSuccess ? 'Processed' : 'Failed',
      processingEndTime: new Date()
    });
  }, processingTime);
};