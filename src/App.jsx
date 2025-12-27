import React, { useState, useEffect, useRef } from 'react';
import { Camera, Search, Heart, Clock, User, Star, Zap, Leaf, Shield, TrendingUp, Plus, Minus, ChevronRight, X, Check, AlertTriangle, Info, Share2, Video, VideoOff } from 'lucide-react';
import './App.css';

// Data imports
import { fetchProductByBarcode } from './api/openFoodFacts';
import { turkishProductsDB, turkishBrandsList, boycottBrandsList, isTurkishBrand, isBoycottBrand, findLocalProduct } from './data/turkishProducts';
import { eCodeDatabase, checkECode, hasHaramOrSuspicious } from './data/eCodes';

// Utility functions
const calculateHealthScore = (nutrition) => {
  let score = 70;
  const n = nutrition;
  
  // Deductions
  if (n.sugar?.value > 22.5) score -= 15;
  else if (n.sugar?.value > 12.5) score -= 8;
  
  if (n.fat?.value > 30) score -= 12;
  else if (n.fat?.value > 17.5) score -= 6;
  
  if (n.saturated_fat?.value > 10) score -= 10;
  else if (n.saturated_fat?.value > 5) score -= 5;
  
  if (n.salt?.value > 2.5) score -= 8;
  else if (n.salt?.value > 1.5) score -= 4;
  
  // Bonuses
  if (n.fiber?.value > 6) score += 5;
  if (n.protein?.value > 10) score += 5;
  
  return Math.max(5, Math.min(100, score));
};

const getGradeInfo = (score) => {
  if (score >= 80) return { grade: 'A', label: 'Çok Sağlıklı', color: '#10B981', bg: 'from-emerald-500/20 to-emerald-600/10' };
  if (score >= 65) return { grade: 'B', label: 'Sağlıklı', color: '#22C55E', bg: 'from-green-500/20 to-green-600/10' };
  if (score >= 50) return { grade: 'C', label: 'Orta', color: '#F59E0B', bg: 'from-amber-500/20 to-amber-600/10' };
  if (score >= 30) return { grade: 'D', label: 'Dikkatli Tüket', color: '#F97316', bg: 'from-orange-500/20 to-orange-600/10' };
  return { grade: 'E', label: 'Kaçın', color: '#EF4444', bg: 'from-red-500/20 to-red-600/10' };
};

const getNutrientLevel = (type, value) => {
  const thresholds = {
    sugar: { low: 5, high: 22.5 },
    fat: { low: 3, high: 20 },
    saturated_fat: { low: 1.5, high: 5 },
    salt: { low: 0.3, high: 1.5 }
  };
  const t = thresholds[type];
  if (!t) return { level: 'medium', color: '#F59E0B' };
  if (value <= t.low) return { level: 'low', label: 'Düşük', color: '#10B981' };
  if (value >= t.high) return { level: 'high', label: 'Yüksek', color: '#EF4444' };
  return { level: 'medium', label: 'Orta', color: '#F59E0B' };
};

// Category icons
const getCategoryIcon = (category) => {
  const icons = {
    'Atıştırmalık': '🍪',
    'İçecek': '🥤',
    'Süt Ürünü': '🧀',
    'Tahıl': '🌾',
    'Et Ürünü': '🥩',
    'Konserve': '🥫',
    'Dondurulmuş': '🧊',
    'Meyve': '🍎',
    'Sebze': '🥬',
    'Ekmek': '🍞',
    'Makarna': '🍝',
    'Şekerleme': '🍬',
    'Çikolata': '🍫',
    'Bisküvi': '🍪',
    'Cips': '🥔',
    'Yoğurt': '🥛',
    'Peynir': '🧀',
    'Süt': '🥛',
    'Kahvaltılık': '🥣',
    'Sos': '🫙',
    'Baharat': '🌶️',
    'Yağ': '🫒',
  };
  return icons[category] || '🍽️';
};

// Quick test products with full mock data
const quickTestProducts = [
  { 
    name: 'Çikolatalı Gofret', brand: 'Ülker', grade: 'E', color: '#EF4444', icon: '🍫',
    category: 'Atıştırmalık', healthScore: 25, novaGroup: 4,
    nutrition: { energy: { value: 520 }, protein: { value: 6 }, carbohydrates: { value: 58 }, sugar: { value: 32 }, fat: { value: 28 }, saturated_fat: { value: 14 }, fiber: { value: 2 }, salt: { value: 0.3 } },
    ingredients: { raw_text: 'Şeker, bitkisel yağ, buğday unu, kakao, lesitin (E322)', additives_list: ['E322'] },
    isBoycott: false, isTurkish: true, isHalal: true
  },
  { 
    name: 'Sade Yoğurt', brand: 'Sütaş', grade: 'A', color: '#10B981', icon: '🥛',
    category: 'Süt Ürünü', healthScore: 88, novaGroup: 1,
    nutrition: { energy: { value: 63 }, protein: { value: 5 }, carbohydrates: { value: 4 }, sugar: { value: 4 }, fat: { value: 3.5 }, saturated_fat: { value: 2 }, fiber: { value: 0 }, salt: { value: 0.1 } },
    ingredients: { raw_text: 'Pastörize inek sütü, yoğurt kültürü', additives_list: [] },
    isBoycott: false, isTurkish: true, isHalal: true
  },
  { 
    name: 'Coca-Cola', brand: 'Coca-Cola', grade: 'E', color: '#EF4444', icon: '🥤',
    category: 'İçecek', healthScore: 15, novaGroup: 4,
    nutrition: { energy: { value: 42 }, protein: { value: 0 }, carbohydrates: { value: 10.6 }, sugar: { value: 10.6 }, fat: { value: 0 }, saturated_fat: { value: 0 }, fiber: { value: 0 }, salt: { value: 0 } },
    ingredients: { raw_text: 'Karbonatlı su, şeker, renklendirici (E150d), fosforik asit, doğal aromalar, kafein', additives_list: ['E150d'] },
    isBoycott: true, isTurkish: false, isHalal: true
  },
  { 
    name: 'Beyaz Peynir', brand: 'Pınar', grade: 'C', color: '#F59E0B', icon: '🧀',
    category: 'Süt Ürünü', healthScore: 55, novaGroup: 2,
    nutrition: { energy: { value: 250 }, protein: { value: 17 }, carbohydrates: { value: 1 }, sugar: { value: 0.5 }, fat: { value: 20 }, saturated_fat: { value: 12 }, fiber: { value: 0 }, salt: { value: 2.5 } },
    ingredients: { raw_text: 'Pastörize inek sütü, tuz, peynir mayası, kalsiyum klorür', additives_list: [] },
    isBoycott: false, isTurkish: true, isHalal: true
  },
  { 
    name: 'Tam Buğday Ekmek', brand: 'Uno', grade: 'B', color: '#22C55E', icon: '🍞',
    category: 'Fırın Ürünü', healthScore: 72, novaGroup: 3,
    nutrition: { energy: { value: 230 }, protein: { value: 9 }, carbohydrates: { value: 42 }, sugar: { value: 3 }, fat: { value: 2.5 }, saturated_fat: { value: 0.5 }, fiber: { value: 7 }, salt: { value: 1.1 } },
    ingredients: { raw_text: 'Tam buğday unu, su, maya, tuz, buğday glüteni', additives_list: [] },
    isBoycott: false, isTurkish: true, isHalal: true
  },
  { 
    name: 'Domates Salçası', brand: 'Tat', grade: 'A', color: '#10B981', icon: '🍅',
    category: 'Sos', healthScore: 85, novaGroup: 2,
    nutrition: { energy: { value: 100 }, protein: { value: 4.5 }, carbohydrates: { value: 18 }, sugar: { value: 12 }, fat: { value: 0.5 }, saturated_fat: { value: 0.1 }, fiber: { value: 4 }, salt: { value: 1.5 } },
    ingredients: { raw_text: 'Domates (%99), tuz', additives_list: [] },
    isBoycott: false, isTurkish: true, isHalal: true
  },
];

