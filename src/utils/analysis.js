// Sağlık Skoru Hesaplama Fonksiyonları
export const NUTRIENT_THRESHOLDS = {
  sugar: { low: 5, medium: 12.5, high: 22.5 },
  fat: { low: 3, medium: 17.5, high: 30 },
  saturated_fat: { low: 1.5, medium: 5, high: 10 },
  salt: { low: 0.3, medium: 1.5, high: 2.5 },
  fiber: { low: 3, high: 6 },
  protein: { low: 5, high: 10 }
};

export const GRADE_MAPPING = {
  A: { min: 80, color: '#22C55E', label: 'Çok Sağlıklı' },
  B: { min: 65, color: '#84CC16', label: 'Sağlıklı' },
  C: { min: 50, color: '#F59E0B', label: 'Orta' },
  D: { min: 30, color: '#F97316', label: 'Dikkatli Tüket' },
  E: { min: 0, color: '#EF4444', label: 'Kaçın' }
};

// Besin seviyesini belirle
export const getNutrientLevel = (value, nutrient) => {
  const thresholds = NUTRIENT_THRESHOLDS[nutrient];
  if (!thresholds) return 'medium';
  
  if (value <= thresholds.low) return 'low';
  if (value <= thresholds.medium) return 'medium';
  return 'high';
};

// Sağlık puanını hesapla
export const calculateHealthScore = (nutrition, nova, additives = []) => {
  let score = 70;

  // Şeker cezası
  if (nutrition.sugar >= NUTRIENT_THRESHOLDS.sugar.high) {
    score -= 15;
  } else if (nutrition.sugar >= NUTRIENT_THRESHOLDS.sugar.medium) {
    score -= 8;
  }

  // Yağ cezası
  if (nutrition.fat >= NUTRIENT_THRESHOLDS.fat.high) {
    score -= 12;
  } else if (nutrition.fat >= NUTRIENT_THRESHOLDS.fat.medium) {
    score -= 6;
  }

  // Doymuş yağ cezası
  if (nutrition.saturated_fat >= NUTRIENT_THRESHOLDS.saturated_fat.high) {
    score -= 10;
  } else if (nutrition.saturated_fat >= NUTRIENT_THRESHOLDS.saturated_fat.medium) {
    score -= 5;
  }

  // Tuz cezası
  if (nutrition.salt >= NUTRIENT_THRESHOLDS.salt.high) {
    score -= 8;
  } else if (nutrition.salt >= NUTRIENT_THRESHOLDS.salt.medium) {
    score -= 4;
  }

  // Katkı maddeleri cezası
  const additiveCount = additives?.length || 0;
  if (additiveCount > 10) {
    score -= 10;
  } else if (additiveCount > 5) {
    score -= 5;
  }

  // NOVA grubu cezası
  if (nova === 4) {
    score -= 15;
  } else if (nova === 3) {
    score -= 8;
  }

  // Pozitif bonuslar
  if (nutrition.fiber && nutrition.fiber > NUTRIENT_THRESHOLDS.fiber.high) {
    score += 5;
  }

  if (nutrition.protein && nutrition.protein > NUTRIENT_THRESHOLDS.protein.high) {
    score += 5;
  }

  if (nova === 1) {
    score += 10;
  }

  return Math.max(5, Math.min(100, Math.round(score)));
};

// Harf notunu belirle
export const getGrade = (score) => {
  for (const [grade, { min }] of Object.entries(GRADE_MAPPING)) {
    if (score >= min) return grade;
  }
  return 'E';
};

// Besin özeti oluştur
export const getNutritionSummary = (nutrition) => {
  const levels = {};
  
  ['sugar', 'fat', 'saturated_fat', 'salt'].forEach(nutrient => {
    const value = nutrition[nutrient];
    if (value !== undefined) {
      levels[nutrient] = {
        level: getNutrientLevel(value, nutrient),
        value: value,
        icon: getNutrientIcon(getNutrientLevel(value, nutrient))
      };
    }
  });

  return levels;
};

