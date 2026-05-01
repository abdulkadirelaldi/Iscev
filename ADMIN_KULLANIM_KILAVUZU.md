# İSÇEV Admin OS
## Yönetim Paneli Kullanım Kılavuzu

**Versiyon:** 1.0  
**Güncelleme:** Nisan 2026  
**Hedef Kitle:** Site Yöneticisi

---

## GİRİŞ

Bu kılavuz, İSÇEV kurumsal web sitesinin yönetim panelini (Admin OS) kullanmak için hazırlanmıştır. Kılavuzu okuyarak sitenizin tüm içeriklerini bağımsız biçimde yönetebilirsiniz.

---

## BÖLÜM 1: SİSTEME GİRİŞ

### 1.1 Admin Paneline Erişim

Yönetim paneline erişmek için tarayıcınıza şu adresi yazın:

```
https://siteniz.com/admin/giris
```

### 1.2 Giriş Bilgileri

| Alan | Değer |
|------|-------|
| E-posta | admin@iscev.com |
| Şifre | *(kurulum sırasında belirlenen şifre)* |

> **Güvenlik Notu:** İlk girişin ardından şifrenizi **Profilim** sayfasından değiştirmeniz şiddetle tavsiye edilir.

### 1.3 Panelden Çıkış

Sol menünün alt kısmındaki kırmızı **"Çıkış Yap"** butonuna tıklayın. Tarayıcı oturumunuz güvenli biçimde sonlandırılır.

> **Önemli:** Ortak bilgisayar kullanıyorsanız her oturumun ardından mutlaka çıkış yapın.

---

## BÖLÜM 2: GENEL PANEL YAPISI

### 2.1 Ekran Düzeni