function App() {
  const [currentTab, setCurrentTab] = useState('scan');
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [portion, setPortion] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanStatus, setScanStatus] = useState('idle');
  const [toast, setToast] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [infoModal, setInfoModal] = useState(null); // {type: 'nutriscore'|'nova'|'halal'|...}
  const [userProfile, setUserProfile] = useState({
    diseases: [],
    sensitivities: [],
    diet: [],
    goals: []
  });

  // Info modal içerikleri
  const infoContents = {
    nutriscore: {
      icon: '🔤',
      title: 'Nutri-Score Nedir?',
      content: `Nutri-Score, gıda ürünlerinin besin kalitesini A'dan E'ye harf notlarıyla gösteren bir sistemdir.

🟢 A - Çok iyi besin kalitesi
🟢 B - İyi besin kalitesi  
🟡 C - Orta besin kalitesi
🟠 D - Düşük besin kalitesi
🔴 E - Kötü besin kalitesi

Hesaplamada şeker, doymuş yağ, tuz ve kalori negatif; lif, protein, meyve/sebze oranı pozitif etki eder.`
    },
    nova: {
      icon: '🏭',
      title: 'NOVA Grubu Nedir?',
      content: `NOVA, gıdaların işlenme derecesini 1-4 arası sınıflandırır.

🟢 NOVA 1 - İşlenmemiş veya minimal işlenmiş
Taze meyve, sebze, et, yumurta, süt

🟢 NOVA 2 - İşlenmiş mutfak malzemeleri
Yağlar, tereyağı, şeker, tuz, un

🟡 NOVA 3 - İşlenmiş gıdalar
Konserve, peynir, ekmek, tuzlu kuruyemiş

🔴 NOVA 4 - Ultra işlenmiş gıdalar
Hazır yemek, cipis, gazlı içecek, şekerleme

Ultra işlenmiş gıdalar obezite, diyabet ve kalp hastalığı riskini artırabilir.`
    },
    halal: {
      icon: '☪️',
      title: 'Helal Kontrol',
      content: `Helal kontrolü, ürünlerdeki katkı maddelerinin İslami kurallara uygunluğunu inceler.

🔴 Haram E-kodları:
E120 (Karmin) - Böcekten elde edilir
E441 (Jelatin) - Domuz kaynaklı olabilir
E904 (Shellac) - Böcek salgısı

🟡 Şüpheli E-kodları:
E471, E472-477 - Hayvansal/bitkisel belirsiz
E481-483, E491-495 - Kaynak belirsiz

🟢 Helal E-kodları:
E100-E180 (Renklendiriciler)
E200-E297 (Koruyucular)
E300-E341 (Antioksidanlar)

Not: Kesin helal sertifikası için üreticiye danışın.`
    },
    boycott: {
      icon: '✊',
      title: 'Boykot Listesi',
      content: `Boykot listesi, tüketicilerin etik veya politik sebeplerle satın almamayı tercih ettiği markaları içerir.

Bu liste kullanıcıların kendi tercihlerine yardımcı olmak için sunulmaktadır.

Listede 70+ uluslararası marka bulunmaktadır.

Karar tamamen size aittir.`
    },
    turkish: {
      icon: '🇹🇷',
      title: 'Yerli Üretim',
      content: `Yerli üretim kontrolü, ürünün Türk markası olup olmadığını tespit eder.

🇹🇷 Yerli markaları desteklemek:
• Yerel ekonomiyi güçlendirir
• İstihdam sağlar
• Döviz çıkışını azaltır

Veritabanımızda 50+ Türk markası kayıtlıdır:
Ülker, Eti, Torku, Pınar, Sütaş, Tat, Uno, Tamek, Dimes, Uludağ ve daha fazlası.`
    },
    healthscore: {
      icon: '💯',
      title: 'Sağlık Skoru',
      content: `Sağlık Skoru (0-100), ürünün genel beslenme kalitesini gösterir.

📊 Hesaplama kriterleri:

Puan düşüren faktörler:
• Yüksek şeker (-15 puan)
• Yüksek yağ (-12 puan)
• Yüksek doymuş yağ (-10 puan)
• Yüksek tuz (-8 puan)
• Çok katkı maddesi (-10 puan)
• Ultra işlenmiş (NOVA 4) (-15 puan)

Puan artıran faktörler:
• Yüksek lif (+5 puan)
• Yüksek protein (+5 puan)
• Organik (+5 puan)
• İşlenmemiş (NOVA 1) (+10 puan)

80+ Çok Sağlıklı | 65+ Sağlıklı | 50+ Orta | 30+ Dikkat | 30- Kaçın`
    },
    vegan: {
      icon: '🌱',
      title: 'Vegan Kontrolü',
      content: `Vegan kontrolü, üründe hayvansal içerik olup olmadığını tespit eder.

❌ Vegan olmayan içerikler:
• Et, tavuk, balık, deniz ürünleri
• Süt, peynir, yoğurt, tereyağı
• Yumurta, bal
• Jelatin (E441)
• Karmin (E120)

✅ Vegan alternatifler:
• Bitkisel süt (badem, soya, yulaf)
• Tofu, tempeh
• Baklagiller
• Kuruyemişler`
    },
    ecode_result: {
      icon: '🔬',
      title: 'E-Kod Sonucu',
      content: '' // Dynamic content
    }
  };

  // E-kod sonucu için dinamik içerik
  const getEcodeModalContent = () => {
    if (!barcodeInput) return null;
    const result = checkECode(barcodeInput);
    if (!result.name) return null;
    
    const statusEmoji = result.status === 'halal' ? '✅' : result.status === 'haram' ? '❌' : '⚠️';
    const statusText = result.status === 'halal' ? 'HELAL' : result.status === 'haram' ? 'HARAM' : 'ŞÜPHELİ';
    const statusColor = result.status === 'halal' ? 'text-emerald-400' : result.status === 'haram' ? 'text-red-400' : 'text-amber-400';
    
    return {
      icon: statusEmoji,
      title: barcodeInput,
      content: `${result.name}

${statusEmoji} Durum: ${statusText}

📝 Açıklama: ${result.desc}

${result.status === 'haram' ? '⚠️ Bu katkı maddesi helal değildir. Tüketmemeniz önerilir.' : 
  result.status === 'suspicious' ? '⚠️ Bu katkı maddesinin kaynağı belirsizdir. Üreticiye danışın.' : 
  '✅ Bu katkı maddesi genellikle helal kabul edilir.'}`,
      statusColor
    };
  };
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const lastScanRef = useRef(0);

  // Onboarding slides
  const onboardingSlides = [
    {
      icon: '📸',
      title: 'Ürünü Tara',
      description: 'Kameranı aç ve gıda ürününün üzerine tut. AI otomatik olarak ürünü tanıyacak.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: '🔍',
      title: 'Detaylı Analiz',
      description: 'Besin değerleri, katkı maddeleri, sağlık skoru ve daha fazlasını anında gör.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '☪️',
      title: 'Helal & Boykot Kontrolü',
      description: '200+ E-kodu veritabanı ile helal uygunluğunu ve boykot markalarını kontrol et.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: '💪',
      title: 'Kişisel Sağlık',
      description: 'Profilinde hastalık ve diyetini belirt, sana özel uyarılar al.',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  // Toast göster
  const showToast = (type, message, duration = 3000) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), duration);
  };

  // Onboarding tamamla
  const completeOnboarding = () => {
    localStorage.setItem('gidax_onboarding_done', 'true');
    setShowOnboarding(false);
  };

  useEffect(() => {
    const savedFavorites = localStorage.getItem('gidax_favorites');
    const savedHistory = localStorage.getItem('gidax_history');
    const savedProfile = localStorage.getItem('gidax_profile');
    const onboardingDone = localStorage.getItem('gidax_onboarding_done');
    
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (!onboardingDone) setShowOnboarding(true);
  }, []);

  // Kamera başlat
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      setCameraActive(true);
      
    } catch (error) {
      console.error('Kamera hatası:', error);
      showToast('error', 'Kamera açılamadı. Lütfen kamera izni verin.');
    }
  };

  // Kamera kapat
  const stopCamera = () => {
    // Auto-scan interval'i temizle
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setScanStatus('idle');
  };

  // Auto-scan: Ürün tespiti için hızlı kontrol
  const quickDetect = async (imageData) => {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) return null;

      const base64Data = imageData.split(',')[1] || imageData;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: 'Bu görselde paketli bir gıda ürünü var mı? Sadece JSON yanıt ver: {"found": true/false, "confidence": 0-100, "type": "product/barcode/none"}' 
              },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Data}`, detail: 'low' } }
            ]
          }],
          max_tokens: 100
        })
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (error) {
      console.error('Quick detect error:', error);
      return null;
    }
  };

  // Auto-scan başlat
  const startAutoScan = () => {
    if (scanIntervalRef.current) return;
    
    scanIntervalRef.current = setInterval(async () => {
      // Eğer zaten analiz yapılıyorsa veya son taradan 3 saniye geçmediyse atla
      if (isAnalyzing || Date.now() - lastScanRef.current < 3000) return;
      if (!videoRef.current || !canvasRef.current || !cameraActive) return;
      
      lastScanRef.current = Date.now();
      setScanStatus('scanning');
      
      // Frame al
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.5); // Düşük kalite = hızlı
      
      // Hızlı kontrol
      const detection = await quickDetect(imageData);
      
      if (detection?.found && detection.confidence > 70) {
        setScanStatus('detected');
        // Ürün bulundu, yüksek kalitede tekrar çek ve analiz et
        setTimeout(() => {
          if (cameraActive && !isAnalyzing) {
            captureAndAnalyze();
          }
        }, 500);
      } else {
        setScanStatus('scanning');
      }
    }, 2500); // Her 2.5 saniyede bir kontrol
  };

  // Kamera aktif olduğunda auto-scan başlat
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      // Video yüklenince auto-scan başlat
      videoRef.current.onloadedmetadata = () => {
        startAutoScan();
      };
    }
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, [cameraActive]);

  // Ekrana dokunulduğunda frame yakala ve analiz et
  const captureAndAnalyze = () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Görsel boyutunu küçült - daha hızlı upload ve işleme
    const maxWidth = 800;
    const maxHeight = 600;
    let width = video.videoWidth;
    let height = video.videoHeight;
    
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
    
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.7);
    stopCamera();
    analyzeImage(imageData);
  };

  const analyzeImage = async (imageData) => {
    setIsAnalyzing(true);
    setScanStatus('analyzing');
    
    try {
      // Step 1: AI ile ürün adı ve barkod tespit et
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        showToast('error', 'Sistem hatası. Lütfen daha sonra tekrar deneyin.');
        setIsAnalyzing(false);
        return;
      }

      const base64Data = imageData.split(',')[1] || imageData;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Data}`, detail: 'auto' } },
              { type: 'text', text: `Bu gıda ürününü analiz et. Barkod numarası görünüyorsa onu da oku.

JSON formatında yanıt ver:
{
  "found": true,
  "barcode": "varsa barkod numarası, yoksa null",
  "product": {"name": "Ürün Adı", "brand": "Marka", "category": "Kategori", "serving_size": "100g"},
  "nutrition": {
    "per_100g": {
      "energy": {"value": 0, "unit": "kcal"},
      "protein": {"value": 0, "unit": "g"},
      "carbohydrates": {"value": 0, "unit": "g"},
      "sugar": {"value": 0, "unit": "g"},
      "fat": {"value": 0, "unit": "g"},
      "saturated_fat": {"value": 0, "unit": "g"},
      "fiber": {"value": 0, "unit": "g"},
      "salt": {"value": 0, "unit": "g"}
    }
  },
  "ingredients": {"raw_text": "içerikler", "additives_list": ["E322", "E471"]},
  "nova_group": 3
}` }
            ]
          }]
        })
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        showToast('warning', 'Ürün tanınamadı. Lütfen daha net bir açıdan tekrar deneyin.');
        setIsAnalyzing(false);
        return;
      }

      let analysisData = JSON.parse(jsonMatch[0]);
      let dataSource = 'ai';
      
      // Step 2: Barkod varsa, önce yerel DB sonra Open Food Facts dene
      if (analysisData.barcode) {
        // Yerel DB'de ara
        const localProduct = findLocalProduct(analysisData.barcode);
        if (localProduct) {
          analysisData = {
            found: true,
            product: { name: localProduct.name, brand: localProduct.brand, category: localProduct.category, serving_size: '100g' },
            nutrition: { per_100g: Object.fromEntries(Object.entries(localProduct.nutrition).map(([k,v]) => [k, {value: v, unit: k === 'energy' ? 'kcal' : 'g'}])) },
            ingredients: { raw_text: localProduct.ingredients || '', additives_list: localProduct.additives || [] },
            nova_group: localProduct.nova_group
          };
          dataSource = 'local';
        } else {
          // Open Food Facts API dene
          const offResult = await fetchProductByBarcode(analysisData.barcode);
          if (offResult.success) {
            analysisData = {
              found: true,
              product: offResult.product,
              nutrition: { per_100g: Object.fromEntries(Object.entries(offResult.nutrition).map(([k,v]) => [k, {value: v, unit: k === 'energy' ? 'kcal' : 'g'}])) },
              ingredients: { raw_text: offResult.ingredients.raw_text, additives_list: offResult.ingredients.additives_list },
              nova_group: offResult.scores.nova_group
            };
            dataSource = 'openfoodfacts';
          }
        }
      }
      
      if (!analysisData.found || !analysisData.nutrition?.per_100g) {
        showToast('warning', 'Gıda ürünü tespit edilemedi. Ürünün ön yüzünü göstermeyi deneyin.');
        setIsAnalyzing(false);
        return;
      }

      const nutrition = analysisData.nutrition.per_100g;
      const healthScore = calculateHealthScore(nutrition);
      const gradeInfo = getGradeInfo(healthScore);
      const brandLower = analysisData.product.brand?.toLowerCase() || '';
      
      // E-kod analizi (yeni DB'den)
      const additives = analysisData.ingredients?.additives_list || [];
      const halalCheck = hasHaramOrSuspicious(additives);
      
      const fullResult = {
        product: analysisData.product,
        nutrition: nutrition,
        healthScore,
        gradeInfo,
        novaGroup: analysisData.nova_group || 3,
        ingredients: analysisData.ingredients,
        additives: additives.map(code => ({ code, ...checkECode(code) })).filter(a => a.name),
        alternatives: [],
        isBoycott: isBoycottBrand(brandLower),
        isTurkish: isTurkishBrand(brandLower),
        isHalal: !halalCheck.found && !analysisData.ingredients?.raw_text?.toLowerCase().includes('domuz'),
        halalWarning: halalCheck.found ? halalCheck.info : null,
        dataSource,
        analyzedAt: new Date().toISOString()
      };

      setResult(fullResult);
      setCurrentTab('result');
      
      // Add to history
      const newHistory = [fullResult, ...history.slice(0, 19)];
      setHistory(newHistory);
      localStorage.setItem('gidax_history', JSON.stringify(newHistory));
      
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Analiz hatası:', error);
      if (!navigator.onLine) {
        showToast('error', 'İnternet bağlantısı yok. Bağlantınızı kontrol edin.');
      } else {
        showToast('error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => analyzeImage(event.target.result);
    reader.readAsDataURL(file);
  };

  // Quick test product click handler
  const handleQuickTest = (product) => {
    const gradeInfo = getGradeInfo(product.healthScore);
    const fullResult = {
      product: {
        name: product.name,
        brand: product.brand,
        category: product.category,
        serving_size: '100g'
      },
      nutrition: product.nutrition,
      healthScore: product.healthScore,
      gradeInfo,
      novaGroup: product.novaGroup,
      ingredients: product.ingredients,
      additives: [],
      alternatives: [],
      isBoycott: product.isBoycott,
      isTurkish: product.isTurkish,
      isHalal: product.isHalal,
      dataSource: 'demo',
      analyzedAt: new Date().toISOString()
    };
    
    setResult(fullResult);
    
    // Add to history
    const newHistory = [fullResult, ...history.slice(0, 19)];
    setHistory(newHistory);
    localStorage.setItem('gidax_history', JSON.stringify(newHistory));
    
    showToast('success', `${product.name} analiz edildi`);
  };

  const toggleFavorite = () => {
    if (!result) return;
    const exists = favorites.find(f => f.product.name === result.product.name);
    let newFavorites;
    if (exists) {
      newFavorites = favorites.filter(f => f.product.name !== result.product.name);
    } else {
      newFavorites = [result, ...favorites];
    }
    setFavorites(newFavorites);
    localStorage.setItem('gidax_favorites', JSON.stringify(newFavorites));
  };

  const isFavorite = result && favorites.some(f => f.product.name === result.product.name);

  // Render functions
  const renderScanTab = () => (
    <div className="flex-1 overflow-auto pb-28 hide-scrollbar">
      {/* Canlı Kamera Görünümü */}
      {cameraActive ? (
        <div className="fixed inset-0 bg-black z-40" onClick={captureAndAnalyze}>
          {/* Kamera Header */}
          <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent safe-area-top">
            <button 
              onClick={(e) => { e.stopPropagation(); stopCamera(); }}
              className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center active:scale-95"
            >
              <X size={22} className="text-white" />
            </button>
            <span className="text-white font-medium text-sm">Ürünü Çerçeveye Al</span>
            <div className="w-11" />
          </div>
          
          {/* Video Stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Tarama Çerçevesi */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-64 h-64 sm:w-72 sm:h-72 rounded-3xl relative scanner-frame transition-all duration-300 ${
              scanStatus === 'detected' ? 'scale-105' : ''
            }`}>
              {/* Köşe işaretleri */}
              <div className={`absolute -top-0.5 -left-0.5 w-12 h-12 border-t-[3px] border-l-[3px] rounded-tl-2xl transition-colors ${
                scanStatus === 'detected' ? 'border-green-400' : scanStatus === 'scanning' ? 'border-yellow-400' : 'border-emerald-400'
              }`} />
              <div className={`absolute -top-0.5 -right-0.5 w-12 h-12 border-t-[3px] border-r-[3px] rounded-tr-2xl transition-colors ${
                scanStatus === 'detected' ? 'border-green-400' : scanStatus === 'scanning' ? 'border-yellow-400' : 'border-emerald-400'
              }`} />
              <div className={`absolute -bottom-0.5 -left-0.5 w-12 h-12 border-b-[3px] border-l-[3px] rounded-bl-2xl transition-colors ${
                scanStatus === 'detected' ? 'border-green-400' : scanStatus === 'scanning' ? 'border-yellow-400' : 'border-emerald-400'
              }`} />
              <div className={`absolute -bottom-0.5 -right-0.5 w-12 h-12 border-b-[3px] border-r-[3px] rounded-br-2xl transition-colors ${
                scanStatus === 'detected' ? 'border-green-400' : scanStatus === 'scanning' ? 'border-yellow-400' : 'border-emerald-400'
              }`} />
            </div>
          </div>
          
          {/* Alt Bilgi - Durum bazlı */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
            <div className="text-center max-w-xs mx-auto">
              {scanStatus === 'detected' ? (
                <>
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-500/30 border-2 border-green-400 flex items-center justify-center">
                    <Check size={28} className="text-green-400" />
                  </div>
                  <p className="text-green-400 font-semibold text-base mb-1">Ürün Tespit Edildi!</p>
                  <p className="text-slate-400 text-xs">Analiz başlatılıyor...</p>
                </>
              ) : scanStatus === 'scanning' ? (
                <>
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center">
                    <Search size={24} className="text-yellow-400 animate-pulse" />
                  </div>
                  <p className="text-yellow-400 font-semibold text-base mb-1">Taranıyor...</p>
                  <p className="text-slate-400 text-xs">Ürün aranıyor, bekleyin veya ekrana dokunun</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-pulse-glow">
                    <Camera size={24} className="text-emerald-400" />
                  </div>
                  <p className="text-white font-semibold text-base mb-1">Otomatik Tarama Aktif</p>
                  <p className="text-slate-400 text-xs">Ürünü çerçeveye al veya ekrana dokun</p>
                </>
              )}
            </div>
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <>
          {/* Welcome Header */}
          <div className="px-4 pt-5 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Merhaba! 👋</h2>
            <p className="text-slate-400 text-sm mt-1">Sağlıklı beslenme için ürünleri tara</p>
          </div>

          {/* Main Scan Card */}
          <div className="px-4 mb-5">
            <button 
              onClick={startCamera}
              className="w-full relative bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/5 rounded-2xl p-5 border border-emerald-500/20 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                  <Camera size={26} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-base sm:text-lg font-bold text-white">Ürün Tara</h3>
                  <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Kameraya dokun ve ürünü göster</p>
                </div>
                <ChevronRight size={22} className="text-slate-500 flex-shrink-0" />
              </div>
            </button>
          </div>

          {/* Gallery Option */}
          <div className="px-4 mb-5">
            <label className="flex items-center gap-4 bg-slate-800/40 rounded-2xl p-4 border border-white/5 cursor-pointer active:bg-slate-800/60 transition-colors">
              <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                <Search size={20} className="text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm sm:text-base">Galeriden Seç</h4>
                <p className="text-slate-500 text-xs mt-0.5 truncate">Kayıtlı fotoğraftan analiz et</p>
              </div>
            </label>
          </div>

          {/* E-Code Scanner */}
          <div className="px-4 mb-5">
            <div className="bg-slate-800/40 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <span className="text-lg">🔬</span>
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">E-Kod Sorgula</h4>
                  <p className="text-slate-500 text-xs">Katkı maddesi helal mi?</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Örn: E471"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500/50"
                />
                <button
                  onClick={() => {
                    if (barcodeInput) {
                      const result = checkECode(barcodeInput);
                      if (result.name) {
                        setInfoModal('ecode_result');
                      } else {
                        showToast('warning', 'E-kod bulunamadı. Örn: E471, E322');
                      }
                    }
                  }}
                  className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium text-sm transition"
                >
                  Sorgula
                </button>
              </div>
            </div>
          </div>

          {/* Quick Test Section */}
          <div className="px-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-amber-400" />
              <h3 className="text-white font-semibold text-sm">Popüler Ürünler</h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {quickTestProducts.map((product, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickTest(product)}
                  className="bg-slate-800/40 border border-white/5 rounded-xl p-3 sm:p-4 text-left active:bg-slate-800/70 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <span className="text-xl sm:text-2xl flex-shrink-0">{product.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-xs sm:text-sm truncate">{product.name}</p>
                      <p className="text-slate-500 text-[10px] sm:text-xs truncate">{product.brand}</p>
                    </div>
                    <span 
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: product.color }}
                    >
                      {product.grade}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Analyzing Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-slate-900/98 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="text-center px-6 animate-fade-in">
            {/* Animated Logo */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
              {/* Middle ring */}
              <div className="absolute inset-2 rounded-full border-4 border-teal-400/30 animate-pulse" />
              {/* Inner circle with icon */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="animate-pulse">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="white" fillOpacity="0.2"/>
                  <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="2" fill="white"/>
                </svg>
              </div>
            </div>
            
            {/* Text */}
            <h3 className="text-white font-bold text-xl mb-2">Analiz Ediliyor</h3>
            <p className="text-slate-400 text-sm mb-1">Yapay zeka ürünü inceliyor...</p>
            
            {/* Progress bar */}
            <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto mt-5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-progress" />
            </div>
            
            {/* Tips */}
            <p className="text-slate-500 text-xs mt-6 max-w-[200px] mx-auto">
              💡 Besin değerlerini, katkı maddelerini ve sağlık skorunu hesaplıyoruz
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderResultView = () => {
    if (!result) return null;
    const { product, nutrition, healthScore, gradeInfo, novaGroup, ingredients, alternatives, isBoycott, isTurkish, isHalal } = result;
    
    return (
      <div className="flex-1 overflow-auto pb-24">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl z-10 px-4 py-3 flex items-center justify-between border-b border-white/5">
          <button onClick={() => setResult(null)} className="text-slate-400 hover:text-white transition">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <span className="text-white font-semibold">Analiz Sonucu</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${product.name} - Healtune Analizi`,
                    text: `${product.name} (${product.brand}): Sağlık Skoru ${healthScore}/100 - ${gradeInfo.label}`,
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(`${product.name} (${product.brand}): Sağlık Skoru ${healthScore}/100 - ${gradeInfo.label}`);
                  alert('Panoya kopyalandı!');
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <Share2 size={20} />
            </button>
            <button onClick={toggleFavorite} className={`p-2 rounded-xl transition ${isFavorite ? 'text-red-400 bg-red-500/10' : 'text-slate-400 hover:text-white'}`}>
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Product Card */}
        <div className="px-4 py-6">
          <div className={`bg-gradient-to-br ${gradeInfo.bg} rounded-[28px] p-6 border border-white/10`}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-3xl">
                {getCategoryIcon(product.category)}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">{product.name}</h1>
                <p className="text-slate-400">{product.brand}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="px-3 py-1 bg-slate-800/60 rounded-full text-xs text-slate-300">{product.category}</span>
                  <span className="px-3 py-1 bg-slate-800/60 rounded-full text-xs text-slate-300">{product.serving_size || '100g'}</span>
                  <button 
                    onClick={() => setInfoModal('nutriscore')}
                    className="px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 active:scale-95 transition-transform"
                    style={{ backgroundColor: gradeInfo.color }}
                  >
                    Nutri-Score {gradeInfo.grade}
                    <Info size={10} />
                  </button>
                </div>
              </div>
            </div>

            {/* Score Circle */}
            <div className="flex items-center justify-between">
              <button onClick={() => setInfoModal('healthscore')} className="text-left active:scale-[0.98] transition-transform">
                <p className="text-slate-400 text-sm mb-1 flex items-center gap-1">Sağlık Skoru <Info size={12} /></p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">{healthScore}</span>
                  <span className="text-slate-500">/100</span>
                </div>
                <p className="text-sm mt-1" style={{ color: gradeInfo.color }}>{gradeInfo.label}</p>
              </button>
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white border-4"
                style={{ borderColor: gradeInfo.color, backgroundColor: `${gradeInfo.color}20` }}
              >
                {gradeInfo.grade}
              </div>
            </div>

            {/* Nova Group */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-slate-400 text-sm">NOVA Grubu</span>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-semibold">{novaGroup}</span>
                <span className="text-slate-300 text-sm">
                  {novaGroup === 1 ? 'İşlenmemiş' : novaGroup === 2 ? 'Az İşlenmiş' : novaGroup === 3 ? 'İşlenmiş' : 'Ultra İşlenmiş'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badges - Compact Grid */}
        <div className="px-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {/* Halal Badge */}
            <button 
              onClick={() => setInfoModal('halal')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl active:scale-95 transition-transform ${
                isHalal ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-red-500/15 border border-red-500/30'
              }`}
            >
              <span className="text-lg">☪️</span>
              <span className={`text-sm font-medium ${isHalal ? 'text-emerald-400' : 'text-red-400'}`}>
                {isHalal ? 'Helal' : 'Şüpheli'}
              </span>
              {isHalal ? <Check size={14} className="text-emerald-400" /> : <AlertTriangle size={14} className="text-red-400" />}
            </button>

            {/* Turkish Badge */}
            {isTurkish && (
              <button 
                onClick={() => setInfoModal('turkish')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 active:scale-95 transition-transform"
              >
                <span className="text-lg">🇹🇷</span>
                <span className="text-sm font-medium text-blue-400">Yerli</span>
                <Check size={14} className="text-blue-400" />
              </button>
            )}

            {/* Boycott Badge */}
            {isBoycott && (
              <button 
                onClick={() => setInfoModal('boycott')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/15 border border-red-500/30 active:scale-95 transition-transform"
              >
                <span className="text-lg">✊</span>
                <span className="text-sm font-medium text-red-400">Boykot</span>
                <AlertTriangle size={14} className="text-red-400" />
              </button>
            )}

            {/* Vegan Badge - if applicable */}
            {!ingredients?.raw_text?.toLowerCase().match(/et|süt|yumurta|bal|jelatin|peynir|tereyağ/) && (
              <button 
                onClick={() => setInfoModal('vegan')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/15 border border-green-500/30 active:scale-95 transition-transform"
              >
                <span className="text-lg">🌱</span>
                <span className="text-sm font-medium text-green-400">Vegan</span>
                <Check size={14} className="text-green-400" />
              </button>
            )}

            {/* NOVA Badge */}
            <button 
              onClick={() => setInfoModal('nova')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl active:scale-95 transition-transform ${
                novaGroup <= 2 ? 'bg-emerald-500/15 border border-emerald-500/30' : 
                novaGroup === 3 ? 'bg-amber-500/15 border border-amber-500/30' : 
                'bg-red-500/15 border border-red-500/30'
              }`}
            >
              <span className="text-lg">🏭</span>
              <span className={`text-sm font-medium ${
                novaGroup <= 2 ? 'text-emerald-400' : novaGroup === 3 ? 'text-amber-400' : 'text-red-400'
              }`}>
                NOVA {novaGroup}
              </span>
            </button>
          </div>
        </div>

        {/* Nutrition Chart - Visual */}
        <div className="px-4 mb-4">
          <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>📊</span> Besin Değerleri
            </h3>
            <div className="space-y-4">
              {/* Sugar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Şeker</span>
                  <span className="text-white font-medium">{nutrition.sugar?.value || 0}g</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      (nutrition.sugar?.value || 0) > 22.5 ? 'bg-red-500' : 
                      (nutrition.sugar?.value || 0) > 12.5 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min((nutrition.sugar?.value || 0) / 30 * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              {/* Fat */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Yağ</span>
                  <span className="text-white font-medium">{nutrition.fat?.value || 0}g</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      (nutrition.fat?.value || 0) > 20 ? 'bg-red-500' : 
                      (nutrition.fat?.value || 0) > 10 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min((nutrition.fat?.value || 0) / 30 * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              {/* Saturated Fat */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Doymuş Yağ</span>
                  <span className="text-white font-medium">{nutrition.saturated_fat?.value || 0}g</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      (nutrition.saturated_fat?.value || 0) > 5 ? 'bg-red-500' : 
                      (nutrition.saturated_fat?.value || 0) > 2.5 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min((nutrition.saturated_fat?.value || 0) / 10 * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              {/* Salt */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Tuz</span>
                  <span className="text-white font-medium">{nutrition.salt?.value || 0}g</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      (nutrition.salt?.value || 0) > 1.5 ? 'bg-red-500' : 
                      (nutrition.salt?.value || 0) > 0.75 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min((nutrition.salt?.value || 0) / 2.5 * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              {/* Protein - Good */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Protein</span>
                  <span className="text-white font-medium">{nutrition.protein?.value || 0}g</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${Math.min((nutrition.protein?.value || 0) / 20 * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              {/* Fiber - Good */}
              {nutrition.fiber?.value > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Lif</span>
                    <span className="text-white font-medium">{nutrition.fiber?.value || 0}g</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{ width: `${Math.min((nutrition.fiber?.value || 0) / 10 * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Legend */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Düşük
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full bg-amber-500" /> Orta
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full bg-red-500" /> Yüksek
              </div>
            </div>
          </div>
        </div>

        {/* Personal Assessment */}
        <div className="px-4 space-y-3">
          {(() => {
            const concerns = [];
            const benefits = [];
            let suitable = true;
            
            // Check based on user profile
            if (userProfile.diseases?.includes('diyabet') && nutrition.sugar?.value > 10) {
              concerns.push(`Yüksek şeker (${nutrition.sugar?.value}g)`);
              suitable = false;
            }
            if (userProfile.diseases?.includes('hipertansiyon') && nutrition.salt?.value > 1) {
              concerns.push(`Yüksek tuz (${nutrition.salt?.value}g)`);
              suitable = false;
            }
            if (userProfile.diseases?.includes('kolesterol') && nutrition.saturated_fat?.value > 5) {
              concerns.push(`Yüksek doymuş yağ (${nutrition.saturated_fat?.value}g)`);
              suitable = false;
            }
            if (userProfile.goals?.includes('kilo_ver') && nutrition.energy?.value > 300) {
              concerns.push(`Yüksek kalori (${nutrition.energy?.value} kcal)`);
            }
            if (userProfile.goals?.includes('seker_azalt') && nutrition.sugar?.value > 5) {
              concerns.push(`Şeker içeriği (${nutrition.sugar?.value}g)`);
            }
            
            // Benefits
            if (nutrition.protein?.value > 10) benefits.push(`Yüksek protein (${nutrition.protein?.value}g)`);
            if (nutrition.fiber?.value > 3) benefits.push(`İyi lif kaynağı (${nutrition.fiber?.value}g)`);
            if (nutrition.sugar?.value < 5) benefits.push('Düşük şeker');
            if (nutrition.salt?.value < 0.5) benefits.push('Düşük tuz');
            
            return (
              <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${suitable ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                    <span className="text-xl">{suitable ? '👍' : '⚠️'}</span>
                  </div>
                  <div>
                    <p className={`font-semibold ${suitable ? 'text-emerald-400' : 'text-amber-400'}`}>
                      Kişisel Değerlendirme
                    </p>
                    <p className="text-slate-400 text-sm">
                      {suitable ? 'Bu ürün sizin için uygundur.' : 'Dikkat edilmesi gereken içerikler var.'}
                    </p>
                  </div>
                </div>
                
                {concerns.length > 0 && (
                  <div className="mb-3">
                    <p className="text-slate-500 text-xs mb-2">Dikkat:</p>
                    <div className="flex flex-wrap gap-2">
                      {concerns.map((c, i) => (
                        <span key={i} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {benefits.length > 0 && (
                  <div>
                    <p className="text-slate-500 text-xs mb-2">Faydaları:</p>
                    <div className="flex flex-wrap gap-2">
                      {benefits.map((b, i) => (
                        <span key={i} className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs">{b}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Portion Calculator */}
        <div className="px-4 mt-6">
          <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍽️</span>
                <span className="text-white font-semibold">Porsiyon Hesaplama</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setPortion(Math.max(0.5, portion - 0.5))}
                  className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 transition"
                >
                  <Minus size={16} />
                </button>
                <span className="text-white font-semibold w-8 text-center">{portion}</span>
                <button 
                  onClick={() => setPortion(portion + 0.5)}
                  className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 transition"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Kalori', value: Math.round((nutrition.energy?.value || 0) * portion), color: 'text-orange-400' },
                { label: 'Protein', value: `${((nutrition.protein?.value || 0) * portion).toFixed(1)}g`, color: 'text-blue-400' },
                { label: 'Şeker', value: `${((nutrition.sugar?.value || 0) * portion).toFixed(1)}g`, color: 'text-pink-400' },
                { label: 'Yağ', value: `${((nutrition.fat?.value || 0) * portion).toFixed(1)}g`, color: 'text-amber-400' },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-900/50 rounded-xl p-3 text-center">
                  <p className="text-slate-500 text-xs mb-1">{item.label}</p>
                  <p className={`font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nutrition Details */}
        <div className="px-4 mt-6">
          <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📊</span>
              <span className="text-white font-semibold">Besin Değerleri</span>
              <span className="text-slate-500 text-sm">(100g)</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Enerji</span>
                <span className="text-white font-semibold">{nutrition.energy?.value || 0} kcal</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Protein', value: nutrition.protein?.value, color: 'from-blue-500 to-blue-600' },
                  { label: 'Karbonhidrat', value: nutrition.carbohydrates?.value, color: 'from-purple-500 to-purple-600' },
                  { label: 'Yağ', value: nutrition.fat?.value, color: 'from-amber-500 to-amber-600' },
                ].map((item, idx) => (
                  <div key={idx} className={`bg-gradient-to-br ${item.color} rounded-xl p-3 text-center`}>
                    <p className="text-white/70 text-xs">{item.label}</p>
                    <p className="text-white font-bold">{item.value || 0}g</p>
                  </div>
                ))}
              </div>

              {/* Nutrient Levels */}
              {[
                { key: 'sugar', label: 'Şeker', value: nutrition.sugar?.value },
                { key: 'saturated_fat', label: 'Doymuş Yağ', value: nutrition.saturated_fat?.value },
                { key: 'salt', label: 'Tuz', value: nutrition.salt?.value },
                { key: 'fiber', label: 'Lif', value: nutrition.fiber?.value },
              ].map((item, idx) => {
                const level = getNutrientLevel(item.key, item.value || 0);
                return (
                  <div key={idx} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: level.color }} />
                      <span className="text-slate-300">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-sm">{item.value || 0}g</span>
                      <span className="text-sm font-medium" style={{ color: level.color }}>{level.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ingredients */}
        {ingredients?.raw_text && (
          <div className="px-4 mt-6">
            <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🔬</span>
                <span className="text-white font-semibold">İçindekiler</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{ingredients.raw_text}</p>
              
              {ingredients.additives_list?.length > 0 && (
                <div className="mt-4">
                  <p className="text-slate-500 text-xs mb-2">Katkı Maddeleri:</p>
                  <div className="flex flex-wrap gap-2">
                    {ingredients.additives_list.map((code, idx) => {
                      const eCode = eCodeDatabase[code.toUpperCase()];
                      const statusColors = {
                        halal: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                        haram: 'bg-red-500/20 text-red-300 border-red-500/30',
                        suspicious: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                        unknown: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                      };
                      const status = eCode?.status || 'unknown';
                      const statusLabels = { halal: '✓', haram: '✗', suspicious: '?', unknown: '' };
                      
                      return (
                        <div key={idx} className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${statusColors[status]}`}>
                          <span className="font-semibold">{code}</span>
                          {eCode && (
                            <span className="ml-1 opacity-75">
                              {statusLabels[status]} {eCode.name}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-4 mt-3 text-xs">
                    <span className="text-emerald-400">✓ Helal</span>
                    <span className="text-amber-400">? Şüpheli</span>
                    <span className="text-red-400">✗ Haram</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alternatives */}
        {alternatives?.length > 0 && (
          <div className="px-4 mt-6 mb-8">
            <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🔄</span>
                <span className="text-white font-semibold">Daha Sağlıklı Alternatifler</span>
              </div>
              
              <div className="space-y-3">
                {alternatives.map((alt, idx) => (
                  <div key={idx} className="bg-slate-900/50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🇹🇷</span>
                      <div>
                        <p className="text-white font-medium">{alt.name}</p>
                        <p className="text-slate-500 text-sm">{alt.brand}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-semibold">{alt.score_diff || '+20'} puan</p>
                      <p className="text-slate-500 text-xs">{alt.benefit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFavorites = () => (
    <div className="flex-1 overflow-auto pb-28 px-4 pt-5 hide-scrollbar">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Favorilerim</h2>
      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <Heart size={28} className="text-slate-600" />
          </div>
          <p className="text-slate-400 text-sm">Henüz favori ürün yok</p>
          <p className="text-slate-500 text-xs mt-1">Beğendiğin ürünleri buraya ekle</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {favorites.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setResult(item)}
              className="w-full bg-slate-800/40 border border-white/5 rounded-xl p-3.5 sm:p-4 text-left active:bg-slate-800/70 transition-colors animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl">{getCategoryIcon(item.product.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm sm:text-base truncate">{item.product.name}</p>
                  <p className="text-slate-500 text-xs truncate">{item.product.brand}</p>
                </div>
                <span 
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: item.gradeInfo.color }}
                >
                  {item.gradeInfo.grade}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="flex-1 overflow-auto pb-28 px-4 pt-5 hide-scrollbar">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Geçmiş</h2>
      {history.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <Clock size={28} className="text-slate-600" />
          </div>
          <p className="text-slate-400 text-sm">Henüz analiz yok</p>
          <p className="text-slate-500 text-xs mt-1">Taranan ürünler burada görünecek</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setResult(item)}
              className="w-full bg-slate-800/40 border border-white/5 rounded-xl p-3.5 sm:p-4 text-left active:bg-slate-800/70 transition-colors animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl">{getCategoryIcon(item.product.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm sm:text-base truncate">{item.product.name}</p>
                  <p className="text-slate-500 text-xs truncate">{item.product.brand}</p>
                </div>
                <span 
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: item.gradeInfo.color }}
                >
                  {item.gradeInfo.grade}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const toggleProfileOption = (category, value) => {
    setUserProfile(prev => {
      const updated = { ...prev };
      if (updated[category].includes(value)) {
        updated[category] = updated[category].filter(v => v !== value);
      } else {
        updated[category] = [...updated[category], value];
      }
      localStorage.setItem('gidax_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const renderProfile = () => {
    const profileOptions = {
      diseases: [
        { id: 'diyabet', label: 'Diyabet', icon: '🩸' },
        { id: 'hipertansiyon', label: 'Hipertansiyon', icon: '💓' },
        { id: 'kolesterol', label: 'Yüksek Kolesterol', icon: '🫀' },
        { id: 'kalp', label: 'Kalp Hastalığı', icon: '❤️' },
      ],
      sensitivities: [
        { id: 'gluten', label: 'Gluten', icon: '🌾' },
        { id: 'laktoz', label: 'Laktoz', icon: '🥛' },
        { id: 'fistik', label: 'Fıstık Alerjisi', icon: '🥜' },
        { id: 'yumurta', label: 'Yumurta Alerjisi', icon: '🥚' },
      ],
      diet: [
        { id: 'vegan', label: 'Vegan', icon: '🌱' },
        { id: 'vejetaryen', label: 'Vejetaryen', icon: '🥗' },
        { id: 'helal', label: 'Helal', icon: '☪️' },
        { id: 'kosher', label: 'Koşer', icon: '✡️' },
      ],
      goals: [
        { id: 'kilo_ver', label: 'Kilo Verme', icon: '⚖️' },
        { id: 'kas_yap', label: 'Kas Yapma', icon: '💪' },
        { id: 'seker_azalt', label: 'Şeker Azaltma', icon: '🍬' },
        { id: 'tuz_azalt', label: 'Tuz Azaltma', icon: '🧂' },
      ]
    };

    const renderOptionGroup = (title, category, options) => (
      <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
        <h3 className="text-white font-semibold mb-4">{title}</h3>
        <div className="grid grid-cols-2 gap-2">
          {options.map(opt => {
            const isSelected = userProfile[category]?.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggleProfileOption(category, opt.id)}
                className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                  isSelected 
                    ? 'bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400' 
                    : 'bg-slate-900/50 border-2 border-transparent text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="text-lg">{opt.icon}</span>
                <span className="text-sm font-medium">{opt.label}</span>
                {isSelected && <Check size={16} className="ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>
    );

    return (
      <div className="flex-1 overflow-auto pb-24 px-4 pt-6 space-y-4">
        <h2 className="text-xl font-bold text-white mb-2">Profil Ayarları</h2>
        <p className="text-slate-400 text-sm mb-4">Kişiselleştirilmiş öneriler için bilgilerinizi girin</p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-2xl p-4 border border-emerald-500/20">
            <p className="text-slate-400 text-xs mb-1">Toplam Analiz</p>
            <p className="text-white text-2xl font-bold">{history.length}</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/10 rounded-2xl p-4 border border-pink-500/20">
            <p className="text-slate-400 text-xs mb-1">Favoriler</p>
            <p className="text-white text-2xl font-bold">{favorites.length}</p>
          </div>
        </div>

        {renderOptionGroup('🏥 Sağlık Durumları', 'diseases', profileOptions.diseases)}
        {renderOptionGroup('⚠️ Hassasiyetler & Alerjiler', 'sensitivities', profileOptions.sensitivities)}
        {renderOptionGroup('🍽️ Diyet Tercihleri', 'diet', profileOptions.diet)}
        {renderOptionGroup('🎯 Hedefler', 'goals', profileOptions.goals)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-[100] animate-slide-down`}>
          <div className={`mx-auto max-w-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
            toast.type === 'error' ? 'bg-red-500/90 backdrop-blur' :
            toast.type === 'warning' ? 'bg-amber-500/90 backdrop-blur' :
            toast.type === 'success' ? 'bg-emerald-500/90 backdrop-blur' :
            'bg-slate-700/90 backdrop-blur'
          }`}>
            <div className="flex-shrink-0">
              {toast.type === 'error' && <X size={20} className="text-white" />}
              {toast.type === 'warning' && <AlertTriangle size={20} className="text-white" />}
              {toast.type === 'success' && <Check size={20} className="text-white" />}
              {toast.type === 'info' && <Info size={20} className="text-white" />}
            </div>
            <p className="text-white text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => setToast(null)} className="flex-shrink-0 p-1">
              <X size={16} className="text-white/70" />
            </button>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {infoModal && (infoContents[infoModal] || infoModal === 'ecode_result') && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center" onClick={() => setInfoModal(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div 
            className="relative bg-slate-800 rounded-t-3xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-slate-600 rounded-full" />
            </div>
            
            {/* Header */}
            <div className="flex items-center gap-4 px-6 pb-4 border-b border-white/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <span className="text-3xl">
                  {infoModal === 'ecode_result' ? getEcodeModalContent()?.icon : infoContents[infoModal]?.icon}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">
                  {infoModal === 'ecode_result' ? getEcodeModalContent()?.title : infoContents[infoModal]?.title}
                </h3>
              </div>
              <button 
                onClick={() => setInfoModal(null)}
                className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"
              >
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            
            {/* Content */}
            <div className="px-6 py-5 overflow-auto max-h-[60vh]">
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {infoModal === 'ecode_result' ? getEcodeModalContent()?.content : infoContents[infoModal]?.content}
              </p>
            </div>
            
            {/* Close Button */}
            <div className="px-6 pb-8 pt-2">
              <button 
                onClick={() => setInfoModal(null)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Screen */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col">
          {/* Skip button */}
          <div className="absolute top-4 right-4 safe-area-top z-10">
            <button 
              onClick={completeOnboarding}
              className="text-slate-400 text-sm px-3 py-1"
            >
              Atla
            </button>
          </div>

          {/* Slide Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${onboardingSlides[onboardingStep].color} flex items-center justify-center mb-8 shadow-2xl`}>
              <span className="text-5xl">{onboardingSlides[onboardingStep].icon}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              {onboardingSlides[onboardingStep].title}
            </h2>
            <p className="text-slate-400 text-center text-base leading-relaxed max-w-xs">
              {onboardingSlides[onboardingStep].description}
            </p>
          </div>

          {/* Dots & Button */}
          <div className="px-8 pb-12 safe-area-bottom">
            {/* Dots */}
            <div className="flex justify-center gap-2 mb-8">
              {onboardingSlides.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === onboardingStep 
                      ? 'w-8 bg-emerald-400' 
                      : 'w-2 bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Button */}
            <button
              onClick={() => {
                if (onboardingStep < onboardingSlides.length - 1) {
                  setOnboardingStep(onboardingStep + 1);
                } else {
                  completeOnboarding();
                }
              }}
              className={`w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r ${onboardingSlides[onboardingStep].color} active:scale-[0.98] transition-transform`}
            >
              {onboardingStep < onboardingSlides.length - 1 ? 'Devam Et' : 'Başla'}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center relative overflow-hidden shadow-lg shadow-emerald-500/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.15"/>
              <path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="white" fillOpacity="0.3"/>
              <path d="M12 8v4l3 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="1.5" fill="white"/>
              <path d="M12 6v1M18 12h-1M12 18v-1M6 12h1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Healtune</h1>
            <p className="text-xs text-slate-500">AI Gıda Analizi</p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
          <TrendingUp size={18} className="text-slate-400" />
        </button>
      </header>

      {/* Content */}
      {result ? renderResultView() : (
        currentTab === 'scan' ? renderScanTab() :
        currentTab === 'favorites' ? renderFavorites() :
        currentTab === 'history' ? renderHistory() :
        renderProfile()
      )}

      {/* Bottom Navigation */}
      {!result && !cameraActive && (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/5 pb-6 pt-3">
          <div className="grid grid-cols-5 items-center max-w-md mx-auto">
            {/* Ana Sayfa */}
            <button
              onClick={() => setCurrentTab('scan')}
              className={`flex flex-col items-center gap-1 py-2 transition ${
                currentTab === 'scan' ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <Search size={22} />
              <span className="text-[10px]">Ana Sayfa</span>
            </button>
            
            {/* Favoriler */}
            <button
              onClick={() => setCurrentTab('favorites')}
              className={`flex flex-col items-center gap-1 py-2 transition ${
                currentTab === 'favorites' ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <Heart size={22} />
              <span className="text-[10px]">Favoriler</span>
            </button>

            {/* Ortadaki Kamera Butonu */}
            <button
              onClick={() => {
                setCurrentTab('scan');
                startCamera();
              }}
              className="flex justify-center -mt-8"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 border-4 border-slate-900">
                <Camera size={24} className="text-white" />
              </div>
            </button>

            {/* Geçmiş */}
            <button
              onClick={() => setCurrentTab('history')}
              className={`flex flex-col items-center gap-1 py-2 transition ${
                currentTab === 'history' ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <Clock size={22} />
              <span className="text-[10px]">Geçmiş</span>
            </button>
            
            {/* Profil */}
            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex flex-col items-center gap-1 py-2 transition ${
                currentTab === 'profile' ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <User size={22} />
              <span className="text-[10px]">Profil</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

export default App;