// İkon seç
export const getNutrientIcon = (level) => {
  const icons = {
    low: '🟢',
    medium: '🟡',
    high: '🔴'
  };
  return icons[level] || '⚪';
};

// NOVA Grubu belirleme
export const determineNovaGroup = (ingredients = []) => {
  // Basit kontrol - gerçek uygulamada daha detaylı
  const processedKeywords = ['şeker', 'yağ', 'tuz', 'renk', 'katkı', 'emülsifiye'];
  const hasProcessedIngredients = ingredients.some(ing => 
    processedKeywords.some(kw => ing.toLowerCase().includes(kw))
  );

  if (!hasProcessedIngredients && ingredients.length < 5) {
    return 1; // İşlenmemiş
  } else if (ingredients.length < 8) {
    return 2; // Az işlenmiş
  } else if (!hasProcessedIngredients) {
    return 3; // İşlenmiş
  }
  return 4; // Ultra işlenmiş
};

// NutriScore hesaplama (basitleştirilmiş)
export const calculateNutriScore = (score) => {
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 30) return 'D';
  return 'E';
};

// Sağlık profiline göre uygunluk hesapla
export const calculateSuitability = (nutrition, profile, additives = []) => {
  let score = 100;
  const concerns = [];
  const benefits = [];

  // Diyabet kontrolü
  if (profile?.diseases?.includes('diyabet')) {
    if (nutrition.sugar > 10) {
      score -= 30;
      concerns.push(`Yüksek şeker (${nutrition.sugar}g) - Kan şekerinizi hızla yükseltebilir`);
    } else if (nutrition.sugar > 5) {
      score -= 15;
      concerns.push(`Orta şeker (${nutrition.sugar}g) - Dikkatli tüketin`);
    }
  }

  // Hipertansiyon kontrolü
  if (profile?.diseases?.includes('hipertansiyon')) {
    if (nutrition.salt > 1) {
      score -= 25;
      concerns.push(`Yüksek tuz (${nutrition.salt}g) - Tansiyonunuzu yükseltebilir`);
    } else if (nutrition.salt > 0.5) {
      score -= 10;
      concerns.push(`Orta tuz içerir - Dikkatli tüketin`);
    }
  }

  // Kolesterol kontrolü
  if (profile?.diseases?.includes('kolesterol')) {
    if (nutrition.saturated_fat > 6) {
      score -= 20;
      concerns.push(`Yüksek doymuş yağ (${nutrition.saturated_fat}g) - Kolesterolü artırabilir`);
    } else if (nutrition.saturated_fat > 3) {
      score -= 10;
      concerns.push(`Orta doymuş yağ - Dikkatli tüketin`);
    }
  }

  // Alerjiler
  if (profile?.allergies?.length) {
    // Bu kısım detay gerektiriyor
  }

  // Faydalar
  if (nutrition.fiber > 3) {
    benefits.push(`İyi lif kaynağı (${nutrition.fiber}g)`);
  }

  if (nutrition.protein > 5) {
    benefits.push(`Protein açısından zengin (${nutrition.protein}g)`);
  }

  return {
    score: Math.max(0, score),
    concerns,
    benefits,
    suitability: score >= 70 ? 'suitable' : score >= 40 ? 'partially_suitable' : 'not_suitable'
  };
};

// Alternatif önerilerine hazır ürünler
export const suggestAlternatives = (product, profile) => {
  // Bu, gerçek uygulamada bir veritabanından gelecektir
  const alternatives = [];

  if (product.health_score < 50) {
    // Daha sağlıklı alternatif öner
    alternatives.push({
      name: 'Alternatif Ürün',
      brand: 'Sağlık Markası',
      health_score: 75,
      improvement: '+25 puan',
      key_benefit: 'Daha düşük şeker ve yağ',
      is_turkish: true
    });
  }

  return alternatives;
};
