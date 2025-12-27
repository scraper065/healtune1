// Alternatif ürün önerileri veritabanı
// Kategoriye göre daha sağlıklı Türk markası alternatifleri

export const alternativesDB = {
  'Atıştırmalık': [
    { name: 'Kuru Meyve Karışımı', brand: 'Tadım', healthScore: 78, benefit: 'Doğal şeker, lif kaynağı', icon: '🥜' },
    { name: 'Pirinç Patlağı', brand: 'Eti', healthScore: 72, benefit: 'Düşük kalori', icon: '🍘' },
    { name: 'Tam Tahıllı Bisküvi', brand: 'Torku', healthScore: 68, benefit: 'Yüksek lif', icon: '🍪' },
    { name: 'Kavrulmuş Nohut', brand: 'Peyman', healthScore: 82, benefit: 'Protein kaynağı', icon: '🫘' },
  ],
  'İçecek': [
    { name: 'Maden Suyu', brand: 'Uludağ', healthScore: 95, benefit: 'Sıfır kalori, mineral', icon: '💧' },
    { name: 'Ayran', brand: 'Sütaş', healthScore: 85, benefit: 'Probiyotik, protein', icon: '🥛' },
    { name: '%100 Meyve Suyu', brand: 'Dimes', healthScore: 70, benefit: 'Doğal vitamin', icon: '🧃' },
    { name: 'Yeşil Çay', brand: 'Doğadan', healthScore: 90, benefit: 'Antioksidan', icon: '🍵' },
  ],
  'Süt Ürünü': [
    { name: 'Probiyotik Yoğurt', brand: 'Activia', healthScore: 88, benefit: 'Sindirim sağlığı', icon: '🥄' },
    { name: 'Lor Peyniri', brand: 'Sütaş', healthScore: 85, benefit: 'Düşük yağ, yüksek protein', icon: '🧀' },
    { name: 'Kefir', brand: 'Pınar', healthScore: 87, benefit: 'Probiyotik', icon: '🥛' },
    { name: 'Laktozsuz Süt', brand: 'İçim', healthScore: 82, benefit: 'Kolay sindirim', icon: '🥛' },
  ],
  'Fırın Ürünü': [
    { name: 'Çavdar Ekmeği', brand: 'Uno', healthScore: 80, benefit: 'Düşük glisemik indeks', icon: '🍞' },
    { name: 'Yulaf Ekmeği', brand: 'Untad', healthScore: 78, benefit: 'Beta glukan', icon: '🍞' },
    { name: 'Tam Buğday Lavaş', brand: 'Uno', healthScore: 75, benefit: 'Yüksek lif', icon: '🫓' },
  ],
  'Sos': [
    { name: 'Ev Yapımı Sos', brand: 'Kemal Kükrer', healthScore: 80, benefit: 'Katkısız', icon: '🫙' },
    { name: 'Zeytinyağlı Pesto', brand: 'Komili', healthScore: 75, benefit: 'Sağlıklı yağ', icon: '🫒' },
  ],
  'Et Ürünü': [
    { name: 'Hindi Füme', brand: 'Namet', healthScore: 72, benefit: 'Düşük yağ', icon: '🦃' },
    { name: 'Tavuk Göğsü', brand: 'Banvit', healthScore: 85, benefit: 'Yüksek protein', icon: '🍗' },
  ],
  'Kahvaltılık': [
    { name: 'Yulaf Ezmesi', brand: 'Quaker', healthScore: 88, benefit: 'Yavaş karbonhidrat', icon: '🥣' },
    { name: 'Tam Tahıllı Müsli', brand: 'Eti', healthScore: 75, benefit: 'Lif ve enerji', icon: '🥣' },
    { name: 'Fıstık Ezmesi', brand: 'Tadım', healthScore: 78, benefit: 'Sağlıklı yağ', icon: '🥜' },
  ],
  'Dondurma': [
    { name: 'Meyveli Frozen', brand: 'Mado', healthScore: 65, benefit: 'Daha az şeker', icon: '🍦' },
    { name: 'Yoğurtlu Dondurma', brand: 'Golf', healthScore: 60, benefit: 'Probiyotik', icon: '🍨' },
  ],
  'Çikolata': [
    { name: 'Bitter Çikolata %70', brand: 'Torku', healthScore: 65, benefit: 'Antioksidan', icon: '🍫' },
    { name: 'Hurma Topları', brand: 'Tadım', healthScore: 72, benefit: 'Doğal tatlandırıcı', icon: '🟤' },
  ],
  'Konserve': [
    { name: 'Zeytinyağlı Fasulye', brand: 'Tat', healthScore: 80, benefit: 'Protein ve lif', icon: '🫘' },
    { name: 'Ton Balığı (Su)', brand: 'Dardanel', healthScore: 82, benefit: 'Omega-3', icon: '🐟' },
  ],
  'Makarna': [
    { name: 'Tam Buğday Makarna', brand: 'Filiz', healthScore: 75, benefit: 'Yüksek lif', icon: '🍝' },
    { name: 'Kinoa Makarna', brand: 'Pastavilla', healthScore: 80, benefit: 'Glutensiz seçenek', icon: '🍝' },
  ],
  'default': [
    { name: 'Taze Meyve', brand: 'Mevsimlik', healthScore: 90, benefit: 'Vitamin ve lif', icon: '🍎' },
    { name: 'Kuruyemiş', brand: 'Tadım', healthScore: 80, benefit: 'Sağlıklı yağlar', icon: '🥜' },
    { name: 'Yoğurt', brand: 'Sütaş', healthScore: 88, benefit: 'Probiyotik', icon: '🥛' },
  ]
};

// Kategoriye göre alternatif öner
export const getAlternatives = (category, currentScore = 0) => {
  const categoryAlts = alternativesDB[category] || alternativesDB['default'];
  
  // Mevcut skordan daha yüksek olanları filtrele
  const betterAlts = categoryAlts.filter(alt => alt.healthScore > currentScore);
  
  // En az 2 öneri döndür
  if (betterAlts.length >= 2) {
    return betterAlts.slice(0, 3);
  }
  
  // Yeterli yoksa default'tan ekle
  const defaultAlts = alternativesDB['default'].filter(alt => alt.healthScore > currentScore);
  return [...betterAlts, ...defaultAlts].slice(0, 3);
};

// Boykot ürünü için Türk alternatifi öner
export const getBoycottAlternatives = (category) => {
  const turkishAlts = {
    'İçecek': [
      { name: 'Uludağ Gazoz', brand: 'Uludağ', healthScore: 35, benefit: 'Yerli üretim', icon: '🥤' },
      { name: 'Çaykur Buzlu Çay', brand: 'Çaykur', healthScore: 45, benefit: 'Yerli marka', icon: '🧊' },
    ],
    'Atıştırmalık': [
      { name: 'Ülker Çikolata', brand: 'Ülker', healthScore: 40, benefit: 'Yerli üretim', icon: '🍫' },
      { name: 'Eti Tutku', brand: 'Eti', healthScore: 42, benefit: 'Yerli marka', icon: '🍪' },
    ],
    'default': [
      { name: 'Yerli Alternatif', brand: 'Türk Markası', healthScore: 50, benefit: 'Yerli ekonomiye destek', icon: '🇹🇷' },
    ]
  };
  
  return turkishAlts[category] || turkishAlts['default'];
};
