// Hassasiyet Tanımları
export const SENSITIVITIES = {
  helal: {
    haram_codes: ['E120', 'E441', 'E542', 'E631', 'E635', 'E904', 'E920', 'E921'],
    suspicious_codes: [
      'E322', 'E422', 'E470', 'E471', 'E472a', 'E472b', 'E472c', 'E472d', 'E472e', 'E472f',
      'E473', 'E474', 'E475', 'E476', 'E477', 'E478', 'E481', 'E482', 'E483',
      'E491', 'E492', 'E493', 'E494', 'E495'
    ],
    haram_ingredients: ['domuz', 'alkol', 'şarap', 'bira', 'jelatin', 'lard', 'bacon', 'ham'],
    alerts: {
      haram: { icon: '☪️', title: 'Helal Değil', severity: 'danger' },
      suspicious: { icon: '☪️', title: 'Şüpheli İçerik', severity: 'warning' },
      halal: { icon: '☪️', title: 'Helal Uyumlu', severity: 'success' }
    }
  },

  boykot: {
    brands: [
      'coca-cola', 'cocacola', 'coke',
      'pepsi',
      'nestle', 'nescafé', 'kitkat', 'milka', 'aero', 'polo',
      'starbucks',
      'mcdonald', 'mcdonald\'s', 'mcdonalds',
      'burger king',
      'kfc',
      'pizza hut', 'pizzahut',
      'dominos', 'domino\'s',
      'unilever', 'lipton', 'magnum', 'algida', 'knorr', 'hellmann',
      'danone', 'activia',
      'kraft',
      'mondelez', 'oreo', 'pringles', 'lays', 'doritos',
      'mars', 'm&m', 'snickers', 'twix', 'milky way',
      'kellogg\'s', 'kelloggs',
      'heinz',
      'colgate',
      'johnson',
      'loreal', 'l\'oreal',
      'nivea',
      'garnier',
      'gillette',
      'pampers',
      'ariel'
    ],
    alert: { icon: '✊', title: 'Boykot Listesinde', severity: 'danger' }
  },

  yerli: {
    brands: [
      'ülker', 'ulker',
      'eti',
      'torku',
      'tadim', 'tadım',
      'peyman',
      'tat',
      'tukas', 'tukaş',
      'tamek',
      'pinar', 'pınar',
      'sutas', 'sütaş',
      'mis',
      'icim', 'içim',
      'uludag', 'uludağ',
      'erikli',
      'hayat',
      'aytac', 'aytaç',
      'namet',
      'banvit',
      'keskinoglu', 'keskinoğlu',
      'senpilič', 'şenpiliç',
      'bizim',
      'yudum',
      'komili',
      'kristal',
      'orkide',
      'sera',
      'burcu',
      'oncu', 'öncü',
      'selva',
      'filiz',
      'pastavilla',
      'uno',
      'kent',
      'dido',
      'albeni',
      'chokoprens', 'çokoprens',
      'sarelle',
      'koska',
      'mado',
      'kahve dunyasi', 'kahve dünyası',
      'eker',
      'dimes',
      'calbe', 'çalbe',
      'sütaş', 'sutas',
      'saray',
      'biskvit',
      'gibon',
      'betanin', 'betanin',
      'ingurtagida', 'ingurtağıda',
      'bestin',
      'velet',
      'beypazari', 'beypazan',
      'vimto',
      'sira', 'sıra',
      'turkuyasu', 'turkuyasu'
    ],
    alerts: {
      turkish: { icon: '🇹🇷', title: 'Yerli Üretim', severity: 'success' },
      foreign: { icon: '🌍', title: 'İthal Ürün', severity: 'warning' }
    }
  },

  vegan: {
    animal_ingredients: [
      'et', 'meat',
      'süt', 'milk', 'dairy',
      'yumurta', 'egg', 'eggs',
      'bal', 'honey',
      'jelatin', 'gelatin',
      'peynir', 'cheese',
      'tereyag', 'tereyağ', 'butter',
      'kaymak', 'cream',
      'krema',
      'tavuk', 'chicken',
      'balık', 'fish',
      'dana', 'beef',
      'kuzu', 'lamb',
      'sığır', 'cow',
      'hindi', 'turkey',
      'karides', 'shrimp',
      'midye', 'oyster',
      'laktoz', 'lactose',
      'kazein', 'casein',
      'peynir alti suyu', 'peynir altı suyu', 'whey',
      'l-cysteine',
      'casein',
      'lactalbumin',
      'lactoglobulin',
      'shellac',
      'isinglass',
      'kola',
      'beeswax',
      'carmine',
      'cochineal',
      'resinous glaze'
    ],
    alerts: {
      not_vegan: { icon: '🌱', title: 'Vegan Değil', severity: 'danger' },
      vegan: { icon: '🌱', title: 'Vegan', severity: 'success' }
    }
  },

  health_conditions: {
    diyabet: {
      concern_nutrients: ['sugar'],
      thresholds: { sugar_warn: 5, sugar_danger: 10 },
      icon: '🩸',
      messages: {
        danger: 'Yüksek şeker ({value}g). Kan şekerinizi hızla yükseltebilir.',
        warning: 'Orta düzey şeker. Porsiyona dikkat edin.'
      }
    },

    hipertansiyon: {
      concern_nutrients: ['salt', 'sodium'],
      thresholds: { salt_warn: 0.5, salt_danger: 1 },
      icon: '💓',
      messages: {
        danger: 'Yüksek tuz ({value}g). Tansiyonunuzu yükseltebilir.',
        warning: 'Orta düzey tuz. Dikkatli tüketin.'
      }
    },

    kolesterol: {
      concern_nutrients: ['saturated_fat', 'cholesterol'],
      thresholds: { saturated_fat_warn: 3, saturated_fat_danger: 6 },
      icon: '🫀',
      messages: {
        danger: 'Yüksek doymuş yağ ({value}g). Kolesterolü etkileyebilir.',
        warning: 'Doymuş yağ içerir. Dikkatli tüketin.'
      }
    },

    obezite: {
      concern_nutrients: ['energy'],
      thresholds: { energy_warn: 400, energy_danger: 600 },
      icon: '⚖️',
      messages: {
        danger: 'Yüksek kalori ({value}kcal). Kilo almaya neden olabilir.',
        warning: 'Orta kalori. Porsiyona dikkat edin.'
      }
    },

    glutens_duyarliligi: {
      concern_ingredients: ['buğday', 'wheat', 'arpacık', 'barley', 'çavdar', 'rye', 'malt', 'gluten'],
      icon: '🌾',
      messages: {
        danger: 'Gluten içeriyor! Tüketmeyin.',
        warning: 'Çapraz kontaminasyon riski.'
      }
    },

    laktoz_intoleransi: {
      concern_ingredients: ['süt', 'milk', 'laktoz', 'lactose', 'peynir', 'cheese', 'tereyağ', 'butter', 'krema', 'cream', 'yoğurt', 'yogurt', 'kazein', 'casein'],
      icon: '🥛',
      messages: {
        danger: 'Laktoz içeriyor! Tüketmeyin.',
        warning: 'Düşük laktoz. Az miktarda tüketebilirsiniz.'
      }
    }
  }
};

