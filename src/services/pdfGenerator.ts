import puppeteer, { Browser, PaperFormat } from 'puppeteer';

export interface PdfMargin {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
}

export interface GeneratePdfOptions {
    paperSize?: PaperFormat;
    margin?: PdfMargin;
    printBackground?: boolean;
}

export class PdfGenerator {
    private browser: Browser | null = null;

    /**
     * Initialize the Puppeteer browser
     */
    private async initializeBrowser(): Promise<void> {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
    }

    /**
     * Generate PDF from HTML template and return as Buffer
     * @param htmlTemplate - The HTML content to convert to PDF
     * @param options - Optional PDF generation options
     * @returns PDF as Buffer
     */
    async generatePdfBuffer(htmlTemplate: string, options?: GeneratePdfOptions): Promise<Buffer> {
        try {
            // Step 1: Validate the input & Check if the HTML template is empty
            if (!htmlTemplate || typeof htmlTemplate !== 'string') {
                throw new Error('HTML Template Not Found or Invalid!');
            }

            // Step 2: Initialize the PDF renderer
            await this.initializeBrowser();
            if (!this.browser) {
                throw new Error('Failed to initialize browser');
            }

            const page = await this.browser.newPage();

            // Step 3: Set PDF options
            const pdfOptions = {
                format: options?.paperSize || 'A4' as PaperFormat,
                margin: options?.margin || {
                    top: '20px',
                    bottom: '20px',
                    left: '20px',
                    right: '20px'
                },
                printBackground: options?.printBackground !== false
            };

            // Step 4: Set the HTML content and render to PDF
            await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf(pdfOptions);

            // Close the page
            await page.close();

            return Buffer.from(pdfBuffer);
        } catch (error) {
            console.error(`Error occurred during PDF generation from HTML template: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Generate PDF from HTML template and return as Base64 string
     * @param htmlTemplate - The HTML content to convert to PDF
     * @param options - Optional PDF generation options
     * @returns Base64 encoded PDF string
     */
    async generatePdf(htmlTemplate: string, options?: GeneratePdfOptions): Promise<string> {
        const pdfBuffer = await this.generatePdfBuffer(htmlTemplate, options);
        return pdfBuffer.toString('base64');
    }

    /**
     * Close the browser and release resources
     */
    async closeBrowser(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}
