// Open Food Facts API Entegrasyonu
// Ücretsiz ve açık kaynak gıda veritabanı

const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v2';

// Barkod ile ürün ara
export const fetchProductByBarcode = async (barcode) => {
  try {
    const response = await fetch(`${OFF_API_BASE}/product/${barcode}.json`, {
      headers: {
        'User-Agent': 'GidaX/4.0 (https://gidax.app; contact@gidax.app)'
      }
    });
    
    if (!response.ok) {
      return { success: false, error: 'API hatası' };
    }
    
    const data = await response.json();
    
    if (data.status !== 1 || !data.product) {
      return { success: false, error: 'Ürün bulunamadı' };
    }
    
    const p = data.product;
    
    // Besin değerlerini normalize et
    const nutrition = {
      energy: parseFloat(p.nutriments?.['energy-kcal_100g']) || parseFloat(p.nutriments?.energy_100g) / 4.184 || 0,
      protein: parseFloat(p.nutriments?.proteins_100g) || 0,
      carbohydrates: parseFloat(p.nutriments?.carbohydrates_100g) || 0,
      sugar: parseFloat(p.nutriments?.sugars_100g) || 0,
      fat: parseFloat(p.nutriments?.fat_100g) || 0,
      saturated_fat: parseFloat(p.nutriments?.['saturated-fat_100g']) || 0,
      fiber: parseFloat(p.nutriments?.fiber_100g) || 0,
      salt: parseFloat(p.nutriments?.salt_100g) || 0,
      sodium: parseFloat(p.nutriments?.sodium_100g) || 0
    };
    
    // E-kodları çıkar
    const additives = (p.additives_tags || []).map(tag => 
      tag.replace('en:', '').toUpperCase()
    );
    
    // Alerjen bilgisi
    const allergens = (p.allergens_tags || []).map(tag => 
      tag.replace('en:', '')
    );
    
    return {
      success: true,
      product: {
        name: p.product_name_tr || p.product_name || 'Bilinmiyor',
        brand: p.brands || 'Bilinmiyor',
        category: p.categories_tags?.[0]?.replace('en:', '') || 'Genel',
        barcode: barcode,
        image_url: p.image_front_url || p.image_url || null,
        serving_size: p.serving_size || '100g',
        quantity: p.quantity || ''
      },
      nutrition,
      ingredients: {
        raw_text: p.ingredients_text_tr || p.ingredients_text || '',
        additives_list: additives,
        allergens: allergens
      },
      scores: {
        nutri_score: p.nutriscore_grade?.toUpperCase() || null,
        nova_group: parseInt(p.nova_group) || 3,
        eco_score: p.ecoscore_grade || null
      },
      source: 'openfoodfacts',
      raw: p
    };
  } catch (error) {
    console.error('Open Food Facts API hatası:', error);
    return { success: false, error: error.message };
  }
};

// İsim ile ürün ara
export const searchProductByName = async (query, page = 1) => {
  try {
    const response = await fetch(
      `${OFF_API_BASE}/search?search_terms=${encodeURIComponent(query)}&countries_tags=turkey&page=${page}&page_size=10&json=1`,
      {
        headers: {
          'User-Agent': 'GidaX/4.0 (https://gidax.app; contact@gidax.app)'
        }
      }
    );
    
    if (!response.ok) {
      return { success: false, error: 'API hatası', products: [] };
    }
    
    const data = await response.json();
    
    const products = (data.products || []).map(p => ({
      name: p.product_name_tr || p.product_name || 'Bilinmiyor',
      brand: p.brands || '',
      barcode: p.code,
      image_url: p.image_front_small_url || null,
      nutri_score: p.nutriscore_grade?.toUpperCase() || null,
      nova_group: parseInt(p.nova_group) || null
    }));
    
    return {
      success: true,
      products,
      total: data.count || 0,
      page: data.page || 1
    };
  } catch (error) {
    console.error('Arama hatası:', error);
    return { success: false, error: error.message, products: [] };
  }
};
