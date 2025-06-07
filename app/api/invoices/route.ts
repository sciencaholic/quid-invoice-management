import { NextRequest, NextResponse } from 'next/server';
import { InvoiceStorage } from '../../utils/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'uploadDate';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = InvoiceStorage.getPaginated({
      page,
      limit,
      sortBy,
      sortOrder,
      status,
      search
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}