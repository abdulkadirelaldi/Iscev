const mongoose = require('mongoose');

// Modeli önbellekten al; henüz derlenmemişse require et
const getCorporateModel = () =>
  mongoose.models.CorporateContent || require('../../models/CorporateContent.model');
const getTeamModel = () =>
  mongoose.models.TeamMember || require('../../models/TeamMember.model');

// ─── Seed Verisi ──────────────────────────────────────────────────────────────

const HERO_STATS = [
  { val: "1998", label: "Kuruluş Yılı" },
  { val: "18+",  label: "Ülke" },
  { val: "300+", label: "Tamamlanan Proje" },
  { val: "25+",  label: "Yıllık Deneyim" },
];

const VALUES = [
  { icon: "💡", title: "İnovasyon",         desc: "Membran biyoreaktör, ileri oksidasyon ve dijital izleme sistemleriyle sektörün teknoloji sınırlarını zorluyoruz." },
  { icon: "🌱", title: "Sürdürülebilirlik", desc: "Sıfır atık hedefiyle tasarlanan tesislerimiz, çevresel etkiyi minimize ederken enerji verimliliğini maksimize eder." },
  { icon: "🤝", title: "Müşteri Odaklılık", desc: "Proje tasarımından devreye almaya, devreye almadan 7/24 teknik desteğe uzanan bütünleşik hizmet anlayışı." },
  { icon: "🌐", title: "Küresel Güven",     desc: "ISO 9001, ISO 14001 ve TSE belgeli kalite sistemi ile 18 ülkedeki müşterilerimizin güvenini kazanıyoruz." },
];

const MILESTONES = [
  { icon: "🏛️", year: "1998", title: "Kuruluş",                     desc: "İSÇEV, İstanbul'da endüstriyel su arıtma teknolojilerine odaklanan bir mühendislik şirketi olarak kuruldu." },
  { icon: "🏭", year: "2003", title: "İlk Büyük Endüstriyel Proje", desc: "Türkiye'nin önde gelen tekstil fabrikalarından birine 5.000 m³/gün kapasiteli MBR arıtma tesisi kurulumu tamamlandı." },
  { icon: "🌍", year: "2009", title: "Uluslararası Açılım",          desc: "İlk uluslararası proje Körfez bölgesinde hayata geçirildi; Orta Doğu pazarına giriş sağlandı." },
  { icon: "🏅", year: "2014", title: "ISO Belgelendirmesi",          desc: "ISO 9001 ve ISO 14001 kalite sistemleri entegre edildi; TSE belgesi alındı." },
  { icon: "🔬", year: "2018", title: "Ar-Ge Merkezi",                desc: "Yerli membran teknolojisi geliştirme hedefiyle İSÇEV Ar-Ge Merkezi kuruldu; 15+ patent başvurusu yapıldı." },
  { icon: "🚀", year: "2024", title: "Küresel Büyüme",               desc: "18 ülke, 300+ proje ve 1.200 m³/saat kapasiteli Riyad Tesisi ile küresel su teknolojisi liderliği pekiştirildi." },
];

const REGIONS = [
  { flag: "🇹🇷", region: "Türkiye & Orta Doğu", countries: ["TR","SA","AE","QA","KW"], projects: 180 },
  { flag: "🌍",  region: "Kuzey Afrika",         countries: ["EG","MA","TN","LY"],      projects: 62  },
  { flag: "🌐",  region: "Orta Asya",            countries: ["KZ","UZ","AZ","TM"],      projects: 38  },
  { flag: "🇪🇺",  region: "Avrupa",               countries: ["DE","PL","RO","BG"],      projects: 24  },
];

const GLOBAL_STATS = [
  { val: "18+",  label: "Aktif Ülke" },
  { val: "300+", label: "Tamamlanan Proje" },
  { val: "2M+",  label: "m³/gün Arıtma Kapasitesi" },
  { val: "98%",  label: "Müşteri Memnuniyeti" },
];

const CERTS = [
  { code: "ISO 9001:2015",  label: "Kalite Yönetim Sistemi",      desc: "Ürün ve hizmet kalitemizin uluslararası standartlara uygunluğunu belgeleyen kalite yönetim sistemi sertifikamız.",                                 color: "#1B3F84" },
  { code: "ISO 14001:2015", label: "Çevre Yönetim Sistemi",       desc: "Çevresel etkilerimizi sistematik olarak yöneterek doğal kaynakların korunmasına katkıda bulunduğumuzu belgeleyen sertifikamız.",                   color: "#4988C5" },
  { code: "TSE",            label: "Türk Standartları Enstitüsü", desc: "Ürün ve hizmetlerimizin yerel standartlara tam uyumunu belgeleyen kalite işaretimiz.",                                                             color: "#2a6db5" },
  { code: "CE",             label: "Avrupa Uyumluluk Belgesi",    desc: "Ekipman ve sistemlerimizin Avrupa Birliği güvenlik, sağlık ve çevre direktiflerine uygunluğunu kanıtlayan belge.",                               color: "#1B3F84" },
];

const TEAM = [
  { name: "Mehmet Yıldız", title: "Kurucu & Genel Müdür",               bio: "25+ yıllık su arıtma sektörü deneyimiyle İSÇEV'i küresel bir teknoloji firmasına dönüştürdü.", linkedin: "#", order: 1 },
  { name: "Dr. Ayşe Koç",  title: "Ar-Ge ve İnovasyon Direktörü",       bio: "Membran teknolojileri ve ileri oksidasyon prosesleri alanında 12 patent sahibi. ODTÜ Çevre Mühendisliği doktoru.", linkedin: "#", order: 2 },
  { name: "Hasan Demir",   title: "Uluslararası Projeler Direktörü",    bio: "Körfez, Kuzey Afrika ve Orta Asya pazarlarında 80+ uluslararası proje yönetimi deneyimi.", linkedin: "#", order: 3 },
  { name: "Zeynep Arslan", title: "Kalite ve Sürdürülebilirlik Müdürü", bio: "ISO 9001/14001 sistem yöneticisi. Çevresel etki değerlendirmesi ve sürdürülebilirlik raporlaması uzmanı.", linkedin: "#", order: 4 },
];

// ─── Seed Fonksiyonu ──────────────────────────────────────────────────────────

const seedCorporateContent = async () => {
  try {
    const CorporateContent = getCorporateModel();
    const TeamMember       = getTeamModel();

    // 1. CorporateContent — singleton boşsa doldur
    const content = await CorporateContent.getInstance();
    if (content.heroStats.length === 0) {
      content.heroStats  = HERO_STATS;
      content.values     = VALUES;
      content.milestones = MILESTONES;
      content.regions    = REGIONS;
      content.globalStats= GLOBAL_STATS;
      content.certs      = CERTS;
      await content.save();
      console.log('✔  Seed: Kurumsal içerik oluşturuldu.');
    } else {
      console.log('ℹ  Seed: Kurumsal içerik zaten mevcut, atlanıyor.');
    }

    // 2. TeamMember — boşsa ekle
    const teamCount = await TeamMember.countDocuments();
    if (teamCount === 0) {
      await TeamMember.insertMany(TEAM);
      console.log(`✔  Seed: ${TEAM.length} ekip üyesi oluşturuldu.`);
    } else {
      console.log('ℹ  Seed: Ekip üyeleri zaten mevcut, atlanıyor.');
    }
  } catch (err) {
    console.error('✖  Seed (corporate) hatası:', err.message);
  }
};

module.exports = seedCorporateContent;
