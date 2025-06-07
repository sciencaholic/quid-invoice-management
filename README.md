# Quid Invoice Management System

A full-stack Next.js application for managing PDF invoice uploads with real-time processing status updates. Built with TypeScript, React, and Tailwind CSS.

## Features

- **Multi-file PDF Upload** - Drag-and-drop interface with file validation
- **Real-time Processing Updates** - Live status updates with polling mechanism
- **Comprehensive Invoice Management** - Pagination, sorting, filtering, and search
- **Simulated Processing** - 15-45 second processing simulation with 80% success rate
- **Responsive Design** - Clean, modern UI that works on all devices
- **Type Safety** - Full TypeScript implementation throughout
- **In-memory Storage** - Simple data persistence for development/demo purposes

## Tech Stack

- **Frontend & Backend**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **File Storage**: Local filesystem
- **Database**: In-memory storage (Map-based)
- **Icons**: Heroicons (SVG)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd invoice-management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Required Directories
```bash
mkdir uploads
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000)

You should see the Invoice Management System running!

## API Documentation

| Endpoint | Method | Description | Parameters | Response |
|----------|--------|-------------|------------|----------|
| `/api/invoices` | GET | Get paginated list of invoices with filtering and sorting | `page` (number), `limit` (number), `sortBy` (string), `sortOrder` (asc/desc), `status` (string), `search` (string) | `{ data: Invoice[], total: number, page: number, limit: number }` |
| `/api/invoices/upload` | POST | Upload multiple PDF files | Form data with `files` field | `{ success: boolean, invoiceIds: string[], message: string }` |
| `/api/invoices/:id` | GET | Get single invoice by ID | `id` in URL path | `Invoice` object with full details |

### Query Parameters for GET /api/invoices

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Number of items per page |
| `sortBy` | string | uploadDate | Sort field: uploadDate, amount, clientName, fileName |
| `sortOrder` | string | desc | Sort direction: asc or desc |
| `status` | string | - | Filter by status: Pending, Processing, Processed, Failed |
| `search` | string | - | Search in fileName or clientName |

### Invoice Object Structure

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `fileName` | string | Original uploaded file name |
| `fileSize` | number | File size in bytes |
| `clientName` | string | Mock client name |
| `amount` | number | Mock invoice amount |
| `uploadDate` | Date | Timestamp of upload |
| `status` | string | Current status: Pending, Processing, Processed, Failed |
| `filePath` | string | Stored file path |
| `processingStartTime` | Date | When processing started (optional) |
| `processingEndTime` | Date | When processing finished (optional) |