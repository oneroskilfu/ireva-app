import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';

const router = Router();

// Serve Swagger UI
router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #2E7D32; }
    .swagger-ui .scheme-container { background: #E8F5E8; }
    .swagger-ui .btn.authorize { background-color: #2E7D32; border-color: #2E7D32; }
    .swagger-ui .btn.authorize:hover { background-color: #1B5E20; }
  `,
  customSiteTitle: 'iREVA API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true
  }
}));

// Serve swagger spec as JSON
router.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

export default router;