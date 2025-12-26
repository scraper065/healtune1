import React, { useState, useEffect } from 'react';
import { Settings, Clock, Heart, Menu } from 'lucide-react';
import ImageScanner from './components/ImageScanner';
import ResultView from './components/ResultView';
import ProfileModal from './components/ProfileModal';
import {
  calculateHealthScore,
  getGrade,
  getNutritionSummary,
  calculateSuitability,
  calculateNutriScore,
  determineNovaGroup
} from './utils/analysis';
import {
  getFavorites,
  getHistory,
  addFavorite,
  addToHistory,
  getUserProfile,
  saveUserProfile,
  isFavorite
} from './utils/storage';
import { checkSensitivities } from './data/sensitivities';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // home, result
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  // Başlangıçta profili ve geçmişi yükle
  useEffect(() => {
    setUserProfile(getUserProfile());
    setFavorites(getFavorites());
    setHistory(getHistory());
  }, []);

  // Profili kaydet
  const handleSaveProfile = (profile) => {
    saveUserProfile(profile);
    setUserProfile(profile);
  };

  // Claude Vision API ile görsel analiz
  const analyzeImage = async (imageData) => {
    setIsAnalyzing(true);
    try {
      const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

      if (!apiKey) {
        alert('API key tanımlanmadı. VITE_CLAUDE_API_KEY kontrol edin.');
        setIsAnalyzing(false);
        return;
      }

      // Base64 görselini API'ye gönder
      const base64Data = imageData.split(',')[1] || imageData;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: base64Data
                  }
                },
                {
                  type: 'text',
                  text: `Bu gıda ürününü analiz et. Sadece JSON formatında yanıt ver (başka metin yazma):
{
  "found": true/false,
  "product": {
    "name": "Türkçe ürün adı",
    "brand": "Marka adı",
    "category": "Atıştırmalık/İçecek/Süt Ürünü/Tahıl/Et Ürünü/Konserve/Dondurulmuş",
    "serving_size": "porsiyon (örn: 30g, 200ml)",
    "image_url": null
  },
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
  "ingredients": {
    "raw_text": "Tam içerik metni",
    "count": 0,
    "additives_list": ["E kodu listesi"]
  },
  "confidence": 0-100
}

Eğer net görünmüyorsa veya gıda değilse found: false döndür. Tüm besin değerlerini 100g başına tahmin et.`
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API hatası:', error);
        alert('Analiz hatası. Lütfen tekrar deneyin.');
        setIsAnalyzing(false);
        return;
      }

      const data = await response.json();
      const content = data.content[0].text;

      // JSON'ı çıkart
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        alert('Ürün analiz edilemedi. Başka bir fotoğraf deneyin.');
        setIsAnalyzing(false);
        return;
      }

      const analysisData = JSON.parse(jsonMatch[0]);

      if (!analysisData.found) {
        alert('Ürün tanınmadı. Başka bir fotoğraf deneyin.');
        setIsAnalyzing(false);
        return;
      }

      // Sağlık skorunu hesapla
      const nutrition = analysisData.nutrition.per_100g;
      const novaGroup = determineNovaGroup(analysisData.ingredients?.additives_list || []);
      const healthScore = calculateHealthScore(
        {
          sugar: nutrition.sugar?.value || 0,
          fat: nutrition.fat?.value || 0,
          saturated_fat: nutrition.saturated_fat?.value || 0,
          salt: nutrition.salt?.value || 0,
          fiber: nutrition.fiber?.value || 0,
          protein: nutrition.protein?.value || 0
        },
        novaGroup,
        analysisData.ingredients?.additives_list || []
      );

      const grade = getGrade(healthScore);
      const nutriScore = calculateNutriScore(healthScore);

      // Hassasiyet kontrolleri
      const sensitivityAlerts = checkSensitivities(analysisData, userProfile);

      // Kişisel analiz
      const personalAnalysis = calculateSuitability(
        {
          sugar: nutrition.sugar?.value || 0,
          fat: nutrition.fat?.value || 0,
          saturated_fat: nutrition.saturated_fat?.value || 0,
          salt: nutrition.salt?.value || 0,
          fiber: nutrition.fiber?.value || 0,
          protein: nutrition.protein?.value || 0
        },
        userProfile
      );

      // Sonuç objesi oluştur
      const fullResult = {
        product: analysisData.product,
        scores: {
          health_score: {
            value: healthScore,
            grade: grade,
            label: ['Çok Sağlıklı', 'Sağlıklı', 'Orta', 'Dikkatli Tüket', 'Kaçın'][
              ['A', 'B', 'C', 'D', 'E'].indexOf(grade)
            ],
            color: ['#22C55E', '#84CC16', '#F59E0B', '#F97316', '#EF4444'][
              ['A', 'B', 'C', 'D', 'E'].indexOf(grade)
            ]
          },
          nutri_score: nutriScore,
          nova_group: {
            value: novaGroup,
            label: ['İşlenmemiş', 'Az İşlenmiş', 'İşlenmiş', 'Ultra İşlenmiş'][novaGroup - 1]
          }
        },
        nutrition: {
          per_100g: nutrition,
          levels_summary: getNutritionSummary(nutrition)
        },
        ingredients: analysisData.ingredients,
        sensitivity_alerts: sensitivityAlerts,
        personal_analysis: {
          ...personalAnalysis,
          suitability_score: personalAnalysis.score
        },
        alternatives: [], // Bu, daha sonra eklenebilir
        metadata: {
          data_source: 'ai_vision',
          confidence: analysisData.confidence || 85,
          analyzed_at: new Date().toISOString()
        }
      };

      setResult(fullResult);
      addToHistory(fullResult.product);
      setHistory(getHistory());
      setCurrentPage('result');
    } catch (error) {
      console.error('Hata:', error);
      alert('Bir hata oluştu: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddFavorite = (product) => {
    if (isFavorite(product.product.name, product.product.brand)) {
      // Favoriden çıkar
      setFavorites(prev =>
        prev.filter(
          fav =>
            !(
              fav.product?.name === product.product.name &&
              fav.product?.brand === product.product.brand
            )
        )
      );
    } else {
      // Favoriye ekle
      addFavorite(product.product);
      setFavorites(getFavorites());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🍎</div>
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                GidaX
              </h1>
              <p className="text-xs text-slate-400">AI Gıda Analiz</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="p-3 hover:bg-slate-700/50 rounded-full transition hidden sm:block"
              title="Profil"
            >
              <Settings size={20} className="text-slate-300" />
            </button>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-3 hover:bg-slate-700/50 rounded-full transition"
            >
              <Menu size={20} className="text-slate-300" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-4 py-3 space-y-2">
              <button
                onClick={() => {
                  setCurrentPage('home');
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-slate-700/50 rounded-lg transition text-slate-300"
              >
                🏠 Ana Sayfa
              </button>
              <button
                onClick={() => {
                  setIsProfileModalOpen(true);
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-slate-700/50 rounded-lg transition text-slate-300"
              >
                ⚙️ Profil Ayarları
              </button>
              <a
                href="#favorites"
                onClick={() => setShowMenu(false)}
                className="block w-full text-left px-4 py-2 hover:bg-slate-700/50 rounded-lg transition text-slate-300"
              >
                ❤️ Favorileri Göster
              </a>
              <a
                href="#history"
                onClick={() => setShowMenu(false)}
                className="block w-full text-left px-4 py-2 hover:bg-slate-700/50 rounded-lg transition text-slate-300"
              >
                🕐 Geçmişi Göster
              </a>
            </div>
          </div>
        )}
      </header>

      {/* İçerik */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {currentPage === 'home' ? (
          <div className="space-y-8">
            {/* Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border border-teal-500/30 p-8 text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Gıda Ürünlerini Analiz Et
              </h2>
              <p className="text-slate-300 max-w-lg mx-auto">
                Ürün fotoğrafı çek veya yükle. Besin değerleri, sağlık puanı, helal/boykot/vegan
                kontrolleri ve daha fazlasını al.
              </p>
            </div>

            {/* Görsel Tarayıcı */}
            <ImageScanner
              onImageCapture={analyzeImage}
              isAnalyzing={isAnalyzing}
            />

            {/* Favoriler */}
            {favorites.length > 0 && (
              <section id="favorites">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Heart size={24} fill="currentColor" className="text-red-500" />
                  Favorilerim ({favorites.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {favorites.slice(0, 6).map((product, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const savedResult = {
                          product: product,
                          scores: {
                            health_score: { value: 0, grade: 'C', label: 'Orta', color: '#F59E0B' },
                            nova_group: { value: 3, label: 'İşlenmiş' }
                          }
                        };
                        setResult(savedResult);
                        setCurrentPage('result');
                      }}
                      className="p-4 bg-slate-800 hover:bg-slate-700/80 rounded-2xl text-left transition space-y-2"
                    >
                      <p className="font-semibold text-white truncate">{product.name}</p>
                      <p className="text-sm text-slate-400 truncate">{product.brand}</p>
                      <p className="text-xs text-slate-500">{product.category}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Geçmiş */}
            {history.length > 0 && (
              <section id="history">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock size={24} />
                  Son Taranmışlar ({history.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {history.slice(0, 6).map((product, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const savedResult = {
                          product: product,
                          scores: {
                            health_score: { value: 0, grade: 'C', label: 'Orta', color: '#F59E0B' },
                            nova_group: { value: 3, label: 'İşlenmiş' }
                          }
                        };
                        setResult(savedResult);
                        setCurrentPage('result');
                      }}
                      className="p-4 bg-slate-800 hover:bg-slate-700/80 rounded-2xl text-left transition space-y-2"
                    >
                      <p className="font-semibold text-white truncate">{product.name}</p>
                      <p className="text-sm text-slate-400 truncate">{product.brand}</p>
                      <p className="text-xs text-slate-500">{product.category}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <ResultView
            product={result}
            onBack={() => setCurrentPage('home')}
            onAddFavorite={handleAddFavorite}
            isFavorite={
              result
                ? isFavorite(result.product.name, result.product.brand)
                : false
            }
          />
        )}
      </main>

      {/* Profil Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        onSave={handleSaveProfile}
      />

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-12 py-6 text-center text-slate-400 text-sm">
        <p>© 2025 GidaX - Türkiye'nin Gıda Analiz AI'sı</p>
        <p className="mt-2 text-xs">
          ⚠️ Tıbbi tavsiye değildir. Önemli kararlar için doktorunuza danışın.
        </p>
      </footer>
    </div>
  );
}

export default App;
