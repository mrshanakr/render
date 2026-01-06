import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PDF Render API',
            version: '1.0.0',
            description: 'A Node.js API for generating PDFs from HTML templates using Puppeteer',
            contact: {
                name: 'API Support'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            }
        ],
        components: {
            schemas: {
                GeneratePdfRequest: {
                    type: 'object',
                    required: ['htmlTemplate'],
                    properties: {
                        htmlTemplate: {
                            type: 'string',
                            description: 'The HTML content to convert to PDF',
                            example: '<html><body><h1>Hello World</h1><p>This is a PDF document.</p></body></html>'
                        },
                        paperSize: {
                            type: 'string',
                            enum: ['A4', 'A3', 'Letter', 'Legal', 'Tabloid'],
                            default: 'A4',
                            description: 'Paper size for the PDF'
                        },
                        margin: {
                            type: 'object',
                            properties: {
                                top: {
                                    type: 'string',
                                    default: '20px',
                                    description: 'Top margin'
                                },
                                bottom: {
                                    type: 'string',
                                    default: '20px',
                                    description: 'Bottom margin'
                                },
                                left: {
                                    type: 'string',
                                    default: '20px',
                                    description: 'Left margin'
                                },
                                right: {
                                    type: 'string',
                                    default: '20px',
                                    description: 'Right margin'
                                }
                            }
                        },
                        printBackground: {
                            type: 'boolean',
                            default: true,
                            description: 'Whether to print background graphics'
                        }
                    }
                },
                GeneratePdfResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            description: 'Indicates if the operation was successful'
                        },
                        pdf: {
                            type: 'string',
                            description: 'Base64 encoded PDF content'
                        },
                        message: {
                            type: 'string',
                            description: 'Response message'
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error type'
                        },
                        message: {
                            type: 'string',
                            description: 'Error message'
                        }
                    }
                },
                HealthResponse: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'OK'
                        },
                        message: {
                            type: 'string',
                            example: 'Server is running'
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/index.ts', './src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
