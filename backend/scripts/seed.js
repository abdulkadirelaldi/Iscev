/**
 * Bağımsız seed scripti — sadece elle çalıştırılır.
 * Kullanım: node scripts/seed.js
 *
 * Server.js artık seed çağrısı yapmaz.
 * Bu script CI ortamında veya ilk kurulumda bir kez çalıştırılır.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const connectDB            = require('../src/config/db');
const seedAdmin            = require('../src/utils/seedAdmin');
const seedSiteSettings     = require('../src/utils/seedSiteSettings');
const seedCorporateContent = require('../src/utils/seedCorporateContent');

(async () => {
  try {
    await connectDB();
    console.log('✔ Veritabanına bağlanıldı.');

    await seedAdmin();
    await seedSiteSettings();
    await seedCorporateContent();

    console.log('✔ Seed işlemleri tamamlandı.');
    process.exit(0);
  } catch (err) {
    console.error('✖ Seed hatası:', err.message);
    process.exit(1);
  }
})();
