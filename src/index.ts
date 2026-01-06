import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { PdfGenerator, GeneratePdfOptions } from './services/pdfGenerator';

// Extend PdfGenerator interface for type checking
declare module './services/pdfGenerator' {
    interface PdfGenerator {
        generatePdfBuffer(htmlTemplate: string, options?: GeneratePdfOptions): Promise<Buffer>;
    }
}
import { swaggerSpec } from './config/swagger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'PDF Render API Documentation'
}));

// Serve swagger spec as JSON
app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Initialize PDF Generator
const pdfGenerator = new PdfGenerator();

/**
 * @swagger
 * /api/Utility/GeneratePdf:
 *   post:
 *     summary: Generate PDF from HTML (Legacy endpoint)
 *     description: Converts HTML template to PDF and returns Base64 string. This endpoint is designed for C# system compatibility.
 *     tags:
 *       - PDF Generation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - htmlTemplate
 *             properties:
 *               htmlTemplate:
 *                 type: string
 *                 description: The HTML content to convert to PDF
 *                 example: "<html><body><h1>Hello World</h1></body></html>"
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               description: Base64 encoded PDF content
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: PDF generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/api/Utility/GeneratePdf', async (req: Request, res: Response) => {
    try {
        const { htmlTemplate } = req.body;

        // Validate input
        if (!htmlTemplate || typeof htmlTemplate !== 'string') {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'htmlTemplate is required and must be a string'
            });
        }

        // Generate PDF
        const pdfBase64 = await pdfGenerator.generatePdf(htmlTemplate);

        // Return ONLY the Base64 string (no JSON wrapper) to avoid truncation issues
        // The C# code expects just the Base64 string
        res.setHeader('Content-Type', 'text/plain');
        return res.send(pdfBase64);
    } catch (error) {
        console.error('Error generating PDF:', error);
        return res.status(500).json({
            error: 'PDF generation failed',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

/**
 * @swagger
 * /api/pdf/generate:
 *   post:
 *     summary: Generate PDF from HTML (JSON endpoint)
 *     description: Converts HTML template to PDF and returns Base64 in JSON format with additional options.
 *     tags:
 *       - PDF Generation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GeneratePdfRequest'
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeneratePdfResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: PDF generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/api/pdf/generate', async (req: Request, res: Response) => {
    try {
        const { htmlTemplate, paperSize, margin, printBackground } = req.body;

        // Validate input
        if (!htmlTemplate || typeof htmlTemplate !== 'string') {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'htmlTemplate is required and must be a string'
            });
        }

        // Build options
        const options: GeneratePdfOptions = {
            paperSize: paperSize,
            margin: margin,
            printBackground: printBackground
        };

        // Generate PDF
        const pdfBase64 = await pdfGenerator.generatePdf(htmlTemplate, options);

        // Return as Base64 JSON
        return res.status(200).json({
            success: true,
            pdf: pdfBase64,
            message: 'PDF generated successfully'
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return res.status(500).json({
            error: 'PDF generation failed',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

/**
 * @swagger
 * /api/pdf/download:
 *   post:
 *     summary: Generate and download PDF from HTML
 *     description: Converts HTML template to PDF and returns it as a downloadable file.
 *     tags:
 *       - PDF Generation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - htmlTemplate
 *             properties:
 *               htmlTemplate:
 *                 type: string
 *                 description: The HTML content to convert to PDF
 *                 example: "<html><body><h1>Hello World</h1><p>This is a sample PDF document.</p></body></html>"
 *               fileName:
 *                 type: string
 *                 description: Custom filename for the downloaded PDF (without .pdf extension)
 *                 default: "document"
 *                 example: "my-report"
 *               paperSize:
 *                 type: string
 *                 enum: [A4, A3, Letter, Legal, Tabloid]
 *                 default: A4
 *                 description: Paper size for the PDF
 *               margin:
 *                 type: object
 *                 properties:
 *                   top:
 *                     type: string
 *                     default: "20px"
 *                   bottom:
 *                     type: string
 *                     default: "20px"
 *                   left:
 *                     type: string
 *                     default: "20px"
 *                   right:
 *                     type: string
 *                     default: "20px"
 *               printBackground:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to print background graphics
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: PDF generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/api/pdf/download', async (req: Request, res: Response) => {
    try {
        const { htmlTemplate, fileName, paperSize, margin, printBackground } = req.body;

        // Validate input
        if (!htmlTemplate || typeof htmlTemplate !== 'string') {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'htmlTemplate is required and must be a string'
            });
        }

        // Build options
        const options: GeneratePdfOptions = {
            paperSize: paperSize,
            margin: margin,
            printBackground: printBackground
        };

        // Generate PDF as Buffer
        const pdfBuffer = await pdfGenerator.generatePdfBuffer(htmlTemplate, options);

        // Set filename (sanitize and default)
        const sanitizedFileName = (fileName || 'document').replace(/[^a-zA-Z0-9-_]/g, '_');

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFileName}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send the PDF buffer
        return res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        return res.status(500).json({
            error: 'PDF generation failed',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API server
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Start server - bind to 0.0.0.0 for Render compatibility
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`PDF Render API is running on port ${PORT}`);
    console.log(`Swagger Documentation: /api-docs`);
    console.log(`POST /api/pdf/generate - Generate PDF from HTML template`);
    console.log(`POST /api/Utility/GeneratePdf - Generate PDF (Legacy endpoint)`);
});