// Hassasiyet kontrolü yap
export const checkSensitivities = (product, userProfile) => {
  const alerts = [];

  // Helal kontrolü
  if (userProfile?.sensitivities?.includes('helal')) {
    const halal_status = checkHalal(product);
    if (halal_status !== 'halal') {
      alerts.push({
        type: 'helal',
        status: halal_status === 'haram' ? 'danger' : 'warning',
        icon: '☪️',
        title: halal_status === 'haram' ? 'Helal Değil' : 'Şüpheli İçerik',
        message: halal_status === 'haram' 
          ? 'Bu ürün haram bileşen içeriyor.' 
          : 'Bu ürün şüpheli haram bileşen içeriyor.',
        severity: halal_status === 'haram' ? 'danger' : 'warning'
      });
    }
  }

  // Boykot kontrolü
  if (userProfile?.sensitivities?.includes('boykot')) {
    if (isBycottedBrand(product.brand)) {
      alerts.push({
        type: 'boykot',
        status: 'danger',
        icon: '✊',
        title: 'Boykot Listesinde',
        message: `${product.brand} boykot listesinde yer almaktadır.`,
        severity: 'danger'
      });
    }
  }

  // Yerli kontrolü
  if (product.brand && isTurkishBrand(product.brand)) {
    alerts.push({
      type: 'yerli',
      status: 'success',
      icon: '🇹🇷',
      title: 'Yerli Üretim',
      message: `${product.brand} Türk markasıdır.`,
      severity: 'success'
    });
  }

  // Vegan kontrolü
  if (userProfile?.sensitivities?.includes('vegan')) {
    if (isVegan(product)) {
      alerts.push({
        type: 'vegan',
        status: 'success',
        icon: '🌱',
        title: 'Vegan',
        message: 'Bu ürün vegan ürünüdür.',
        severity: 'success'
      });
    } else {
      alerts.push({
        type: 'vegan',
        status: 'danger',
        icon: '🌱',
        title: 'Vegan Değil',
        message: 'Bu ürün hayvan kökenli bileşen içeriyor.',
        severity: 'danger'
      });
    }
  }

  // Hastalık uyarıları
  if (userProfile?.diseases?.length) {
    userProfile.diseases.forEach(disease => {
      const diseaseAlert = checkHealthCondition(product, disease);
      if (diseaseAlert) {
        alerts.push(diseaseAlert);
      }
    });
  }

  return alerts;
};

