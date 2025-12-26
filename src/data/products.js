// Örnek Türk Ürünleri
export const SAMPLE_PRODUCTS = [
  {
    id: 'biskrem',
    name: 'Biskrem',
    brand: 'Ülker',
    category: 'Atıştırmalık',
    image_url: null,
    serving_size: '36g',
    nutrition: {
      energy: 502,
      protein: 5.8,
      carbohydrates: 63,
      sugar: 28,
      fat: 25,
      saturated_fat: 12,
      fiber: 2,
      salt: 0.4
    },
    ingredients: 'Buğday unu, şeker, bitki yağı, kakao, yağsız kakao tozu, emülsifiye edici (soya lesitini), tuz, aromatik madde (vanilin)',
    additives: ['E322', 'E500'],
    nova_group: 4
  },
  {
    id: 'tadim_cekirdek',
    name: 'Ayçekirdeği Tuzlu',
    brand: 'Tadım',
    category: 'Atıştırmalık',
    image_url: null,
    serving_size: '25g',
    nutrition: {
      energy: 580,
      protein: 21,
      carbohydrates: 12,
      sugar: 2,
      fat: 51,
      saturated_fat: 5,
      fiber: 9,
      salt: 1.2
    },
    ingredients: 'Ayçekirdeği (%98), tuz',
    additives: [],
    nova_group: 1
  },
  {
    id: 'sutas_yogurt',
    name: 'Sade Yoğurt',
    brand: 'Sütaş',
    category: 'Süt Ürünü',
    image_url: null,
    serving_size: '150g',
    nutrition: {
      energy: 63,
      protein: 3.3,
      carbohydrates: 4.7,
      sugar: 4.7,
      fat: 3.5,
      saturated_fat: 2.2,
      fiber: 0,
      salt: 0.1
    },
    ingredients: 'Süt, çiğ süt, ferment kültürü',
    additives: [],
    nova_group: 1
  },
  {
    id: 'coca_cola',
    name: 'Coca-Cola',
    brand: 'Coca-Cola',
    category: 'İçecek',
    image_url: null,
    serving_size: '250ml',
    nutrition: {
      energy: 42,
      protein: 0,
      carbohydrates: 10.6,
      sugar: 10.6,
      fat: 0,
      saturated_fat: 0,
      fiber: 0,
      salt: 0
    },
    ingredients: 'Su, şeker, karbon dioksit, renk (E150d), çeşniler',
    additives: ['E150d'],
    nova_group: 4
  },
  {
    id: 'pinar_ayran',
    name: 'Ayran',
    brand: 'Pınar',
    category: 'İçecek',
    image_url: null,
    serving_size: '250ml',
    nutrition: {
      energy: 35,
      protein: 1.8,
      carbohydrates: 2.5,
      sugar: 2.5,
      fat: 1.8,
      saturated_fat: 1.2,
      fiber: 0,
      salt: 0.4
    },
    ingredients: 'Süt, su, tuz, kültürler',
    additives: [],
    nova_group: 1
  },
  {
    id: 'torku_banada',
    name: 'Banada',
    brand: 'Torku',
    category: 'Atıştırmalık',
    image_url: null,
    serving_size: '45g',
    nutrition: {
      energy: 540,
      protein: 6,
      carbohydrates: 57,
      sugar: 52,
      fat: 32,
      saturated_fat: 8,
      fiber: 2,
      salt: 0.1
    },
    ingredients: 'Buğday unu, şeker, bitki yağı, kakao, yağsız kakao tozu, emülsifiye edici (soya lesitini)',
    additives: ['E322'],
    nova_group: 4
  },
  {
    id: 'eti_ciftci_kraker',
    name: 'Çiftçi Kraker',
    brand: 'Eti',
    category: 'Atıştırmalık',
    image_url: null,
    serving_size: '30g',
    nutrition: {
      energy: 446,
      protein: 9.5,
      carbohydrates: 62,
      sugar: 0.5,
      fat: 17.5,
      saturated_fat: 4.5,
      fiber: 2,
      salt: 1.1
    },
    ingredients: 'Buğday unu, bitki yağı, tuz, maya, C vitamini',
    additives: [],
    nova_group: 3
  },
  {
    id: 'mis_cay',
    name: 'Hemşire Çay',
    brand: 'Mis',
    category: 'İçecek',
    image_url: null,
    serving_size: '200ml',
    nutrition: {
      energy: 0,
      protein: 0,
      carbohydrates: 0,
      sugar: 0,
      fat: 0,
      saturated_fat: 0,
      fiber: 0,
      salt: 0
    },
    ingredients: 'Siyah çay',
    additives: [],
    nova_group: 1
  },
  {
    id: 'icim_turkiye',
    name: 'Içim Portakal',
    brand: 'İçim',
    category: 'İçecek',
    image_url: null,
    serving_size: '200ml',
    nutrition: {
      energy: 48,
      protein: 0,
      carbohydrates: 12,
      sugar: 11,
      fat: 0,
      saturated_fat: 0,
      fiber: 0,
      salt: 0.05
    },
    ingredients: 'Portakal konsantratı, su, askorbit asit',
    additives: ['E300'],
    nova_group: 3
  },
  {
    id: 'uludag_sut',
    name: 'Uludağ Gazlı Su',
    brand: 'Uludağ',
    category: 'İçecek',
    image_url: null,
    serving_size: '250ml',
    nutrition: {
      energy: 0,
      protein: 0,
      carbohydrates: 0,
      sugar: 0,
      fat: 0,
      saturated_fat: 0,
      fiber: 0,
      salt: 0.05
    },
    ingredients: 'Su, karbon dioksit, tuzlar',
    additives: [],
    nova_group: 1
  }
];

// Ürünü ID'ye göre bul
export const getProductById = (id) => {
  return SAMPLE_PRODUCTS.find(p => p.id === id);
};

// Markaya göre ürünleri ara
export const searchByBrand = (brand) => {
  return SAMPLE_PRODUCTS.filter(p =>
    p.brand.toLowerCase().includes(brand.toLowerCase())
  );
};

// İsime göre ürünleri ara
export const searchByName = (name) => {
  return SAMPLE_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(name.toLowerCase())
  );
};

// Kategoriye göre filtrele
export const filterByCategory = (category) => {
  return SAMPLE_PRODUCTS.filter(p => p.category === category);
};

// Kategorileri getir
export const getCategories = () => {
  return [...new Set(SAMPLE_PRODUCTS.map(p => p.category))];
};

// Sağlık skoruna göre sırala
export const sortByHealthScore = (products, descending = true) => {
  // Bu, health_score hesaplandıktan sonra yapılır
  return products;
};
