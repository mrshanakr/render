# PDF Render API

A Node.js TypeScript API for generating PDFs from HTML templates using Puppeteer (free, open-source browser automation library).

## Features

- **HTML to PDF Conversion**: Convert HTML templates to PDF documents
- **Base64 Output**: Returns PDF as Base64 encoded string for easy transmission
- **Customizable Options**: Support for paper size, margins, and print background
- **Error Handling**: Comprehensive error handling and validation
- **Express API**: RESTful API built with Express.js

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

The server will run on `http://localhost:3000` by default.

## API Endpoints

### Generate PDF

**POST** `/api/pdf/generate`

**Request Body:**
```json
{
  "htmlTemplate": "<html><body><h1>Hello World</h1></body></html>",
  "paperSize": "A4",
  "printBackground": true,
  "margin": {
    "top": "20px",
    "bottom": "20px",
    "left": "20px",
    "right": "20px"
  }
}
```

**Response:**
```json
{
  "success": true,
  "pdf": "JVBERi0xLjQKJeLj...",
  "message": "PDF generated successfully"
}
```

### Health Check

**GET** `/health`

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Example Usage with cURL

```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{
    "htmlTemplate": "<html><body><h1>Hello PDF</h1></body></html>"
  }'
```

## Library Used

- **Puppeteer**: Free, open-source browser automation library that provides high-level API to control Chrome/Chromium over the DevTools Protocol
- **Express.js**: Fast and minimalist web application framework for Node.js

## Project Structure

```
.
├── src/
│   ├── index.ts              # Main application entry point
│   └── services/
│       └── pdfGenerator.ts    # PDF generation service
├── dist/                      # Compiled JavaScript (generated)
├── package.json               # Project dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## License

MIT
