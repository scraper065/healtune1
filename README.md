# 🍎 GidaX v4.0 - AI Gıda Analiz

Türkiye pazarı için geliştirilmiş, Claude AI'ı kullanan akıllı gıda analiz uygulaması.

## ✨ Özellikler

- 📸 **Kamera/Galeri ile Ürün Tarama** - Ürün fotoğrafını çekerek anında analiz edin
- 🤖 **Claude Vision API** - Gelişmiş görsel tanıma teknolojisi
- 📊 **Detaylı Besin Analizi** - Şeker, yağ, tuz vb. tüm beslenler
- ☪️ **Helal Kontrolü** - E kodları ve malzeme kontrolleri
- ✊ **Boykot Markaları** - Boykot listesinde yer alan ürünleri işaretle
- 🌱 **Vegan/Vejetaryen** - Hayvan kökenli malzeme kontrolü
- 🇹🇷 **Yerli Ürünler** - Türk markalarını vurgula
- ❤️ **Sağlık Puanı** - 0-100 arasında dinamik sağlık skoru
- 👤 **Kişiselleştirilmiş Analiz** - Kullanıcı profili tabanlı önerileri
- 📱 **Responsive Design** - Mobil ve desktop uyumlu
- 💾 **LocalStorage** - Geçmiş ve favoriler otomatik kaydı

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+
- npm veya pnpm

### Kurulum

```bash
# Repo'yu klonla
git clone https://github.com/scraper065/healtune.git
cd healtune

# Bağımlılıkları yükle
npm install

# .env.local dosyası oluştur
cp .env.example .env.local
# VITE_CLAUDE_API_KEY'i düzenle

# Geliştirme sunucusunu başlat
npm run dev

# Production için build et
npm run build

# Build'i önizlemek için
npm run preview
```

## 🔑 Ortam Değişkenleri

`.env.local` dosyasında aşağıdaki değişkeni tanımla:

```
VITE_CLAUDE_API_KEY=your-anthropic-api-key
```

[Anthropic API anahtarını al](https://console.anthropic.com)

## 📁 Proje Yapısı

```
src/
├── App.jsx                    # Ana uygulama bileşeni
├── App.css                    # Stil dosyası
├── index.css                  # Global stiller
├── main.jsx                   # React entry point
├── components/
│   ├── ImageScanner.jsx       # Kamera/galeri bileşeni
│   ├── ResultView.jsx         # Sonuç gösterimi
│   └── ProfileModal.jsx       # Profil ayarları
├── data/
│   ├── products.js            # Örnek ürünler
│   ├── additives.js           # E kodu veritabanı
│   └── sensitivities.js       # Hassasiyet listeleri
└── utils/
    ├── analysis.js            # Sağlık skoru hesaplama
    └── storage.js             # LocalStorage yardımcıları
```

## 🎨 Tasarım

- **Tema**: Koyu Tema (Slate-900/950 bazlı)
- **İkonlar**: Lucide React
- **Stillendirme**: Tailwind CSS
- **Animasyonlar**: Custom CSS + Tailwind

## 🏆 Sağlık Skoru Hesaplaması

| Puan | Derece | Anlam |
|------|--------|-------|
| 80-100 | A | Çok Sağlıklı |
| 65-79 | B | Sağlıklı |
| 50-64 | C | Orta |
| 30-49 | D | Dikkatli Tüket |
| 0-29 | E | Kaçın |

### Skor Faktörleri

- **Şeker Seviyesi** (-15 yüksek, -8 orta)
- **Yağ Seviyesi** (-12 yüksek, -6 orta)
- **Doymuş Yağ** (-10 yüksek, -5 orta)
- **Tuz Seviyesi** (-8 yüksek, -4 orta)
- **Katkı Maddeleri** (-10 çok, -5 biraz)
- **NOVA Grubu** (-15 ultra işlenmiş, -8 işlenmiş)
- **Bonuslar**: +5 lif, +5 protein, +10 işlenmemiş

## 🔍 Helal Kontrolleri

### Haram E Kodları
- E120, E441, E542, E631, E635, E904, E920, E921

### Şüpheli E Kodları (Hayvan Kökenli Olabilir)
- E471-478, E481-483, E491-495

### Haram Malzemeler
- Domuz, alkol, şarap, bira, jelatin

## 🚫 Boykot Markaları

Coca-Cola, Pepsi, Nestlé, Starbucks, Unilever, Danone, Kraft, Mondelez ve daha fazlası...

## 🌱 Vegan Kontrolleri

Kontrol edilen hayvan kökenli malzemeler:

- Et, süt, yumurta, bal, jelatin, peynir, tereyağ, krema, laktoz, kazein

## 🇹🇷 Türk Markaları

Ülker, Eti, Torku, Tadım, Peyman, Pınar, Sütaş, Uludağ ve daha fazlası...

## 📱 Kullanım

1. **Ürün Tara**: Ana sayfa → Ürün Tara butonuna basın
2. **Fotoğraf Çek**: Kameradan çekin veya galeriden seçin
3. **Analiz Alın**: Claude AI ürünü otomatik analiz eder
4. **Sonuçları Görün**: Besin değerleri, sağlık puanı, uyarılar
5. **Favorilere Ekle**: Beğendiğiniz ürünleri kaydedin
6. **Profil Ayarla**: Sağlık durumu ve hassasiyetlerinizi tanımlayın

## 🧪 Teknoloji Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: Claude Vision API (Anthropic)
- **Storage**: Browser LocalStorage
- **Deployment**: Vercel

## 📊 API İntegrasyonu

Uygulama Claude Vision API'sı kullanarak:

- Ürün görselini analiz eder
- İçerik listesini tanır
- Besin değerlerini okur
- E kodlarını tespit eder
- Kişiselleştirilmiş uyarılar oluşturur

## 🛠️ Geliştirme

```bash
# Dev sunucusu
npm run dev

# Build
npm run build

# Önizleme
npm run preview
```

## 📝 Lisans

MIT License - Bkz. LICENSE

## 🤝 Katkılar

Katkılar memnuniyetle kabul edilir!

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📧 İletişim

Sorular veya öneriler için GitHub Issues açınız.

## ⚖️ Yasal Uyarı

GidaX tıbbi tavsiye sağlamaz. Analiz sonuçları bilgilendirme amaçlıdır. Önemli sağlık kararları için daima bir sağlık profesyoneline danışın.

---

**GidaX** - Türkiye'nin Gıda Analiz AI'sı 🍎
