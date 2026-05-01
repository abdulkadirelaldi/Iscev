const express       = require('express');
const cors          = require('cors');
const path          = require('path');
const helmet        = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser  = require('cookie-parser');
const morgan        = require('morgan');
const swaggerUi     = require('swagger-ui-express');
const swaggerSpec   = require('./src/config/swagger');

const apiRoutes       = require('./src/routes/index');
const sitemapRoutes   = require('./src/routes/sitemap.routes');
const errorMiddleware = require('./src/middlewares/error.middleware');
const auditLog        = require('./src/middlewares/auditLog.middleware');

const app = express();

// ── HTTP Request Logger ────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Güvenlik başlıkları ────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'self'"],
        styleSrc:    ["'self'", "'unsafe-inline'"],
        imgSrc:      ["'self'", 'data:', 'blob:', ...allowedOrigins],
        connectSrc:  ["'self'", ...allowedOrigins],
        fontSrc:     ["'self'", 'data:'],
        objectSrc:   ["'none'"],
        frameSrc:    ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
  })
);

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: İzin verilmeyen origin: ${origin}`));
    },
    credentials: true,
  })
);

// ── Cookie Parser ──────────────────────────────────────────────────────────
app.use(cookieParser());

// ── Body parsers ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── NoSQL Injection koruması ───────────────────────────────────────────────
app.use(mongoSanitize());

// ── Statik medya ───────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Swagger UI (sadece non-production) ────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'İSÇEV API Docs',
  }));
}

// ── Dinamik Sitemap ────────────────────────────────────────────────────────
app.use('/', sitemapRoutes);

// ── Audit Log (mutasyon işlemleri için) ───────────────────────────────────
app.use('/api/v1', auditLog);

// ── API Rotaları ───────────────────────────────────────────────────────────
app.use('/api/v1', apiRoutes);

// ── 404 ────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error:   'NOT_FOUND',
    message: `'${req.originalUrl}' endpoint'i bulunamadı.`,
  });
});

// ── Global hata yakalayıcı ─────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
