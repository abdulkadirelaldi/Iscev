# İSÇEV Backend API

Express.js + MongoDB REST API — İSÇEV Arıtma ve Çevre Teknolojileri Kurumsal Web Platformu.

## Hızlı Başlangıç

### Gereksinimler

- Node.js 20 LTS
- MongoDB Atlas hesabı (veya yerel MongoDB)

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını kendi değerlerinizle doldurun

# Veritabanını seed'le (ilk kurulumda)
npm run seed

# Geliştirme modunda başlat
npm run dev

# Prodüksiyon modunda başlat
npm start
```

### PM2 ile Prodüksiyon

```bash
npm install -g pm2
pm run seed            # Bir kez seed
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Docker ile Çalıştırma

```bash
# Tek container
docker build -t iscev-api .
docker run -p 5001:5001 --env-file .env iscev-api

# docker-compose (frontend + backend birlikte)
cd ..
docker-compose up -d
```

## Ortam Değişkenleri

| Değişken | Açıklama | Zorunlu |
|---|---|---|
| `PORT` | Sunucu portu | Hayır (5001) |
| `NODE_ENV` | Ortam modu | Hayır (development) |
| `MONGO_URI` | MongoDB bağlantı URI | **Evet** |
| `JWT_SECRET` | JWT imzalama anahtarı (min 64 kar.) | **Evet** |
| `JWT_EXPIRES_IN` | Token geçerlilik süresi | Hayır (7d) |
| `CLIENT_ORIGIN` | CORS izin verilen origin(ler) | **Evet** |
| `SMTP_HOST` | E-posta sunucu adresi | Evet (mail için) |
| `SMTP_PORT` | E-posta port | Evet (mail için) |
| `SMTP_USER` | E-posta kullanıcı adı | Evet (mail için) |
| `SMTP_PASS` | E-posta şifresi / App Password | Evet (mail için) |
| `AUTO_SEED` | Başlangıçta seed çalıştır | Hayır (false) |

## API Endpoint'leri

Dokümantasyon: `http://localhost:5001/api/docs` (sadece development)

| Prefix | Açıklama |
|---|---|
| `GET /api/v1/health` | Sistem durumu kontrolü |
| `POST /api/v1/auth/login` | Admin girişi |
| `POST /api/v1/auth/logout` | Çıkış |
| `GET /api/v1/products` | Ürünler |
| `GET /api/v1/services` | Hizmetler |
| `GET /api/v1/blogs` | Blog yazıları |
| `GET /api/v1/catalogs` | Kataloglar |
| `GET /api/v1/references` | Referanslar |
| `GET /api/v1/map-locations` | Harita pinleri |
| `POST /api/v1/contact` | İletişim formu |
| `GET /api/v1/corporate` | Kurumsal içerik |
| `GET /api/v1/site-settings` | Site ayarları |
| `GET /api/v1/stats` | İstatistikler |

## Klasör Yapısı

```
backend/
├── app.js                  # Express uygulaması
├── server.js               # HTTP sunucusu başlatma
├── ecosystem.config.js     # PM2 yapılandırması
├── scripts/
│   └── seed.js             # Bağımsız seed scripti
├── models/                 # Mongoose şemaları
├── uploads/                # Yüklenen medya dosyaları
├── logs/                   # Uygulama logları
└── src/
    ├── config/             # DB, Multer, Swagger, Mailer
    ├── controllers/        # İş mantığı
    ├── middlewares/        # Auth, Error, AuditLog
    ├── models/             # Model re-export'ları
    ├── routes/             # Express router'lar
    ├── services/           # Veri erişim katmanı
    └── utils/              # Yardımcı fonksiyonlar
```

## Güvenlik Notları

- JWT **httpOnly cookie** ile taşınır — JS erişemez.
- Login brute-force koruması: 15 dk / 10 deneme.
- Dosya yüklemeleri MIME + extension çift doğrulaması ile korunur.
- Admin aksiyonları `logs/audit.log` dosyasına yazılır.
- Prodüksiyonda `JWT_SECRET` en az 64 karakter olmalıdır.
