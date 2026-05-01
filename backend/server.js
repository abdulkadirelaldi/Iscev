require('dotenv').config();
const app       = require('./app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  // Seed'ler artık ayrı script ile çalıştırılır: node scripts/seed.js
  // Development ortamında kolaylık için AUTO_SEED=true ile etkinleştirilebilir.
  if (process.env.AUTO_SEED === 'true') {
    const seedAdmin            = require('./src/utils/seedAdmin');
    const seedSiteSettings     = require('./src/utils/seedSiteSettings');
    const seedCorporateContent = require('./src/utils/seedCorporateContent');
    await seedAdmin();
    await seedSiteSettings();
    await seedCorporateContent();
  }

  const server = app.listen(PORT, () => {
    console.log(`✔ Sunucu çalışıyor: http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  // Büyük dosya yüklemeleri (PDF 50 MB vb.) için timeout
  server.timeout         = 10 * 60 * 1000;
  server.keepAliveTimeout = 65 * 1000; // Nginx/LB'den yüksek olmalı
};

start();
