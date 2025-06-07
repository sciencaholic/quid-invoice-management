import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { InvoiceStorage, generateMockData, simulateProcessing } from '../../../utils/storage';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No files provided' },
        { status: 400 }
      );
    }

    const invoiceIds: string[] = [];

    for (const file of files) {
      // Validate file type (only PDFs)
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        continue; // Skip non-PDF files
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const fileExtension = path.extname(file.name);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(process.cwd(), 'uploads', uniqueFilename);

      // Save file to local storage
      await writeFile(filePath, buffer);

      // Generate mock data
      const mockData = generateMockData();

      // Create invoice entry
      const invoice = InvoiceStorage.create({
        fileName: file.name,
        fileSize: file.size,
        clientName: mockData.clientName,
        amount: mockData.amount,
        uploadDate: new Date(),
        status: 'Pending',
        filePath: uniqueFilename, // Store relative path
      });

      invoiceIds.push(invoice.id);

      // Start simulated processing
      simulateProcessing(invoice.id);
    }

    return NextResponse.json({
      success: true,
      invoiceIds,
      message: `Successfully uploaded ${invoiceIds.length} invoice(s)`
    });

  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload files' },
      { status: 500 }
    );
  }
}