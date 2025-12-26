import React, { useState, useEffect } from 'react';
import { Camera, Search, Heart, Clock, User, Star, Zap, Leaf, Shield, TrendingUp, Plus, Minus, ChevronRight, X, Check, AlertTriangle, Info } from 'lucide-react';
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
const boycottBrands = ['coca-cola', 'pepsi', 'nestle', 'starbucks', 'danone', 'pringles', 'lays', 'doritos'];

// Turkish brands
const turkishBrands = ['ülker', 'eti', 'torku', 'pınar', 'sütaş', 'tat', 'uno', 'tamek', 'dimes', 'uludağ', 'erikli'];

function App() {
  const [currentTab, setCurrentTab] = useState('scan');
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
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

  useEffect(() => {
    const savedFavorites = localStorage.getItem('gidax_favorites');
    const savedHistory = localStorage.getItem('gidax_history');
    const savedProfile = localStorage.getItem('gidax_profile');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
  }, []);

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
              { type: 'text', text: `Bu gıda ürününü analiz et. JSON formatında yanıt ver:
{
  "found": true,
  "product": { "name": "Türkçe ad", "brand": "Marka", "category": "Kategori", "serving_size": "100g" },
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
    <div className="flex-1 overflow-auto pb-24">
      {/* Hero Scanner */}
      <div className="px-4 pt-6 pb-8">
        <div className="relative bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-[32px] p-8 border border-white/10 backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400/20 to-transparent rounded-full blur-2xl" />
          
          <div className="relative text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Camera size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Ürün Tara</h2>
            <p className="text-slate-400 text-sm mb-6">Fotoğraf çek veya galeriden seç</p>
            
            <div className="flex gap-3 justify-center">
              <label className="flex-1 max-w-[160px] py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-semibold text-white cursor-pointer hover:shadow-lg hover:shadow-emerald-500/25 transition-all active:scale-95">
                <input type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
                <Camera size={20} className="inline mr-2" />
                Kamera
              </label>
              <label className="flex-1 max-w-[160px] py-4 px-6 bg-white/10 border border-white/20 rounded-2xl font-semibold text-white cursor-pointer hover:bg-white/15 transition-all active:scale-95">
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                <Search size={20} className="inline mr-2" />
                Galeri
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Input */}
      <div className="px-4 mb-6">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
          <p className="text-slate-400 text-sm mb-3">veya barkod numarası girin:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="8690504055020"
              className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
            <button className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-semibold">
              <Search size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Test */}
      <div className="px-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-amber-400" />
          <h3 className="text-white font-semibold">Hızlı Test</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quickTestProducts.map((product, idx) => (
            <button
              key={idx}
              className="bg-slate-800/50 hover:bg-slate-800 border border-white/5 rounded-2xl p-4 text-left transition-all active:scale-98 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{product.icon}</span>
                  <div>
                    <p className="text-white font-medium text-sm">{product.name}</p>
                    <p className="text-slate-500 text-xs">{product.brand}</p>
                  </div>
                </div>
                <span 
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: product.color }}
                >
                  {product.grade}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Analyzing Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center animate-pulse">
              <Zap size={32} className="text-white" />
            </div>
            <p className="text-white font-semibold mb-2">AI Analiz Ediliyor...</p>
            <p className="text-slate-400 text-sm">Birkaç saniye sürebilir</p>
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
          <button onClick={toggleFavorite} className={`p-2 rounded-xl transition ${isFavorite ? 'text-red-400 bg-red-500/10' : 'text-slate-400 hover:text-white'}`}>
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Product Card */}
        <div className="px-4 py-6">
          <div className={`bg-gradient-to-br ${gradeInfo.bg} rounded-[28px] p-6 border border-white/10`}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-3xl">
                🍽️
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">{product.name}</h1>
                <p className="text-slate-400">{product.brand}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="px-3 py-1 bg-slate-800/60 rounded-full text-xs text-slate-300">{product.category}</span>
                  <span className="px-3 py-1 bg-slate-800/60 rounded-full text-xs text-slate-300">{product.serving_size || '100g'}</span>
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
                <div className="mt-4 flex flex-wrap gap-2">
                  {ingredients.additives_list.map((code, idx) => (
                    <span key={idx} className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-medium">
                      {code}
                    </span>
                  ))}
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
    <div className="flex-1 overflow-auto pb-24 px-4 pt-6">
      <h2 className="text-xl font-bold text-white mb-4">Favorilerim</h2>
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">Henüz favori ürün yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setResult(item)}
              className="w-full bg-slate-800/50 hover:bg-slate-800 border border-white/5 rounded-2xl p-4 text-left transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{item.product.name}</p>
                  <p className="text-slate-500 text-sm">{item.product.brand}</p>
                </div>
                <span 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
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
    <div className="flex-1 overflow-auto pb-24 px-4 pt-6">
      <h2 className="text-xl font-bold text-white mb-4">Geçmiş</h2>
      {history.length === 0 ? (
        <div className="text-center py-12">
          <Clock size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">Henüz analiz yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setResult(item)}
              className="w-full bg-slate-800/50 hover:bg-slate-800 border border-white/5 rounded-2xl p-4 text-left transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{item.product.name}</p>
                  <p className="text-slate-500 text-sm">{item.product.brand}</p>
                </div>
                <span 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
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
      {!result && (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/5 px-6 py-3 flex justify-around">
          {[
            { id: 'scan', icon: Search, label: 'Tara' },
            { id: 'favorites', icon: Heart, label: 'Favoriler' },
            { id: 'history', icon: Clock, label: 'Geçmiş' },
            { id: 'profile', icon: User, label: 'Profil' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition ${
                currentTab === tab.id 
                  ? 'text-emerald-400' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <tab.icon size={22} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

export default App;