// Helal kontrolü
const checkHalal = (product) => {
  const text = (product.ingredients || '').toLowerCase();

  // Haram bileşenleri kontrol et
  for (const ingredient of SENSITIVITIES.helal.haram_ingredients) {
    if (text.includes(ingredient)) {
      return 'haram';
    }
  }

  // Haram kodları kontrol et
  for (const code of SENSITIVITIES.helal.haram_codes) {
    if (text.includes(code.toLowerCase())) {
      return 'haram';
    }
  }

  // Şüpheli kodları kontrol et
  for (const code of SENSITIVITIES.helal.suspicious_codes) {
    if (text.includes(code.toLowerCase())) {
      return 'şüpheli';
    }
  }

  return 'halal';
};

// Boykot edilmiş marka mı?
const isBycottedBrand = (brand) => {
  if (!brand) return false;
  const brandLower = brand.toLowerCase();
  return SENSITIVITIES.boykot.brands.some(b => brandLower.includes(b));
};

// Türk markası mı?
const isTurkishBrand = (brand) => {
  if (!brand) return false;
  const brandLower = brand.toLowerCase();
  return SENSITIVITIES.yerli.brands.some(b => brandLower.includes(b));
};

// Vegan mı?
const isVegan = (product) => {
  const text = (product.ingredients || '').toLowerCase();
  return !SENSITIVITIES.vegan.animal_ingredients.some(ingredient =>
    text.includes(ingredient)
  );
};

// Sağlık koşulu kontrolü
const checkHealthCondition = (product, disease) => {
  const condition = SENSITIVITIES.health_conditions[disease];
  if (!condition) return null;

  const nutrition = product.nutrition;
  if (!nutrition) return null;

  let message = null;
  let severity = 'warning';

  if (disease === 'diyabet' && nutrition.sugar) {
    if (nutrition.sugar > condition.thresholds.sugar_danger) {
      message = condition.messages.danger.replace('{value}', nutrition.sugar.toFixed(1));
      severity = 'danger';
    } else if (nutrition.sugar > condition.thresholds.sugar_warn) {
      message = condition.messages.warning;
      severity = 'warning';
    }
  } else if (disease === 'hipertansiyon' && nutrition.salt) {
    if (nutrition.salt > condition.thresholds.salt_danger) {
      message = condition.messages.danger.replace('{value}', nutrition.salt.toFixed(1));
      severity = 'danger';
    } else if (nutrition.salt > condition.thresholds.salt_warn) {
      message = condition.messages.warning;
      severity = 'warning';
    }
  } else if (disease === 'kolesterol' && nutrition.saturated_fat) {
    if (nutrition.saturated_fat > condition.thresholds.saturated_fat_danger) {
      message = condition.messages.danger.replace('{value}', nutrition.saturated_fat.toFixed(1));
      severity = 'danger';
    } else if (nutrition.saturated_fat > condition.thresholds.saturated_fat_warn) {
      message = condition.messages.warning;
      severity = 'warning';
    }
  }

  if (message) {
    return {
      type: disease,
      status: severity,
      icon: condition.icon,
      title: disease === 'diyabet' ? 'Diyabet Uyarısı' : 
             disease === 'hipertansiyon' ? 'Hipertansiyon Uyarısı' :
             disease === 'kolesterol' ? 'Kolesterol Uyarısı' : 'Sağlık Uyarısı',
      message: message,
      severity: severity
    };
  }

  return null;
};

// Vejetaryen kontrolü
export const isVegetarian = (product) => {
  const text = (product.ingredients || '').toLowerCase();
  const meatIngredients = ['et', 'meat', 'tavuk', 'chicken', 'balık', 'fish', 'dana', 'beef', 'kuzu', 'lamb', 'sığır', 'hindi', 'turkey'];
  return !meatIngredients.some(ingredient => text.includes(ingredient));
};

// Glutensiz mi?
export const isGlutenFree = (product) => {
  const text = (product.ingredients || '').toLowerCase();
  const glutenIngredients = ['buğday', 'wheat', 'arpacık', 'barley', 'çavdar', 'rye', 'malt', 'gluten'];
  return !glutenIngredients.some(ingredient => text.includes(ingredient));
};

// Laktoz içeriyor mu?
export const containsLactose = (product) => {
  const text = (product.ingredients || '').toLowerCase();
  const lactoseIngredients = ['laktoz', 'lactose', 'süt', 'milk', 'peynir', 'cheese', 'tereyağ', 'butter', 'krema', 'cream', 'kazein', 'casein'];
  return lactoseIngredients.some(ingredient => text.includes(ingredient));
};
