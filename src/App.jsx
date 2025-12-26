import React, { useState, useEffect, useRef } from 'react';
import { Camera, Search, Heart, Clock, User, Star, Zap, Leaf, Shield, TrendingUp, Plus, Minus, ChevronRight, X, Check, AlertTriangle, Info, Share2, Video, VideoOff } from 'lucide-react';
import './App.css';

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

// Quick test products
const quickTestProducts = [
  { name: 'Çikolatalı Gofret', brand: 'Ülker', grade: 'E', color: '#EF4444', icon: '🍫' },
  { name: 'Sade Yoğurt', brand: 'Sütaş', grade: 'A', color: '#10B981', icon: '🥛' },
  { name: 'Coca-Cola', brand: 'Coca-Cola', grade: 'E', color: '#EF4444', icon: '🥤' },
  { name: 'Beyaz Peynir', brand: 'Pınar', grade: 'C', color: '#F59E0B', icon: '🧀' },
  { name: 'Tam Buğday Ekmek', brand: 'Uno', grade: 'B', color: '#22C55E', icon: '🍞' },
  { name: 'Domates Salçası', brand: 'Tat', grade: 'A', color: '#10B981', icon: '🍅' },
];

// Boycott brands
const boycottBrands = ['coca-cola', 'pepsi', 'nestle', 'starbucks', 'danone', 'pringles', 'lays', 'doritos', 'lipton', 'magnum', 'algida', 'knorr', 'nescafe', 'kitkat', 'milka', 'oreo', 'mcdonalds', 'burger king', 'kfc', 'pizza hut'];

// Turkish brands
const turkishBrands = ['ülker', 'eti', 'torku', 'pınar', 'sütaş', 'tat', 'uno', 'tamek', 'dimes', 'uludağ', 'erikli', 'hayat', 'sana', 'bizim', 'yudum', 'komili', 'tadım', 'peyman', 'koska', 'mado', 'kahve dünyası', 'namet', 'banvit', 'keskinoğlu', 'şenpiliç', 'sera', 'burcu', 'filiz', 'pastavilla', 'kent', 'albeni', 'çokoprens', 'sarelle'];

