const mongoose = require('mongoose');

// Modeli doğrudan require etmek yerine Mongoose'un derleme önbelleğinden alıyoruz.
// Bu yöntem, aynı modelin birden fazla dosyada require edilmesinden kaynaklanan
// OverwriteModelError hatasını engeller.
const getAdminModel = () => {
  // Model zaten derlendiyse onu kullan; değilse root models dosyasını yükle
  return mongoose.models.Admin || require('../../models/admin.model');
};

const SEED_EMAIL    = 'admin@iscev.com';
const SEED_NAME     = 'İSÇEV Admin';
const SEED_PASSWORD = 'Admin1234!';

/**
 * Veritabanında kurucu admin yoksa oluşturur.
 * Şifre, Admin modelindeki pre-save hook aracılığıyla bcrypt(12) ile hashlenir.
 * Üretim ortamında çalıştırıldığında varolan kaydın üzerine yazmaz.
 */
const seedAdmin = async () => {
  try {
    const Admin    = getAdminModel();
    const existing = await Admin.findOne({ email: SEED_EMAIL });

    if (existing) {
      console.log('ℹ  Seed: Kurucu admin zaten mevcut, atlanıyor.');
      return;
    }

    await Admin.create({
      name:     SEED_NAME,
      email:    SEED_EMAIL,
      password: SEED_PASSWORD, // pre-save hook otomatik hashler
    });

    console.log(`✔  Seed: Kurucu admin oluşturuldu → ${SEED_EMAIL}`);
  } catch (err) {
    // Seed hatası sunucuyu çökertmemeli; sadece loglanır.
    console.error('✖  Seed hatası:', err.message);
  }
};

module.exports = seedAdmin;
