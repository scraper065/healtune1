import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const HEALTH_CONDITIONS = [
  { id: 'diyabet', label: 'Diyabet', icon: '🩸' },
  { id: 'hipertansiyon', label: 'Hipertansiyon (Yüksek Tansiyon)', icon: '💓' },
  { id: 'kolesterol', label: 'Kolesterol', icon: '🫀' },
  { id: 'obezite', label: 'Obezite', icon: '⚖️' },
  { id: 'glutens_duyarliligi', label: 'Gluten Duyarlılığı', icon: '🌾' },
  { id: 'laktoz_intoleransi', label: 'Laktoz İntoleransı', icon: '🥛' }
];

const SENSITIVITIES = [
  { id: 'helal', label: 'Helal Ürünler', icon: '☪️' },
  { id: 'boykot', label: 'Boykot Markaları', icon: '✊' },
  { id: 'yerli', label: 'Yerli Ürünler', icon: '🇹🇷' },
  { id: 'vegan', label: 'Vegan Ürünler', icon: '🌱' },
  { id: 'vejetaryen', label: 'Vejetaryen Ürünler', icon: '🥬' }
];

const GOALS = [
  { id: 'weight_loss', label: 'Kilo Vermek', icon: '⬇️' },
  { id: 'muscle_gain', label: 'Kas Kazanmak', icon: '💪' },
  { id: 'healthy_eating', label: 'Sağlıklı Beslenme', icon: '🥗' },
  { id: 'energy', label: 'Enerji Artırmak', icon: '⚡' }
];

const ProfileModal = ({ isOpen, onClose, profile, onSave }) => {
  const [formData, setFormData] = useState(profile || {
    diseases: [],
    allergies: [],
    sensitivities: [],
    goals: [],
    dietary_preferences: '',
    notes: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const toggleArrayItem = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700">
        {/* Başlık */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 p-6 flex items-center justify-between border-b border-slate-700 z-10">
          <h2 className="text-2xl font-bold text-white">👤 Profilim</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition"
          >
            <X size={24} className="text-slate-300" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Sağlık Durumları */}
          <section>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              🏥 Sağlık Durumum
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {HEALTH_CONDITIONS.map(condition => (
                <label
                  key={condition.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={formData.diseases?.includes(condition.id)}
                    onChange={() => toggleArrayItem('diseases', condition.id)}
                    className="w-5 h-5 rounded accent-teal-500"
                  />
                  <span className="text-lg">{condition.icon}</span>
                  <span className="text-white">{condition.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Hassasiyetler */}
          <section>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              ✨ Hassasiyetlerim
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {SENSITIVITIES.map(sensitivity => (
                <label
                  key={sensitivity.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={formData.sensitivities?.includes(sensitivity.id)}
                    onChange={() => toggleArrayItem('sensitivities', sensitivity.id)}
                    className="w-5 h-5 rounded accent-teal-500"
                  />
                  <span className="text-lg">{sensitivity.icon}</span>
                  <span className="text-white">{sensitivity.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Hedefler */}
          <section>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              🎯 Hedeflerim
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {GOALS.map(goal => (
                <label
                  key={goal.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={formData.goals?.includes(goal.id)}
                    onChange={() => toggleArrayItem('goals', goal.id)}
                    className="w-5 h-5 rounded accent-teal-500"
                  />
                  <span className="text-lg">{goal.icon}</span>
                  <span className="text-white">{goal.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Notlar */}
          <section>
            <h3 className="text-lg font-bold text-white mb-4">📝 Notlar</h3>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Beslenme tercihleri veya diğer notlarınız..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows="4"
            />
          </section>

          {/* Butonlar */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-semibold transition"
            >
              ✕ İptal
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-2xl font-bold transition transform hover:scale-105"
            >
              ✓ Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
