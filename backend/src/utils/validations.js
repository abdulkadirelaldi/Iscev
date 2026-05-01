const { z } = require('zod');

// Multer multipart formlarından gelen string sayıları coerce ile dönüştürür
const coerceFloat = z.coerce.number({ invalid_type_error: 'Sayısal değer olmalıdır.' });

// ─────────────────────────────────────────────
// Admin Girişi
// ─────────────────────────────────────────────
const adminLoginSchema = z.object({
  email: z
    .string({ required_error: 'Email zorunludur.' })
    .trim()
    .toLowerCase()
    .email({ message: 'Geçerli bir email adresi giriniz.' }),

  password: z
    .string({ required_error: 'Şifre zorunludur.' })
    .min(6, { message: 'Şifre en az 6 karakter olmalıdır.' }),
});

// ─────────────────────────────────────────────
// Ürün — Oluşturma (POST)
// ─────────────────────────────────────────────
// Kategori enum yerine ObjectId string olarak alınır.
// Gerçek kategori doğrulaması Category koleksiyonunda yapılır (controller seviyesi).
const productSchema = z.object({
  name: z
    .string({ required_error: 'Ürün adı zorunludur.' })
    .trim()
    .min(1, { message: 'Ürün adı boş olamaz.' })
    .max(200, { message: 'Ürün adı 200 karakteri geçemez.' }),

  description: z
    .string({ required_error: 'Kısa açıklama zorunludur.' })
    .trim()
    .min(1, { message: 'Kısa açıklama boş olamaz.' })
    .max(500, { message: 'Kısa açıklama 500 karakteri geçemez.' }),

  category: z
    .string({ required_error: 'Kategori zorunludur.' })
    .min(1, { message: 'Kategori seçilmelidir.' }),

  // Opsiyonel alanlar
  content: z.string().optional(),

  order: z.coerce
    .number({ invalid_type_error: 'Sıra sayısal olmalıdır.' })
    .int()
    .min(0)
    .optional(),
});

// Güncelleme için tüm alanlar opsiyonel (PATCH semantiği)
const productUpdateSchema = productSchema.partial();

// ─────────────────────────────────────────────
// Harita Lokasyonu — Oluşturma (POST)
// ─────────────────────────────────────────────
const mapLocationSchema = z.object({
  projectName: z
    .string({ required_error: 'Proje adı zorunludur.' })
    .trim()
    .min(1, { message: 'Proje adı boş olamaz.' })
    .max(200, { message: 'Proje adı 200 karakteri geçemez.' }),

  latitude: coerceFloat
    .min(-90, { message: 'Enlem -90 ile 90 arasında olmalıdır.' })
    .max(90, { message: 'Enlem -90 ile 90 arasında olmalıdır.' }),

  longitude: coerceFloat
    .min(-180, { message: 'Boylam -180 ile 180 arasında olmalıdır.' })
    .max(180, { message: 'Boylam -180 ile 180 arasında olmalıdır.' }),

  // Opsiyonel alanlar
  description: z.string().trim().max(1000).optional(),
  country: z.string().trim().max(100).optional(),
});

// Güncelleme için zorunlu koordinatlar da opsiyonel hale gelir
const mapLocationUpdateSchema = mapLocationSchema
  .partial()
  .refine(
    (data) => {
      // Koordinat veriliyorsa ikisi birden zorunlu
      const hasLat = data.latitude !== undefined;
      const hasLng = data.longitude !== undefined;
      return hasLat === hasLng;
    },
    { message: 'Koordinat güncellemesi için latitude ve longitude birlikte girilmelidir.' }
  );

module.exports = {
  adminLoginSchema,
  productSchema,
  productUpdateSchema,
  mapLocationSchema,
  mapLocationUpdateSchema,
};
