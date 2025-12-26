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
  const [currentPage, setCurrentPage] = useState('home');
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setUserProfile(getUserProfile());
    setFavorites(getFavorites());
    setHistory(getHistory());
  }, []);

  const handleSaveProfile = (profile) => {
    saveUserProfile(profile);
    setUserProfile(profile);
  };

  // OpenAI GPT-4 Vision API ile görsel analiz
  const analyzeImage = async (imageData) => {
    setIsAnalyzing(true);
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

      if (!apiKey) {
        alert('API key tanımlanmadı. VITE_OPENAI_API_KEY kontrol edin.');
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
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Data}`
                  }
                },
                {
                  type: 'text',
                  text: `Bu gıda ürününü analiz et. Sadece JSON formatında yanıt ver:
{
  "found": true/false,
  "product": {
    "name": "Türkçe ürün adı",
    "brand": "Marka adı",
    "category": "Atıştırmalık/İçecek/Süt Ürünü/Tahıl/Et Ürünü/Konserve/Dondurulmuş",
    "serving_size": "porsiyon",
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
    "raw_text": "İçerik metni",
    "count": 0,
    "additives_list": ["E kodları"]
  },
  "confidence": 0-100
}`
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
      const content = data.choices[0].message.content;
      console.log('OpenAI Response:', content);

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        alert('Ürün analiz edilemedi. Başka bir fotoğraf deneyin.');
        setIsAnalyzing(false);
        return;
      }

      let analysisData;
      try {
        analysisData = JSON.parse(jsonMatch[0]);
        console.log('Parsed Data:', analysisData);
      } catch (parseError) {
        console.error('JSON Parse hatası:', parseError);
        alert('Veri işlenemedi. Tekrar deneyin.');
        setIsAnalyzing(false);
        return;
      }

      if (!analysisData.found) {
        alert('Gıda ürünü tespit edilemedi. Başka bir fotoğraf deneyin.');
        setIsAnalyzing(false);
        return;
      }

      // Güvenli erişim için kontrol
      if (!analysisData.nutrition?.per_100g || !analysisData.product || !analysisData.ingredients) {
        console.error('Eksik veri:', analysisData);
        alert('Ürün bilgileri eksik. Daha net bir fotoğraf deneyin.');
        setIsAnalyzing(false);
        return;
      }

      const nutrition = analysisData.nutrition.per_100g;
      const healthScore = calculateHealthScore(nutrition);
      const grade = getGrade(healthScore);
      const nutriScore = calculateNutriScore(nutrition);
      const novaGroup = determineNovaGroup(analysisData.ingredients.additives_list);
      const sensitivityAlerts = checkSensitivities(analysisData.product, analysisData.ingredients, userProfile);
      const personalAnalysis = userProfile 
        ? calculateSuitability(analysisData.product, analysisData.ingredients, nutrition, userProfile)
        : { score: 50, concerns: [], benefits: [], suitability: 'partially_suitable' };

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
        alternatives: [],
        metadata: {
          data_source: 'openai_vision',
          confidence: analysisData.confidence,
          analyzed_at: new Date().toISOString()
        }
      };

      setResult(fullResult);
      setCurrentPage('result');
      addToHistory(fullResult.product);
      setHistory([fullResult.product, ...getHistory().slice(0, 9)]);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Analiz hatası:', error);
      alert('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      setIsAnalyzing(false);
    }
  };

  const handleAddFavorite = () => {
    if (result?.product) {
      addFavorite(result.product);
      setFavorites(getFavorites());
    }
  };

  const handleBackHome = () => {
    setCurrentPage('home');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍎</span>
            <h1 className="text-2xl font-bold text-green-700">GidaX</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Profil"
            >
              <Settings size={20} />
            </button>
            
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Menu Dropdown */}
        {showMenu && (
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 max-w-4xl mx-auto">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-700 mb-3">Geçmiş</div>
              {history.length > 0 ? (
                history.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentPage('home');
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition text-sm"
                  >
                    <Clock size={16} className="inline mr-2" />
                    {item.name} - {item.brand}
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-sm px-3">Henüz analiz yok</p>
              )}

              <div className="pt-3 border-t border-gray-200 mt-3">
                <div className="text-sm font-semibold text-gray-700 mb-3">Favori Ürünler</div>
                {favorites.length > 0 ? (
                  favorites.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentPage('home');
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition text-sm"
                    >
                      <Heart size={16} className="inline mr-2" />
                      {item.name} - {item.brand}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm px-3">Henüz favori yok</p>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {currentPage === 'home' ? (
          <ImageScanner onImageSelected={analyzeImage} isAnalyzing={isAnalyzing} />
        ) : (
          <ResultView
            result={result}
            onBack={handleBackHome}
            onAddFavorite={handleAddFavorite}
            isFavorite={result ? isFavorite(result.product.name) : false}
          />
        )}
      </main>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <ProfileModal
          onClose={() => setIsProfileModalOpen(false)}
          onSave={handleSaveProfile}
          initialProfile={userProfile}
        />
      )}
    </div>
  );
}

export default App;