// E-code database (Halal status: halal, haram, suspicious, unknown)
const eCodeDatabase = {
  // Kesinlikle Haram
  'E120': { name: 'Karmin', status: 'haram', desc: 'Böcekten elde edilir' },
  'E441': { name: 'Jelatin', status: 'haram', desc: 'Domuz kaynaklı olabilir' },
  'E542': { name: 'Kemik fosfatı', status: 'haram', desc: 'Hayvansal kaynak' },
  'E904': { name: 'Shellac', status: 'haram', desc: 'Böcek salgısı' },
  'E920': { name: 'L-sistein', status: 'haram', desc: 'Domuz kılından' },
  'E921': { name: 'L-sistein', status: 'haram', desc: 'Domuz kılından' },
  // Şüpheli (kaynak belirsiz)
  'E471': { name: 'Mono ve digliserit', status: 'suspicious', desc: 'Hayvansal/bitkisel belirsiz' },
  'E472': { name: 'Gliserit esterleri', status: 'suspicious', desc: 'Kaynak belirsiz' },
  'E473': { name: 'Sukroz esterleri', status: 'suspicious', desc: 'Kaynak belirsiz' },
  'E474': { name: 'Sukrogliseritler', status: 'suspicious', desc: 'Kaynak belirsiz' },
  'E475': { name: 'Poligliserol esterleri', status: 'suspicious', desc: 'Kaynak belirsiz' },
  'E476': { name: 'Poligliserol', status: 'suspicious', desc: 'Kaynak belirsiz' },
  'E477': { name: 'Propilen glikol esterleri', status: 'suspicious', desc: 'Kaynak belirsiz' },
  'E481': { name: 'Sodyum stearoil laktat', status: 'suspicious', desc: 'Kaynak belirsiz' },
  'E482': { name: 'Kalsiyum stearoil laktat', status: 'suspicious', desc: 'Kaynak belirsiz' },
  'E483': { name: 'Stearil tartrat', status: 'suspicious', desc: 'Kaynak belirsiz' },
  'E491': { name: 'Sorbitan monostearat', status: 'suspicious', desc: 'Kaynak belirsiz' },
  'E492': { name: 'Sorbitan tristearat', status: 'suspicious', desc: 'Kaynak belirsiz' },
  'E493': { name: 'Sorbitan monolaurat', status: 'suspicious', desc: 'Kaynak belirsiz' },
  'E494': { name: 'Sorbitan monooleat', status: 'suspicious', desc: 'Kaynak belirsiz' },
  'E495': { name: 'Sorbitan monopalmitat', status: 'suspicious', desc: 'Kaynak belirsiz' },
  'E631': { name: 'Sodyum inosinat', status: 'suspicious', desc: 'Et/balık kaynaklı olabilir' },
  'E635': { name: 'Sodyum ribonükleotit', status: 'suspicious', desc: 'Et/balık kaynaklı olabilir' },
  // Helal olanlar (yaygın kullanılan)
  'E100': { name: 'Kurkumin', status: 'halal', desc: 'Bitkisel' },
  'E101': { name: 'Riboflavin', status: 'halal', desc: 'Vitamin B2' },
  'E160a': { name: 'Karoten', status: 'halal', desc: 'Bitkisel' },
  'E160b': { name: 'Anato', status: 'halal', desc: 'Bitkisel' },
  'E162': { name: 'Pancar kırmızısı', status: 'halal', desc: 'Bitkisel' },
  'E170': { name: 'Kalsiyum karbonat', status: 'halal', desc: 'Mineral' },
  'E200': { name: 'Sorbik asit', status: 'halal', desc: 'Sentetik' },
  'E202': { name: 'Potasyum sorbat', status: 'halal', desc: 'Sentetik' },
  'E211': { name: 'Sodyum benzoat', status: 'halal', desc: 'Sentetik' },
  'E250': { name: 'Sodyum nitrit', status: 'halal', desc: 'Mineral' },
  'E270': { name: 'Laktik asit', status: 'halal', desc: 'Fermantasyon' },
  'E300': { name: 'Askorbik asit', status: 'halal', desc: 'Vitamin C' },
  'E306': { name: 'Tokoferol', status: 'halal', desc: 'Vitamin E' },
  'E322': { name: 'Lesitin', status: 'halal', desc: 'Soya kaynaklı' },
  'E330': { name: 'Sitrik asit', status: 'halal', desc: 'Bitkisel' },
  'E331': { name: 'Sodyum sitrat', status: 'halal', desc: 'Bitkisel' },
  'E400': { name: 'Aljinik asit', status: 'halal', desc: 'Deniz yosunu' },
  'E401': { name: 'Sodyum aljinat', status: 'halal', desc: 'Deniz yosunu' },
  'E406': { name: 'Agar', status: 'halal', desc: 'Deniz yosunu' },
  'E407': { name: 'Karragenan', status: 'halal', desc: 'Deniz yosunu' },
  'E410': { name: 'Keçiboynuzu', status: 'halal', desc: 'Bitkisel' },
  'E412': { name: 'Guar gum', status: 'halal', desc: 'Bitkisel' },
  'E414': { name: 'Arap zamkı', status: 'halal', desc: 'Bitkisel' },
  'E415': { name: 'Ksantan gum', status: 'halal', desc: 'Fermantasyon' },
  'E440': { name: 'Pektin', status: 'halal', desc: 'Bitkisel' },
  'E450': { name: 'Difosfat', status: 'halal', desc: 'Mineral' },
  'E460': { name: 'Selüloz', status: 'halal', desc: 'Bitkisel' },
  'E500': { name: 'Sodyum karbonat', status: 'halal', desc: 'Mineral' },
  'E503': { name: 'Amonyum karbonat', status: 'halal', desc: 'Mineral' },
  'E621': { name: 'MSG', status: 'halal', desc: 'Fermantasyon' },
};

