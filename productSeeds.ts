import type { Product } from './types';

type ProductSeed = Pick<Product, 'id' | 'name' | 'type' | 'description' | 'category' | 'price' | 'isAvailable' | 'notes'>;

const requiredProducts: ProductSeed[] = [
  { id: 'prod-1777547123149', name: 'ساندويش بطاطا', type: 'product', description: '', category: 'قسم الفلافل', price: 10000, isAvailable: true, notes: '' },
  { id: 'prod-1777547218337', name: 'اوزي', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547245570', name: 'مندي', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547280589', name: 'رز بخاري مع دجاج عالفحم', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547299450', name: 'فريكة', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547313926', name: 'يالنجي', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547336444', name: 'كبة مقليه', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547354248', name: 'كبة مشوية', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547370535', name: 'حراق اصبعه', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547395027', name: 'صحن فرنسي', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547414530', name: 'قمحية', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547430173', name: 'فتوش', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547540899', name: 'تبولة', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547555318', name: 'متبل', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547571525', name: 'مسبحة', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547632849', name: 'كبة لبنية', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547702600', name: 'باشا وعساكره', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547745928', name: 'ششبرك', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547761767', name: 'شوربة عدس', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547773365', name: 'مسخن', type: 'product', description: '', category: 'قسم الشرقي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547800302', name: 'كباب لحم', type: 'product', description: '', category: 'قسم المشويات', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547870943', name: 'شيش', type: 'product', description: '', category: 'قسم المشويات', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547891688', name: 'جناحات', type: 'product', description: '', category: 'قسم المشويات', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547913069', name: 'وردات', type: 'product', description: '', category: 'قسم المشويات', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547962420', name: 'كباب جاج', type: 'product', description: '', category: 'قسم المشويات', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777547983622', name: 'دبوس', type: 'product', description: '', category: 'قسم المشويات', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548016046', name: 'ماريا عالفحم', type: 'product', description: '', category: 'قسم الغربي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548095139', name: 'حبة دجاج مع الرز 2.5', type: 'product', description: '', category: 'وجبات', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548175143', name: 'حبة دجاج 1 كيلو رز', type: 'product', description: '', category: 'وجبات', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548221981', name: 'ربع حبة دجاج 0.5 كيلو رز', type: 'product', description: '', category: 'وجبات', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548253878', name: 'شيش', type: 'product', description: '', category: 'قسم الغربي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548313833', name: 'فاهيتا', type: 'product', description: '', category: 'قسم الغربي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548392115', name: 'فرانشيسكو', type: 'product', description: '', category: 'قسم الغربي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548429794', name: 'دجاج مع الكاري', type: 'product', description: '', category: 'قسم الغربي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548457217', name: 'مكسيكي', type: 'product', description: '', category: 'قسم الغربي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548483219', name: 'برجر دجاج', type: 'product', description: '', category: 'قسم الغربي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548503097', name: 'برجر لحم', type: 'product', description: '', category: 'قسم الغربي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548549046', name: 'بطاطا تشيز', type: 'product', description: '', category: 'قسم الغربي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548569517', name: 'سودة دجاج', type: 'product', description: '', category: 'قسم الغربي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548591086', name: 'سوده غنم', type: 'product', description: '', category: 'قسم الغربي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548613707', name: 'ماريا عالصاج', type: 'product', description: '', category: 'قسم الغربي', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548689103', name: 'فخارة يبرق', type: 'product', description: '', category: 'طواجن', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548712077', name: 'فخارة محاشي', type: 'product', description: '', category: 'طواجن', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548772183', name: 'فخارة ابوات', type: 'product', description: '', category: 'طواجن', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548854464', name: 'لحمة بفخارة', type: 'product', description: '', category: 'طواجن', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777548904407', name: 'بطاطا بدجاج بالفخارة', type: 'product', description: '', category: 'طواجن', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777549121514', name: 'فخارتنا', type: 'product', description: '', category: 'طواجن', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777549176388', name: 'بامة بالفخارة', type: 'product', description: '', category: 'طواجن', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777549242171', name: 'ملوخية بالفخارة', type: 'product', description: 'ملوخية ناعمة', category: 'طواجن', price: 0, isAvailable: true, notes: '' },
  { id: 'prod-1777549319555', name: 'لحمة', type: 'product', description: '', category: 'الفرن', price: 2000, isAvailable: true, notes: '' },
  { id: 'prod-1777549335713', name: 'جبنه', type: 'product', description: '', category: 'الفرن', price: 2000, isAvailable: true, notes: '' },
  { id: 'prod-1777549393420', name: 'زعتر', type: 'product', description: '', category: 'الفرن', price: 2000, isAvailable: true, notes: '' },
  { id: 'prod-1777549414954', name: 'محمرة', type: 'product', description: '', category: 'الفرن', price: 2000, isAvailable: true, notes: '' },
  { id: 'prod-1777549439580', name: 'مرتديلا قشقوان', type: 'product', description: '', category: 'الفرن', price: 3000, isAvailable: true, notes: '' },
  { id: 'prod-1777549462875', name: 'محمرة قشقوان', type: 'product', description: '', category: 'الفرن', price: 3000, isAvailable: true, notes: '' },
  { id: 'prod-1777549572120', name: 'بيض بمرتديلا', type: 'product', description: '', category: 'قسم الفلافل', price: 10000, isAvailable: true, notes: '' },
  { id: 'prod-1777549634573', name: 'بيض مسلوق', type: 'product', description: '', category: 'قسم الفلافل', price: 7000, isAvailable: true, notes: '' },
  { id: 'prod-1777549666991', name: 'بيض مقلي', type: 'product', description: '', category: 'قسم الفلافل', price: 7000, isAvailable: true, notes: '' },
  { id: 'prod-1777550577601', name: 'بيتزا', type: 'product', description: '', category: 'الفرن', price: 3000, isAvailable: true, notes: '' },
  { id: 'prod-1777550599882', name: 'سنفورة', type: 'product', description: '', category: 'الفرن', price: 3000, isAvailable: true, notes: '' },
  { id: 'prod-1777550612829', name: 'سجق', type: 'product', description: '', category: 'الفرن', price: 4000, isAvailable: true, notes: '' },
  { id: 'prod-1777550632192', name: 'توشكا', type: 'product', description: '', category: 'الفرن', price: 6000, isAvailable: true, notes: '' },
  { id: 'prod-1777550650545', name: 'سبانخ', type: 'product', description: '', category: 'الفرن', price: 2000, isAvailable: true, notes: '' },
  { id: 'prod-1777550666830', name: 'كيري', type: 'product', description: '', category: 'الفرن', price: 2000, isAvailable: true, notes: '' },
  { id: 'prod-1777550682290', name: 'شوكولا', type: 'product', description: '', category: 'الفرن', price: 2000, isAvailable: true, notes: '' },
  { id: 'prod-1777550699563', name: 'شيش', type: 'product', description: '', category: 'الفرن', price: 5000, isAvailable: true, notes: '' },
  { id: 'prod-1777550729041', name: 'زيتون', type: 'product', description: '', category: 'الفرن', price: 2000, isAvailable: true, notes: '' },
  { id: 'prod-1777550964418', name: 'بيتزا عائلي', type: 'product', description: '', category: 'الفرن', price: 60000, isAvailable: true, notes: '' },
  { id: 'prod-1777550991859', name: 'بيتزا وسط', type: 'product', description: '', category: 'الفرن', price: 40000, isAvailable: true, notes: '' },
  { id: 'prod-1777551011093', name: 'بيتزا صغير', type: 'product', description: '', category: 'الفرن', price: 20000, isAvailable: true, notes: '' },
  { id: 'prod-1777551031505', name: 'محمرة ولحمة', type: 'product', description: '', category: 'الفرن', price: 3000, isAvailable: true, notes: '' },
  { id: 'prod-1777551061420', name: 'محمرة وزعتر', type: 'product', description: '', category: 'الفرن', price: 3000, isAvailable: true, notes: '' },
  { id: 'prod-1777551081756', name: 'محمرة ومرتديلا', type: 'product', description: '', category: 'الفرن', price: 4000, isAvailable: true, notes: '' },
  { id: 'prod-1777551107166', name: 'زيتون وقشقوان', type: 'product', description: '', category: 'الفرن', price: 4000, isAvailable: true, notes: '' },
  { id: 'prod-1777551272907', name: 'زعتر وقشقوان', type: 'product', description: '', category: 'الفرن', price: 3000, isAvailable: true, notes: '' },
  { id: 'prod-1777551292806', name: 'زعتر وخضار', type: 'product', description: '', category: 'الفرن', price: 3000, isAvailable: true, notes: '' },
  { id: 'prod-1777551338906', name: 'بيض ولحمة', type: 'product', description: '', category: 'الفرن', price: 6000, isAvailable: true, notes: '' },
  { id: 'prod-1777551542819', name: 'بيض مقلي مشروح', type: 'product', description: '', category: 'قسم الفلافل', price: 8000, isAvailable: true, notes: '' },
  { id: 'prod-1777551592743', name: 'بيض مقلي صمون', type: 'product', description: '', category: 'قسم الفلافل', price: 9000, isAvailable: true, notes: '' },
  { id: 'prod-1777551678268', name: 'بيض مسلوق مشروح', type: 'product', description: '', category: 'قسم الفلافل', price: 8000, isAvailable: true, notes: '' },
  { id: 'prod-1777551704801', name: 'بيض مسلوق صمون', type: 'product', description: '', category: 'قسم الفلافل', price: 9000, isAvailable: true, notes: '' },
  { id: 'prod-1777551782606', name: 'بيض بمرتديلا صمون', type: 'product', description: '', category: 'قسم الفلافل', price: 12000, isAvailable: true, notes: '' },
  { id: 'prod-1777552155640', name: 'بيض بمرتديلا مشروح', type: 'product', description: '', category: 'قسم الفلافل', price: 11000, isAvailable: true, notes: '' },
  { id: 'prod-1777552297421', name: 'فول سادة', type: 'product', description: '', category: 'قسم الفلافل', price: 16000, isAvailable: true, notes: '' },
  { id: 'prod-1777552336487', name: 'حمص سادة', type: 'product', description: '', category: 'قسم الفلافل', price: 18000, isAvailable: true, notes: '' },
  { id: 'prod-1777552359630', name: 'فول لبن', type: 'product', description: '', category: 'قسم الفلافل', price: 30000, isAvailable: true, notes: '' },
  { id: 'prod-1777552383382', name: 'حمص لبن', type: 'product', description: '', category: 'قسم الفلافل', price: 30000, isAvailable: true, notes: '' },
  { id: 'prod-1777552406242', name: 'فول بزيت', type: 'product', description: '', category: 'قسم الفلافل', price: 28000, isAvailable: true, notes: '' },
  { id: 'prod-1777552444111', name: 'فتة بسمنه', type: 'product', description: '', category: 'قسم الفلافل', price: 28000, isAvailable: true, notes: '' },
  { id: 'prod-1777552466667', name: 'حمص بزيت', type: 'product', description: '', category: 'قسم الفلافل', price: 28000, isAvailable: true, notes: '' },
  { id: 'prod-1777552517302', name: 'فتة بزيت', type: 'product', description: '', category: 'قسم الفلافل', price: 22000, isAvailable: true, notes: '' },
  { id: 'prod-1777552546919', name: 'بدوة', type: 'product', description: '', category: 'قسم الفلافل', price: 20000, isAvailable: true, notes: '' },
  { id: 'prod-1777552623387', name: 'مسبحة', type: 'product', description: '', category: 'قسم الفلافل', price: 30000, isAvailable: true, notes: '' },
  { id: 'prod-1777552641702', name: 'متبل', type: 'product', description: '', category: 'قسم الفلافل', price: 32000, isAvailable: true, notes: '' },
  { id: 'prod-1777552745645', name: 'قرص فلافل', type: 'product', description: '', category: 'قسم الفلافل', price: 500, isAvailable: true, notes: '' },
  { id: 'prod-1777552830229', name: 'مخللات 0.5 كيلو', type: 'product', description: '', category: 'قسم الفلافل', price: 11000, isAvailable: true, notes: '' },
  { id: 'prod-1777552859197', name: 'مخللات كيلو', type: 'product', description: '', category: 'قسم الفلافل', price: 22000, isAvailable: true, notes: '' },
  { id: 'prod-1777552960658', name: 'ساندويش فلافل', type: 'product', description: '', category: 'قسم الفلافل', price: 6000, isAvailable: true, notes: '' },
];

const escapeSvg = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const categoryMeta = (category?: string) => {
  const normalized = (category || '').trim();
  if (normalized.includes('فلافل')) return { emoji: '🧆', bg: '#fef3c7', fg: '#92400e' };
  if (normalized.includes('شرقي')) return { emoji: '🍲', bg: '#dcfce7', fg: '#166534' };
  if (normalized.includes('مشويات')) return { emoji: '🔥', bg: '#fee2e2', fg: '#991b1b' };
  if (normalized.includes('غربي')) return { emoji: '🍔', bg: '#dbeafe', fg: '#1e40af' };
  if (normalized.includes('وجبات')) return { emoji: '🍽️', bg: '#ede9fe', fg: '#5b21b6' };
  if (normalized.includes('طواجن')) return { emoji: '🥘', bg: '#ffedd5', fg: '#9a3412' };
  if (normalized.includes('فرن')) return { emoji: '🥐', bg: '#fef9c3', fg: '#854d0e' };
  return { emoji: '🍴', bg: '#f1f5f9', fg: '#334155' };
};

const descriptiveImage = (product: ProductSeed) => {
  const meta = categoryMeta(product.category);
  const title = escapeSvg(product.name.trim() || 'صنف').slice(0, 32);
  const subtitle = escapeSvg((product.category || 'مطابخ الشرق').trim()).slice(0, 32);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420"><rect width="640" height="420" rx="36" fill="${meta.bg}"/><circle cx="110" cy="100" r="58" fill="#fff" opacity=".55"/><circle cx="540" cy="330" r="90" fill="#fff" opacity=".5"/><text x="320" y="150" text-anchor="middle" font-size="82">${meta.emoji}</text><text x="320" y="230" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="36" font-weight="800" fill="${meta.fg}">${title}</text><text x="320" y="280" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="24" font-weight="600" fill="#475569">${subtitle}</text><text x="320" y="338" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="18" fill="#64748b">مطابخ الشرق</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

function readProducts(): Product[] {
  try {
    const raw = window.localStorage.getItem('products');
    return raw ? JSON.parse(raw) as Product[] : [];
  } catch {
    return [];
  }
}

export function seedRequiredProducts() {
  if (typeof window === 'undefined') return;

  const currentProducts = readProducts();
  const byKey = new Map(currentProducts.map(product => [`${product.name.trim().toLowerCase()}::${(product.category || '').trim().toLowerCase()}`, product]));
  let changed = false;

  requiredProducts.forEach(seed => {
    const key = `${seed.name.trim().toLowerCase()}::${(seed.category || '').trim().toLowerCase()}`;
    if (byKey.has(key)) return;
    byKey.set(key, { ...seed, image: descriptiveImage(seed), reviewStatus: seed.price > 0 ? 'ok' : 'needs_price' });
    changed = true;
  });

  if (changed) {
    window.localStorage.setItem('products', JSON.stringify(Array.from(byKey.values())));
  }
}