```
┌─────────────────────────────────────────────────────────┐
│  SOL MENÜ (Sidebar)    │    ANA İÇERİK ALANI             │
│                        │                                 │
│  ┌──────────────────┐  │  ┌───────────────────────────┐  │
│  │  İSÇEV  Admin OS │  │  │  Sayfa Başlığı            │  │
│  ├──────────────────┤  │  │  Açıklama                 │  │
│  │  Dashboard       │  │  ├───────────────────────────┤  │
│  ├──────────────────┤  │  │                           │  │
│  │  İÇERİK          │  │  │  İçerik / Form / Tablo    │  │
│  │  • Ürünler       │  │  │                           │  │
│  │  • Kategoriler   │  │  │                           │  │
│  │  • Hizmetler     │  │  │                           │  │
│  │  • Referanslar   │  │  │                           │  │
│  │  • Kurumsal      │  │  │                           │  │
│  │  • Blog          │  │  └───────────────────────────┘  │
│  ├──────────────────┤  │                                 │
│  │  MEDYA           │  │                                 │
│  │  • Kataloglar    │  │                                 │
│  │  • Harita        │  │                                 │
│  ├──────────────────┤  │                                 │
│  │  İLETİŞİM        │  │                                 │
│  │  • Gelen Kutusu  │  │                                 │
│  ├──────────────────┤  │                                 │
│  │  SİSTEM          │  │                                 │
│  │  • Profilim      │  │                                 │
│  │  • Site Ayarları │  │                                 │
│  ├──────────────────┤  │                                 │
│  │  [Kullanıcı Adı] │  │                                 │
│  │  [Çıkış Yap]     │  │                                 │
│  └──────────────────┘  │                                 │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Bildirim Rozeti

Sol menüde **Gelen Kutusu** yanında kırmızı bir numara görürseniz, okunmamış iletişim mesajı bulunmaktadır.

---

## BÖLÜM 3: DASHBOARD (ANA PANEL)

Dashboard, sitenizin genel durumunu tek bakışta gösterir.

### 3.1 İstatistik Kartları

| Kart | Gösterdiği |
|------|------------|
| Ürünler | Toplam ürün sayısı |
| Hizmetler | Toplam hizmet sayısı |
| Kataloglar | Toplam katalog sayısı |
| Blog Yazıları | Yayında olan yazı sayısı |
| Referanslar | Toplam referans sayısı |
| İletişim Mesajları | Toplam mesaj sayısı |
| Harita Konumları | Toplam proje pin sayısı |

---

## BÖLÜM 4: ÜRÜN YÖNETİMİ

**Menü:** Sol menü → İçerik → Ürünler  
**URL:** `/admin/urunler`

### 4.1 Yeni Ürün Ekleme

1. Sayfanın sağ üstündeki **"+ Yeni Ürün"** butonuna tıklayın
2. Açılan formda şu alanları doldurun:

| Alan | Açıklama | Zorunlu |
|------|---------|---------|
| Ürün Adı | Ürünün tam adı | ✅ |
| Kategori | Açılır listeden seçin | ✅ |
| Kısa Açıklama | Liste sayfasında görünen özet (maks. 300 karakter) | ✅ |
| Detaylı Açıklama | Ürün detay sayfasında görünen metin | ✅ |
| Kapak Görseli | JPG, PNG veya WEBP — maks. 5 MB | ✅ |
| Özellikler | Teknik özellik listesi (isteğe bağlı) | ❌ |

3. **"Kaydet"** butonuna tıklayın

> **İpucu:** Kapak görseli ürün kartında ve detay sayfasında gösterilir. En uygun boyut: **800×600 piksel**, oran 4:3.

### 4.2 Ürün Düzenleme

1. Ürün listesinde düzenlemek istediğiniz ürünün satırına tıklayın
2. Açılan formda değişikliklerinizi yapın
3. **"Güncelle"** butonuna tıklayın

### 4.3 Ürün Silme

1. Ürün satırının sağındaki **çöp kutusu** ikonuna tıklayın
2. Onay dialogunu **"Evet, Sil"** ile onaylayın

> ⚠️ **Dikkat:** Silinen ürün geri getirilemiez. Görseli de birlikte silinir.

### 4.4 Kategori Gerekliliği

Ürün eklemeden önce kategori oluşturulmuş olmalıdır.  
Kategori eklemek için: **Sol menü → Kategoriler**

---

## BÖLÜM 5: HİZMET YÖNETİMİ

**Menü:** Sol menü → İçerik → Hizmetler  
**URL:** `/admin/hizmetler`

Hizmet yönetimi Ürün yönetimi ile aynı mantıkla çalışır.

| Alan | Açıklama | Zorunlu |
|------|---------|---------|
| Hizmet Adı | Hizmetin tam adı | ✅ |
| Kategori | Hizmet kategorisi | ✅ |
| Kısa Açıklama | Özet metin | ✅ |
| Detaylı Açıklama | Tam açıklama | ✅ |
| Kapak Görseli | JPG/PNG/WEBP, maks. 5 MB | ✅ |

---

## BÖLÜM 6: KATEGORİ YÖNETİMİ

**Menü:** Sol menü → İçerik → Kategoriler  
**URL:** `/admin/kategoriler`

Kategoriler hem ürünler hem de hizmetler için ortak kullanılır.

### 6.1 Kategori Ekleme

1. **"+ Yeni Kategori"** butonuna tıklayın
2. Kategori adını yazın
3. **"Ekle"** butonuna tıklayın

### 6.2 Kategori Silme

> ⚠️ **Dikkat:** Bir kategoriyi silmeden önce o kategoriye atanmış ürün ve hizmetlerin kategorisini değiştirin. Aksi hâlde söz konusu içerikler kategorisiz kalır.

---

## BÖLÜM 7: KATALOG YÖNETİMİ

**Menü:** Sol menü → Medya → Kataloglar  
**URL:** `/admin/kataloglar`

### 7.1 Yeni Katalog Yükleme

| Alan | Açıklama | Zorunlu |
|------|---------|---------|
| Katalog Adı | Katalog başlığı | ✅ |
| PDF Dosyası | Yalnızca PDF, maks. 50 MB | ✅ |
| Dil | Türkçe veya İngilizce | ✅ |
| Kapak Görseli | Katalog önizleme görseli (isteğe bağlı) | ❌ |

### 7.2 İndirme Sayacı

Her katalog kartında kaç kez indirildiği görüntülenir. Bu değer otomatik olarak güncellenir; site ziyaretçileri indirme butonuna her tıkladığında sayaç artar.

---

## BÖLÜM 8: BLOG YÖNETİMİ

**Menü:** Sol menü → İçerik → Blog  
**URL:** `/admin/blog`

### 8.1 Yeni Blog Yazısı Oluşturma

| Alan | Açıklama | Zorunlu |
|------|---------|---------|
| Başlık | Yazı başlığı | ✅ |
| İçerik | Yazının tam metni | ✅ |
| Yazar | Yazar adı soyadı | ✅ |
| Kapak Görseli | JPG/PNG/WEBP, maks. 5 MB | ✅ |
| Durum | **Taslak** veya **Yayında** | ✅ |
| Etiketler | Virgülle ayrılmış etiketler | ❌ |

### 8.2 Yayın Durumu

- **Taslak:** Yazı sitede görünmez, sadece admin panelinde saklanır
- **Yayında:** Yazı herkese açık blog listesinde görünür

> **İpucu:** Bir yazıyı önce "Taslak" olarak kaydedin, tamamladıktan sonra "Yayında" olarak güncelleyin.

---

## BÖLÜM 9: REFERANS YÖNETİMİ

**Menü:** Sol menü → İçerik → Referanslar  
**URL:** `/admin/referanslar`

### 9.1 Referans Ekleme

| Alan | Açıklama | Zorunlu |
|------|---------|---------|
| Firma/Proje Adı | Referans adı | ✅ |
| Sektör | Faaliyet sektörü | ❌ |
| Ülke | Projenin ülkesi | ❌ |
| Logo | Firma logosu (JPG/PNG/WEBP, maks. 5 MB) | ❌ |
| Açıklama | Kısa proje tanıtımı | ❌ |

---

## BÖLÜM 10: KURUMSAL SAYFA YÖNETİMİ

**Menü:** Sol menü → İçerik → Kurumsal Sayfa  
**URL:** `/admin/kurumsal`

Kurumsal sayfanın tüm bölümleri 6 sekme altında yönetilir:

### 10.1 Temel Değerler Sekmesi

Şirketin 4 temel değerini düzenleyin.

| Alan | Açıklama |
|------|---------|
| İkon | Emoji veya sembol (örn: 💡, 🌱) |
| Başlık | Değerin adı (örn: İnovasyon) |
| Açıklama | Kısa açıklama metni |

### 10.2 Yolculuğumuz Sekmesi (Milestones)

Şirket tarihindeki önemli dönüm noktaları.

| Alan | Açıklama |
|------|---------|
| Yıl | Dört haneli yıl (örn: 2009) |
| Başlık | Olayın adı |
| Açıklama | Kısa anlatım |

### 10.3 Liderlik Kadrosu Sekmesi

Ekip üyelerini yönetin.

| Alan | Açıklama |
|------|---------|
| Ad Soyad | Kişinin tam adı |
| Unvan | Şirketteki pozisyon |
| Biyografi | Kısa tanıtım metni |
| LinkedIn URL | LinkedIn profil bağlantısı |
| Fotoğraf | Profil fotoğrafı (JPG/PNG, maks. 5 MB) |
| Sıra | Listede gösterim sırası |

### 10.4 Küresel Güç Sekmesi (Bölgeler)

Coğrafi bölge ve proje sayılarını düzenleyin.

| Alan | Açıklama |
|------|---------|
| Bayrak | Bölge bayrağı emojisi |
| Bölge Adı | Coğrafi bölge (örn: Kuzey Afrika) |
| Ülke Kodları | ISO ülke kodları, virgülle ayrılmış (örn: TR,SA,AE) |
| Proje Sayısı | Rakamsal değer |

### 10.5 İstatistikler Sekmesi

Kurumsal sayfa için küresel istatistikler.

| Alan | Açıklama |
|------|---------|
| Değer | Gösterilecek rakam (örn: 300+, 98%) |
| Etiket | Değerin açıklaması (örn: Tamamlanan Proje) |

### 10.6 Sertifikalar Sekmesi

Şirket sertifikasyonlarını yönetin.

| Alan | Açıklama |
|------|---------|
| Kod | Sertifika kodu (örn: ISO 9001:2015) |
| Ad | Sertifikanın tam adı |
| Açıklama | Sertifikayı anlatan metin |
| Renk | Kart arka plan rengi (HEX, örn: #1B3F84) |

---

## BÖLÜM 11: HARİTA YÖNETİMİ

**Menü:** Sol menü → Medya → Harita  
**URL:** `/admin/harita`

Dünya haritasındaki proje pin'lerini yönetin.

### 11.1 Konum Ekleme

| Alan | Açıklama | Zorunlu |
|------|---------|---------|
| Proje Adı | Lokasyonun adı | ✅ |
| Enlem (Latitude) | Ondalıklı koordinat (örn: 41.0082) | ✅ |
| Boylam (Longitude) | Ondalıklı koordinat (örn: 28.9784) | ✅ |
| Ülke | Projenin ülkesi | ❌ |
| Açıklama | Kısa proje bilgisi | ❌ |

> **Koordinat bulmak için:** Google Maps'te konuma sağ tıklayın → "Bu yeri paylaş" → koordinatlar clipboard'a kopyalanır.

### 11.2 Konum Silme

Her pin'in yanındaki çöp kutusu ikonuna tıklayarak kaldırabilirsiniz.

---

## BÖLÜM 12: GELEN KUTUSU

**Menü:** Sol menü → İletişim → Gelen Kutusu  
**URL:** `/admin/mesajlar`

Site ziyaretçilerinin İletişim sayfasından gönderdiği mesajlar burada görünür.

### 12.1 Mesaj Okuma

- **Kalın** yazılı mesajlar okunmamış
- Mesaja tıklayınca detay görüntülenir ve otomatik olarak okundu işaretlenir
- Sol menüdeki kırmızı rozet, okunmamış mesaj sayısını gösterir

### 12.2 E-posta ile Cevaplama

1. Mesajı açın
2. Alttaki **"E-posta ile Cevapla"** butonuna tıklayın
3. Cevap metninizi yazın
4. **"Gönder"** butonuna tıklayın

> **Not:** E-posta gönderimi için Site Ayarları'nda SMTP yapılandırması yapılmış olmalıdır.

### 12.3 Mesaj Silme

Mesaj detayındaki çöp kutusu ikonuna tıklayın.

---

## BÖLÜM 13: SİTE AYARLARI

**Menü:** Sol menü → Sistem → Site Ayarları  
**URL:** `/admin/ayarlar`

Üç sekme altında yönetilir:

### 13.1 İletişim Bilgileri Sekmesi

Sitenin footer ve iletişim sayfasında görünecek bilgiler:

| Alan | Örnek |
|------|-------|
| Şirket Adresi | Organize Sanayi Bölgesi, Gebze / Kocaeli |
| Telefon | +90 (262) 123 45 67 |
| E-posta | info@iscev.com.tr |
| WhatsApp Numarası | +905xxxxxxxxx |
| LinkedIn URL | https://linkedin.com/company/iscev |
| Instagram URL | https://instagram.com/iscev |

Değişiklikleri yazdıktan sonra **"Değişiklikleri Kaydet"** butonuna tıklayın.

### 13.2 Medya Ayarları Sekmesi (Carousel)

Ana sayfadaki dönen slaytları yönetin.

**Yeni Slayt Ekleme:**
1. "Görsel seç veya sürükleyin" alanına görsel yükleyin (JPG/PNG/WEBP, maks. 5 MB)
2. Başlık ve alt başlık yazın
3. **"Değişiklikleri Kaydet"** butonuna tıklayın

**Slayt Düzenleme:**
- Slayt kartındaki **"Düzenle"** butonuna tıklayın
- Başlık ve alt başlığı güncelleyin
- **"Kaydet"** butonuna tıklayın

**Slayt Silme:**
- Slayt görseli üzerine gelin
- Beliren çöp kutusu ikonuna tıklayın

> **İpucu:** En iyi görünüm için carousel görseli boyutu: **1920×800 piksel**, yatay format.

### 13.3 Kurumsal İçerik Sekmesi

Ana sayfanın "Kurumsal Vizyon" bölümündeki metni düzenleyin.

| Alan | Açıklama |
|------|---------|
| Üst Etiket | Başlığın üstündeki küçük yazı (örn: Kurumsal Vizyonumuz) |
| Ana Başlık | Bölüm başlığı |
| Paragraf Metni | Şirket tanıtım paragrafı |
| İstatistikler | 4 adet: değer + etiket (örn: 50+ / Tamamlanan Proje) |

---

## BÖLÜM 14: PROFİLİM

**Menü:** Sol menü → Sistem → Profilim  
**URL:** `/admin/profil`

### 14.1 Ad Soyad Değiştirme

1. "Ad Soyad" alanını güncelleyin
2. **"Güncelle"** butonuna tıklayın

### 14.2 Şifre Değiştirme

1. Mevcut şifrenizi girin
2. Yeni şifrenizi girin (en az 8 karakter)
3. Yeni şifreyi tekrar girin (doğrulama)
4. **"Şifreyi Değiştir"** butonuna tıklayın

> **Güvenlik:** Şifrenizde büyük harf, küçük harf ve rakam bulunmasını öneririz.

---

## BÖLÜM 15: DOSYA YÜKLEME KURALLARI

### 15.1 Kabul Edilen Formatlar

| Dosya Tipi | Format | Maks. Boyut | Kullanım |
|------------|--------|-------------|---------|
| Görsel | JPG, PNG, WEBP | 5 MB | Ürün, hizmet, blog, referans görseli |
| PDF | PDF | 50 MB | Katalog |
| Video | MP4 | 100 MB | Tanıtım videosu |

### 15.2 Görsel Boyut Önerileri

| Kullanım | Önerilen Boyut | Oran |
|---------|----------------|------|
| Carousel / Slayt | 1920 × 800 px | 2.4:1 |
| Ürün Kapak | 800 × 600 px | 4:3 |
| Hizmet Kapak | 800 × 600 px | 4:3 |
| Blog Kapak | 1200 × 630 px | 1.9:1 |
| Ekip Fotoğrafı | 400 × 400 px | 1:1 |
| Referans Logo | 400 × 200 px | 2:1 |

### 15.3 Görsel Optimizasyon

Dosyaları yüklemeden önce sıkıştırmanız sayfa yüklenme hızını artırır.  
Ücretsiz araçlar: [squoosh.app](https://squoosh.app) veya [tinypng.com](https://tinypng.com)

---

## BÖLÜM 16: SIK SORULAN SORULAR

**S: Şifremi unuttum, nasıl sıfırlarım?**  
C: Şu an için şifre sıfırlama e-posta sistemi bulunmamaktadır. Yazılım ekibinizle iletişime geçin.

**S: Sildiğim bir içeriği geri getirebilir miyim?**  
C: Hayır. Silme işlemleri kalıcıdır. Silmeden önce mutlaka emin olun.

**S: Birden fazla yönetici hesabı açabilir miyim?**  
C: Şu an sistem tek yönetici desteklemektedir. Ek hesap için yazılım ekibinizle iletişime geçin.

**S: Yüklediğim görsel neden görünmüyor?**  
C: Tarayıcı cache'ini temizleyin (Ctrl+Shift+R). Sorun devam ederse yazılım ekibinizi bilgilendirin.

**S: Site ayarlarındaki değişiklikler ne zaman yansır?**  
C: Kaydet butonuna basıldıktan sonra anında yansır.

**S: Carousel görseli yükledim ama ana sayfada görünmüyor?**  
C: Sayfayı yenileyin. Slaytın "Aktif" durumda olduğunu kontrol edin.

**S: Blog yazısı neden sitede görünmüyor?**  
C: Yazının durumunu kontrol edin. "Taslak" durumundaki yazılar sitede görünmez, "Yayında" olarak güncellemeniz gerekir.

---

## BÖLÜM 17: İPUÇLARI VE EN İYİ UYGULAMALAR

### İçerik Kalitesi

- Ürün ve hizmet açıklamalarında anahtar kelimeler kullanın (SEO)
- Kapak görselleri için önerilen boyutlara uyun (daha iyi görünüm)
- Blog yazılarını yayınlamadan önce taslak olarak kaydedin
- Ekip üyelerinin LinkedIn profillerini ekleyin (güvenilirlik artırır)

### Güvenlik

- Şifrenizi kimseyle paylaşmayın
- Ortak bilgisayarda oturum açtıysanız çıkış yapmayı unutmayın
- Şifrenizi 3-6 ayda bir değiştirin
- Tanımadığınız cihazlardan giriş yapmayın

### Performans

- Görsel dosyalarını yüklemeden önce sıkıştırın
- PDF katalogları mümkün olduğunca optimize edilmiş boyutta tutun (10 MB altı ideal)
- Kullanılmayan içerikleri düzenli olarak silin veya devre dışı bırakın

---

## BÖLÜM 18: TEKNİK DESTEK

Site ile ilgili sorun yaşadığınızda aşağıdaki bilgileri hazırlayarak yazılım ekibinizle iletişime geçin:

1. **Sorunun açıklaması:** Ne yapmaya çalışıyordunuz?
2. **Hata mesajı:** Ekranda görünen hata mesajı (ekran görüntüsü alın)
3. **Tarayıcı:** Chrome, Firefox, Safari?
4. **Cihaz:** Bilgisayar, tablet, telefon?
5. **Tarih/Saat:** Sorunun yaşandığı zaman

---

*Bu kılavuz İSÇEV Arıtma ve Çevre Teknolojileri için hazırlanmıştır.*  
*Yetkisiz kişilerle paylaşılmaması tavsiye edilir.*