function App() {
  const [currentTab, setCurrentTab] = useState('scan');
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [portion, setPortion] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [userProfile, setUserProfile] = useState({
    diseases: [],
    sensitivities: [],
    diet: [],
    goals: []
  });
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('gidax_favorites');
    const savedHistory = localStorage.getItem('gidax_history');
    const savedProfile = localStorage.getItem('gidax_profile');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
  }, []);

  // Kamera stream'i video'ya bağla
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

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
      alert('Kamera açılamadı. Lütfen kamera izni verin.');
    }
  };

  // Kamera kapat
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Ekrana dokunulduğunda frame yakala ve analiz et
  const captureAndAnalyze = () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    stopCamera();
    analyzeImage(imageData);
  };

  const analyzeImage = async (imageData) => {
    setIsAnalyzing(true);
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        alert('API key tanımlanmadı.');
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
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Data}` } },
              { type: 'text', text: `Bu gıda ürününü analiz et. Görseldeki ürünün MARKA adını, ürün adını ve besin değerlerini dikkatlice oku.

ÖNEMLİ: 
- Marka adını görselden tam olarak oku (Coca-Cola, Pepsi, Ülker, Eti vb.)
- Eğer marka görünmüyorsa "Bilinmiyor" yaz
- Besin değerlerini görselden oku, yoksa tahmin et

