const mongoose = require('mongoose');

const getSiteSettingsModel = () =>
  mongoose.models.SiteSettings || require('../../models/SiteSettings.model');

// ─── Seed Verisi ──────────────────────────────────────────────────────────────

const CONTACT_INFO = {
  address:        'Organize Sanayi Bölgesi, 1. Cadde No:42, 41400 Gebze / Kocaeli, Türkiye',
  phone:          '+90 (262) 123 45 67',
  email:          'info@iscev.com.tr',
  whatsappNumber: '+902621234567',
  linkedinUrl:    'https://linkedin.com/company/iscev',
  instagramUrl:   'https://instagram.com/iscev',
  mapEmbedUrl:    '',
};

const CORPORATE_SECTION = {
  subtitle: 'Kurumsal Vizyonumuz',
  title:    'Su Kaynaklarını Geleceğe Taşıyan Teknoloji',
  bodyText: "1999'dan bu yana endüstriyel su arıtma ve çevre teknolojileri alanında Türkiye'nin öncü firmalarından biri olarak, 18'den fazla ülkede 50'yi aşkın tesis kurarak küresel bir güce dönüştük. İleri mühendislik çözümlerimizle su verimliliğini en üst düzeye taşıyoruz.",
  stats: [
    { value: '50+', label: 'Tamamlanan Proje' },
    { value: '18+', label: 'Ülkede Varlık'    },
    { value: '25+', label: 'Yıllık Deneyim'   },
    { value: '%99', label: 'Müşteri Memnuniyeti' },
  ],
};

// ─── Seed Fonksiyonu ──────────────────────────────────────────────────────────

const seedSiteSettings = async () => {
  try {
    const SiteSettings = getSiteSettingsModel();
    const settings = await SiteSettings.getInstance();

    if (settings.contactInfo?.email) {
      console.log('ℹ  Seed: SiteSettings zaten dolu, atlanıyor.');
      return;
    }

    settings.contactInfo      = CONTACT_INFO;
    settings.corporateSection = CORPORATE_SECTION;
    await settings.save();

    console.log('✔  Seed: SiteSettings iletişim ve kurumsal içerik oluşturuldu.');
  } catch (err) {
    console.error('✖  Seed (siteSettings) hatası:', err.message);
  }
};

module.exports = seedSiteSettings;
