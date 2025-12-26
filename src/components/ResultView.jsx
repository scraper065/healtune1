import React, { useState } from 'react';
import { Heart, Share2, ChevronDown, ChevronUp, Lightbulb, AlertCircle, Check } from 'lucide-react';
import { GRADE_MAPPING } from '../utils/analysis';

const ResultView = ({ result, onBack, onAddFavorite, isFavorite }) => {
  const [expandedSections, setExpandedSections] = useState({
    nutrition: true,
    ingredients: false,
    sensitivity: true,
    personal: false,
    alternatives: false
  });

  // Güvenlik kontrolü
  if (!result || !result.scores) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Yükleniyor...</p>
      </div>
    );
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const gradeInfo = GRADE_MAPPING[result.scores.health_score.grade];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-8">
      {/* Başlık */}
      <div className="space-y-4">
        {result.product.image_url && (
          <div className="rounded-3xl overflow-hidden border-2 border-teal-500/30 h-64 bg-slate-800">
            <img
              src={result.product.image_url}
              alt={result.product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">{result.product.name}</h1>
          <p className="text-lg text-slate-400">{result.product.brand}</p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="px-3 py-1 bg-slate-800 rounded-full">{result.product.category}</span>
            <span className="px-3 py-1 bg-slate-800 rounded-full">{result.product.serving_size}</span>
          </div>
        </div>
      </div>

      {/* Sağlık Skoru */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border-2" style={{ borderColor: gradeInfo.color }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-2">Sağlık Skoru</p>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold text-white">{result.scores.health_score.value}</div>
              <div>
                <div className="text-4xl font-bold" style={{ color: gradeInfo.color }}>
                  {result.scores.health_score.grade}
                </div>
                <p className="text-sm text-slate-400">{gradeInfo.label}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onAddFavorite(result)}
            className={`p-4 rounded-2xl transition ${
              isFavorite
                ? 'bg-red-500/20 text-red-400'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* İlerleme Çubuğu */}
        <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${result.scores.health_score.value}%`,
              backgroundColor: gradeInfo.color
            }}
          />
        </div>
      </div>

      {/* Besin Seviyeleri Özeti */}
      <div className="bg-slate-800 rounded-3xl p-6 space-y-3">
        <h3 className="font-bold text-white flex items-center gap-2">
          <AlertCircle size={20} />
          Besin Seviyeleri
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {result.nutrition.levels_summary && Object.entries(result.nutrition.levels_summary).map(([key, data]) => (
            <div key={key} className="bg-slate-700 rounded-2xl p-3 flex items-center justify-between">
              <span className="text-sm text-slate-300 capitalize">
                {key === 'saturated_fat' ? 'Doymuş Yağ' :
                 key === 'sugar' ? 'Şeker' :
                 key === 'salt' ? 'Tuz' :
                 key === 'fat' ? 'Yağ' : key}
              </span>
              <span className="text-xl">{data.icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Besin Değerleri */}
      <div className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700">
        <button
          onClick={() => toggleSection('nutrition')}
          className="w-full p-6 flex items-center justify-between hover:bg-slate-700/50 transition"
        >
          <h3 className="font-bold text-white flex items-center gap-2">
            📊 Besin Değerleri
          </h3>
          {expandedSections.nutrition ? <ChevronUp /> : <ChevronDown />}
        </button>

        {expandedSections.nutrition && (
          <div className="px-6 pb-6 space-y-3 border-t border-slate-700">
            {result.nutrition.per_100g && (
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-slate-700">
                    <td className="py-2 text-slate-300">Enerji</td>
                    <td className="py-2 text-right font-semibold text-white">
                      {result.nutrition.per_100g.energy?.value || 0} kcal
                    </td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-2 text-slate-300">Protein</td>
                    <td className="py-2 text-right font-semibold text-white">
                      {result.nutrition.per_100g.protein?.value || 0}g
                    </td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-2 text-slate-300">Karbonhidrat</td>
                    <td className="py-2 text-right font-semibold text-white">
                      {result.nutrition.per_100g.carbohydrates?.value || 0}g
                    </td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-2 text-slate-300">Şeker</td>
                    <td className="py-2 text-right font-semibold text-red-400">
                      {result.nutrition.per_100g.sugar?.value || 0}g
                    </td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-2 text-slate-300">Yağ</td>
                    <td className="py-2 text-right font-semibold text-orange-400">
                      {result.nutrition.per_100g.fat?.value || 0}g
                    </td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-2 text-slate-300">Doymuş Yağ</td>
                    <td className="py-2 text-right font-semibold text-red-400">
                      {result.nutrition.per_100g.saturated_fat?.value || 0}g
                    </td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-2 text-slate-300">Lif</td>
                    <td className="py-2 text-right font-semibold text-emerald-400">
                      {result.nutrition.per_100g.fiber?.value || 0}g
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-300">Tuz</td>
                    <td className="py-2 text-right font-semibold text-red-400">
                      {result.nutrition.per_100g.salt?.value || 0}g
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* İçerikler */}
      <div className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700">
        <button
          onClick={() => toggleSection('ingredients')}
          className="w-full p-6 flex items-center justify-between hover:bg-slate-700/50 transition"
        >
          <h3 className="font-bold text-white flex items-center gap-2">
            🔬 İçerikler ({result.ingredients?.count || 0})
          </h3>
          {expandedSections.ingredients ? <ChevronUp /> : <ChevronDown />}
        </button>

        {expandedSections.ingredients && (
          <div className="px-6 pb-6 space-y-3 border-t border-slate-700">
            {result.ingredients?.raw_text && (
              <p className="text-sm text-slate-300">{result.ingredients.raw_text}</p>
            )}

            {result.ingredients?.additives_list?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Katkı Maddeleri:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.ingredients.additives_list.map((code, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-semibold"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hassasiyet Uyarıları */}
      {result.sensitivity_alerts?.length > 0 && (
        <div className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700">
          <button
            onClick={() => toggleSection('sensitivity')}
            className="w-full p-6 flex items-center justify-between hover:bg-slate-700/50 transition"
          >
            <h3 className="font-bold text-white flex items-center gap-2">
              ⚠️ Uyarılar ({result.sensitivity_alerts.length})
            </h3>
            {expandedSections.sensitivity ? <ChevronUp /> : <ChevronDown />}
          </button>

          {expandedSections.sensitivity && (
            <div className="px-6 pb-6 space-y-3 border-t border-slate-700">
              {result.sensitivity_alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border-l-4 ${
                    alert.severity === 'danger'
                      ? 'bg-red-500/10 border-red-500 text-red-300'
                      : alert.severity === 'warning'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-2">
                    <span>{alert.icon}</span>
                    {alert.title}
                  </div>
                  <p className="text-sm mt-1">{alert.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Kişisel Analiz */}
      {result.personal_analysis && (
        <div className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700">
          <button
            onClick={() => toggleSection('personal')}
            className="w-full p-6 flex items-center justify-between hover:bg-slate-700/50 transition"
          >
            <h3 className="font-bold text-white flex items-center gap-2">
              👤 Senin İçin
            </h3>
            {expandedSections.personal ? <ChevronUp /> : <ChevronDown />}
          </button>

          {expandedSections.personal && (
            <div className="px-6 pb-6 space-y-4 border-t border-slate-700">
              <p className="text-slate-300">{result.personal_analysis.summary}</p>

              {result.personal_analysis.benefits?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-emerald-400 flex items-center gap-2 mb-2">
                    <Check size={18} /> Faydaları
                  </h4>
                  <ul className="space-y-1">
                    {result.personal_analysis.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex gap-2">
                        <span>✓</span> {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.personal_analysis.concerns?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-400 flex items-center gap-2 mb-2">
                    <AlertCircle size={18} /> Endişeler
                  </h4>
                  <ul className="space-y-1">
                    {result.personal_analysis.concerns.map((concern, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex gap-2">
                        <span>⚠️</span> {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.personal_analysis.recommendations?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-teal-400 flex items-center gap-2 mb-2">
                    <Lightbulb size={18} /> Öneriler
                  </h4>
                  <ul className="space-y-1">
                    {result.personal_analysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex gap-2">
                        <span>💡</span> {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Alternatifler */}
      {result.alternatives?.length > 0 && (
        <div className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700">
          <button
            onClick={() => toggleSection('alternatives')}
            className="w-full p-6 flex items-center justify-between hover:bg-slate-700/50 transition"
          >
            <h3 className="font-bold text-white flex items-center gap-2">
              🔄 Daha Sağlıklı Alternatifler
            </h3>
            {expandedSections.alternatives ? <ChevronUp /> : <ChevronDown />}
          </button>

          {expandedSections.alternatives && (
            <div className="px-6 pb-6 space-y-3 border-t border-slate-700">
              {result.alternatives.map((alt, idx) => (
                <div key={idx} className="bg-slate-700/50 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-white">{alt.name}</h4>
                      <p className="text-sm text-slate-400">{alt.brand}</p>
                    </div>
                    {alt.is_turkish && <span className="text-lg">🇹🇷</span>}
                  </div>
                  <p className="text-sm text-emerald-400 font-semibold">{alt.improvement}</p>
                  <p className="text-sm text-slate-300">{alt.key_benefit}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Geri Butonu */}
      <button
        onClick={onBack}
        className="w-full py-3 px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-semibold transition"
      >
        ← Geri
      </button>
    </div>
  );
};

export default ResultView;