JSON formatında yanıt ver:
{
  "found": true,
  "product": { "name": "Ürün Adı Türkçe", "brand": "Marka Adı", "category": "Kategori", "serving_size": "100g" },
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
  "ingredients": { "raw_text": "İçerik listesi", "additives_list": ["E kodları"] },
  "nova_group": 1-4,
  "alternatives": [{"name": "Alternatif", "brand": "Marka", "benefit": "Fayda", "score_diff": "+20"}]
}` }
            ]
          }]
        })
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        alert('Ürün analiz edilemedi.');
        setIsAnalyzing(false);
        return;
      }

      const analysisData = JSON.parse(jsonMatch[0]);
      
      if (!analysisData.found || !analysisData.nutrition?.per_100g) {
        alert('Gıda ürünü tespit edilemedi.');
        setIsAnalyzing(false);
        return;
      }

      const nutrition = analysisData.nutrition.per_100g;
      const healthScore = calculateHealthScore(nutrition);
      const gradeInfo = getGradeInfo(healthScore);
      const brandLower = analysisData.product.brand?.toLowerCase() || '';
      
      const fullResult = {
        product: analysisData.product,
        nutrition: nutrition,
        healthScore,
        gradeInfo,
        novaGroup: analysisData.nova_group || 3,
        ingredients: analysisData.ingredients,
        alternatives: analysisData.alternatives || [],
        isBoycott: boycottBrands.some(b => brandLower.includes(b)),
        isTurkish: turkishBrands.some(b => brandLower.includes(b)),
        isHalal: !analysisData.ingredients?.raw_text?.toLowerCase().includes('domuz') && 
                 !analysisData.ingredients?.raw_text?.toLowerCase().includes('alkol'),
        analyzedAt: new Date().toISOString()
      };

      setResult(fullResult);
      
      // Add to history
      const newHistory = [fullResult, ...history.slice(0, 19)];
      setHistory(newHistory);
      localStorage.setItem('gidax_history', JSON.stringify(newHistory));
      
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Analiz hatası:', error);
      alert('Bir hata oluştu.');
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
        <div className="fixed inset-0 bg-black z-40">
          {/* Kamera Header */}
          <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent safe-area-top">
            <button 
              onClick={stopCamera}
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
            onClick={captureAndAnalyze}
          />
          
          {/* Tarama Çerçevesi */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl relative scanner-frame">
              {/* Köşe işaretleri */}
              <div className="absolute -top-0.5 -left-0.5 w-12 h-12 border-t-[3px] border-l-[3px] border-emerald-400 rounded-tl-2xl" />
              <div className="absolute -top-0.5 -right-0.5 w-12 h-12 border-t-[3px] border-r-[3px] border-emerald-400 rounded-tr-2xl" />
              <div className="absolute -bottom-0.5 -left-0.5 w-12 h-12 border-b-[3px] border-l-[3px] border-emerald-400 rounded-bl-2xl" />
              <div className="absolute -bottom-0.5 -right-0.5 w-12 h-12 border-b-[3px] border-r-[3px] border-emerald-400 rounded-br-2xl" />
            </div>
          </div>
          
          {/* Alt Bilgi */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
            <div className="text-center max-w-xs mx-auto">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-pulse-glow">
                <Camera size={24} className="text-emerald-400" />
              </div>
              <p className="text-white font-semibold text-base mb-1">Ekrana Dokun</p>
              <p className="text-slate-400 text-xs">Ürünü çerçeveye al ve taramak için dokun</p>
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
                  className="bg-slate-800/40 border border-white/5 rounded-xl p-3 sm:p-4 text-left active:bg-slate-800/70 transition-colors"
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
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center z-50">
          <div className="text-center px-6 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/30">
              <Zap size={30} className="text-white" />
            </div>
            <p className="text-white font-semibold text-lg mb-2">AI Analiz Ediliyor</p>
            <p className="text-slate-400 text-sm">Birkaç saniye sürebilir...</p>
            <div className="mt-6 flex justify-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{animationDelay: '0ms'}} />
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{animationDelay: '150ms'}} />
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{animationDelay: '300ms'}} />
            </div>
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
                    title: `${product.name} - GidaX Analizi`,
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
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: gradeInfo.color }}
                  >
                    Nutri-Score {gradeInfo.grade}
                  </span>
                </div>
              </div>
            </div>

            {/* Score Circle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Sağlık Skoru</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">{healthScore}</span>
                  <span className="text-slate-500">/100</span>
                </div>
                <p className="text-sm mt-1" style={{ color: gradeInfo.color }}>{gradeInfo.label}</p>
              </div>
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

        {/* Status Cards */}
        <div className="px-4 space-y-3">
          {/* Halal */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border ${isHalal ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">☪️</span>
              <div>
                <p className={`font-semibold ${isHalal ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isHalal ? 'Helal Uyumlu' : 'Şüpheli İçerik'}
                </p>
                <p className="text-slate-400 text-sm">
                  {isHalal ? 'Şüpheli içerik bulunamadı' : 'İçerik kontrolü gerekli'}
                </p>
              </div>
            </div>
            {isHalal ? <Check className="text-emerald-400" size={24} /> : <AlertTriangle className="text-red-400" size={24} />}
          </div>

          {/* Turkish */}
          {isTurkish && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇹🇷</span>
                <div>
                  <p className="font-semibold text-blue-400">Yerli Üretim</p>
                  <p className="text-slate-400 text-sm">Türk markası</p>
                </div>
              </div>
              <Check className="text-blue-400" size={24} />
            </div>
          )}

          {/* Boycott Warning */}
          {isBoycott && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✊</span>
                <div>
                  <p className="font-semibold text-red-400">Boykot Listesinde</p>
                  <p className="text-slate-400 text-sm">Bu marka boykot ediliyor</p>
                </div>
              </div>
              <AlertTriangle className="text-red-400" size={24} />
            </div>
          )}

          {/* Personal Assessment */}
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
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center relative overflow-hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#10B981"/>
              <circle cx="12" cy="10" r="4" fill="white"/>
              <path d="M12 7.5c0-.28.22-.5.5-.5.28 0 .5.22.5.5v1.5h1c.28 0 .5.22.5.5s-.22.5-.5.5h-1v1.5c0 .28-.22.5-.5.5-.28 0-.5-.22-.5-.5V10h-1c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1V7.5z" fill="#10B981"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">GidaX</h1>
            <p className="text-xs text-slate-500">AI Gıda Analizi v4.0</p>
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
