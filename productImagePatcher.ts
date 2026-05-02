import type { Product } from './types';

const clean = (value?: string) => (value || '').trim();
const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');

const palette = (category?: string) => {
  const c = clean(category);
  if (c.includes('فلافل')) return ['#fff7ed', '#9a3412', '#fed7aa', '#ea580c'];
  if (c.includes('شرقي')) return ['#f0fdf4', '#166534', '#bbf7d0', '#16a34a'];
  if (c.includes('مشويات')) return ['#fef2f2', '#991b1b', '#fecaca', '#dc2626'];
  if (c.includes('غربي')) return ['#eff6ff', '#1e40af', '#bfdbfe', '#2563eb'];
  if (c.includes('وجبات')) return ['#f5f3ff', '#5b21b6', '#ddd6fe', '#7c3aed'];
  if (c.includes('طواجن')) return ['#fff7ed', '#9a3412', '#fed7aa', '#c2410c'];
  if (c.includes('فرن')) return ['#fefce8', '#854d0e', '#fde68a', '#ca8a04'];
  return ['#f8fafc', '#334155', '#e2e8f0', '#475569'];
};

type Visual = { icon: string; badge: string; detail: string };

const visualFor = (product: Product): Visual => {
  const n = clean(product.name);
  const c = clean(product.category);

  const rules: Array<[boolean, Visual]> = [
    [n.includes('بيتزا عائلي'), { icon: '🍕🍕🍕', badge: 'بيتزا عائلي', detail: 'حجم كبير للمشاركة' }],
    [n.includes('بيتزا وسط'), { icon: '🍕🍕', badge: 'بيتزا وسط', detail: 'حجم متوسط' }],
    [n.includes('بيتزا صغير'), { icon: '🍕', badge: 'بيتزا صغير', detail: 'حجم صغير' }],
    [n.includes('بيتزا'), { icon: '🍕', badge: 'بيتزا', detail: 'معجنات فرن' }],
    [n.includes('بيض بمرتديلا صمون'), { icon: '🥚🥓🥖', badge: 'بيض بمرتديلا صمون', detail: 'بيض ومرتديلا داخل صمون' }],
    [n.includes('بيض بمرتديلا مشروح'), { icon: '🥚🥓🫓', badge: 'بيض بمرتديلا مشروح', detail: 'بيض ومرتديلا بخبز مشروح' }],
    [n.includes('بيض بمرتديلا'), { icon: '🥚🥓', badge: 'بيض بمرتديلا', detail: 'بيض مع مرتديلا' }],
    [n.includes('بيض مسلوق صمون'), { icon: '🥚🥚🥖', badge: 'بيض مسلوق صمون', detail: 'بيض مسلوق داخل صمون' }],
    [n.includes('بيض مسلوق مشروح'), { icon: '🥚🥚🫓', badge: 'بيض مسلوق مشروح', detail: 'بيض مسلوق بخبز مشروح' }],
    [n.includes('بيض مسلوق'), { icon: '🥚🥚', badge: 'بيض مسلوق', detail: 'بيض مسلوق جاهز' }],
    [n.includes('بيض مقلي صمون'), { icon: '🍳🥖', badge: 'بيض مقلي صمون', detail: 'بيض مقلي داخل صمون' }],
    [n.includes('بيض مقلي مشروح'), { icon: '🍳🫓', badge: 'بيض مقلي مشروح', detail: 'بيض مقلي بخبز مشروح' }],
    [n.includes('بيض مقلي'), { icon: '🍳', badge: 'بيض مقلي', detail: 'بيض مقلي ساخن' }],
    [n.includes('بيض ولحمة'), { icon: '🍳🥩', badge: 'بيض ولحمة', detail: 'معجنات فرن' }],
    [n.includes('ساندويش بطاطا'), { icon: '🍟🥙', badge: 'ساندويش بطاطا', detail: 'بطاطا داخل خبز' }],
    [n.includes('ساندويش فلافل'), { icon: '🧆🥙', badge: 'ساندويش فلافل', detail: 'فلافل داخل خبز' }],
    [n.includes('قرص فلافل'), { icon: '🧆', badge: 'قرص فلافل', detail: 'قطعة فلافل مفردة' }],
    [n.includes('فول لبن'), { icon: '🫘🥛', badge: 'فول لبن', detail: 'صحن فول باللبن' }],
    [n.includes('فول بزيت'), { icon: '🫘🫒', badge: 'فول بزيت', detail: 'صحن فول بزيت' }],
    [n.includes('فول'), { icon: '🫘', badge: 'فول', detail: 'صحن فول' }],
    [n.includes('حمص لبن'), { icon: '🥣🥛', badge: 'حمص لبن', detail: 'صحن حمص باللبن' }],
    [n.includes('حمص بزيت'), { icon: '🥣🫒', badge: 'حمص بزيت', detail: 'صحن حمص بزيت' }],
    [n.includes('حمص'), { icon: '🥣', badge: 'حمص', detail: 'صحن حمص' }],
    [n.includes('فتة بسمن'), { icon: '🥣🧈', badge: 'فتة بسمنة', detail: 'فتة مع سمنة' }],
    [n.includes('فتة بزيت'), { icon: '🥣🫒', badge: 'فتة بزيت', detail: 'فتة بزيت' }],
    [n.includes('مسبحة'), { icon: '🥣', badge: 'مسبحة', detail: 'مسبحة حمص' }],
    [n.includes('متبل'), { icon: '🍆🥣', badge: 'متبل', detail: 'متبل باذنجان' }],
    [n.includes('مخللات 0.5'), { icon: '🥒🫙', badge: 'مخللات نصف كيلو', detail: 'مخللات مشكلة' }],
    [n.includes('مخللات كيلو'), { icon: '🥒🫙', badge: 'مخللات كيلو', detail: 'مخللات مشكلة' }],
    [n.includes('بدوة'), { icon: '🥣🌶️', badge: 'بدوة', detail: 'صحن بدوة' }],
    [n.includes('كباب لحم'), { icon: '🥩🔥', badge: 'كباب لحم', detail: 'مشاوي لحم' }],
    [n.includes('كباب جاج'), { icon: '🍗🔥', badge: 'كباب دجاج', detail: 'مشاوي دجاج' }],
    [n.includes('جناحات'), { icon: '🍗🔥', badge: 'جناحات', detail: 'جناحات مشوية' }],
    [n.includes('دبوس'), { icon: '🍗', badge: 'دبوس', detail: 'دبوس دجاج' }],
    [n.includes('وردات'), { icon: '🥩🌹', badge: 'وردات', detail: 'قطع مشوية' }],
    [n.includes('شيش') && c.includes('فرن'), { icon: '🥐🍗', badge: 'شيش فرن', detail: 'معجنات شيش' }],
    [n.includes('شيش'), { icon: '🍢🔥', badge: 'شيش', detail: 'سيخ مشوي' }],
    [n.includes('برجر دجاج'), { icon: '🍔🍗', badge: 'برجر دجاج', detail: 'ساندويش غربي' }],
    [n.includes('برجر لحم'), { icon: '🍔🥩', badge: 'برجر لحم', detail: 'ساندويش غربي' }],
    [n.includes('فاهيتا'), { icon: '🌯🌶️', badge: 'فاهيتا', detail: 'ساندويش حار' }],
    [n.includes('فرانشيسكو'), { icon: '🥪🧀', badge: 'فرانشيسكو', detail: 'دجاج مع جبنة' }],
    [n.includes('مكسيكي'), { icon: '🌯🌶️', badge: 'مكسيكي', detail: 'نكهة حارة' }],
    [n.includes('كاري'), { icon: '🍛🍗', badge: 'دجاج بالكاري', detail: 'طبق دجاج بالكاري' }],
    [n.includes('سودة دجاج'), { icon: '🍗🍳', badge: 'سودة دجاج', detail: 'طبق غربي' }],
    [n.includes('سوده غنم'), { icon: '🥩🍳', badge: 'سودة غنم', detail: 'طبق غربي' }],
    [n.includes('بطاطا تشيز'), { icon: '🍟🧀', badge: 'بطاطا تشيز', detail: 'بطاطا مع جبنة' }],
    [n.includes('ماريا عالفحم'), { icon: '🥪🔥', badge: 'ماريا عالفحم', detail: 'ماريا مشوية' }],
    [n.includes('ماريا عالصاج'), { icon: '🥪♨️', badge: 'ماريا عالصاج', detail: 'ماريا على الصاج' }],
    [n.includes('فخارة يبرق'), { icon: '🥘🍃', badge: 'فخارة يبرق', detail: 'ورق عنب بالفخارة' }],
    [n.includes('فخارة محاشي'), { icon: '🥘🥬', badge: 'فخارة محاشي', detail: 'محاشي بالفخارة' }],
    [n.includes('فخارة ابوات'), { icon: '🥘🫘', badge: 'فخارة أبوات', detail: 'طبق فخارة' }],
    [n.includes('لحمة بفخارة'), { icon: '🥘🥩', badge: 'لحمة بفخارة', detail: 'لحم داخل فخارة' }],
    [n.includes('بطاطا بدجاج'), { icon: '🥘🍗', badge: 'بطاطا بدجاج', detail: 'فخارة دجاج وبطاطا' }],
    [n.includes('فخارتنا'), { icon: '🥘⭐', badge: 'فخارتنا', detail: 'طبق خاص' }],
    [n.includes('بامة'), { icon: '🥘🌿', badge: 'بامية بالفخارة', detail: 'خضار بالفخارة' }],
    [n.includes('ملوخية'), { icon: '🥘🌱', badge: 'ملوخية بالفخارة', detail: 'ملوخية ناعمة' }],
    [n.includes('اوزي'), { icon: '🍚🥩', badge: 'أوزي', detail: 'طبق شرقي' }],
    [n.includes('مندي'), { icon: '🍚🍗', badge: 'مندي', detail: 'رز ودجاج' }],
    [n.includes('رز بخاري'), { icon: '🍚🔥', badge: 'رز بخاري', detail: 'دجاج على الفحم' }],
    [n.includes('فريكة'), { icon: '🌾🍗', badge: 'فريكة', detail: 'طبق شرقي' }],
    [n.includes('يالنجي'), { icon: '🍃🍋', badge: 'يالنجي', detail: 'ورق عنب' }],
    [n.includes('كبة مقليه'), { icon: '🧆🔥', badge: 'كبة مقلية', detail: 'طبق شرقي' }],
    [n.includes('كبة مشوية'), { icon: '🧆🔥', badge: 'كبة مشوية', detail: 'طبق شرقي' }],
    [n.includes('كبة لبنية'), { icon: '🥣🧆', badge: 'كبة لبنية', detail: 'كبة مع لبن' }],
    [n.includes('حراق'), { icon: '🍝🌶️', badge: 'حراق اصبعه', detail: 'طبق شامي' }],
    [n.includes('قمحية'), { icon: '🌾🥣', badge: 'قمحية', detail: 'طبق قمح' }],
    [n.includes('فتوش'), { icon: '🥗🥖', badge: 'فتوش', detail: 'سلطة شرقية' }],
    [n.includes('تبولة'), { icon: '🥗🌿', badge: 'تبولة', detail: 'سلطة بقدونس' }],
    [n.includes('ششبرك'), { icon: '🥣🥟', badge: 'ششبرك', detail: 'عجين ولبن' }],
    [n.includes('شوربة عدس'), { icon: '🥣🟠', badge: 'شوربة عدس', detail: 'شوربة ساخنة' }],
    [n.includes('مسخن'), { icon: '🍗🧅', badge: 'مسخن', detail: 'دجاج وبصل' }],
    [n.includes('باشا وعساكره'), { icon: '🥣⭐', badge: 'باشا وعساكره', detail: 'طبق شامي' }],
    [n.includes('حبة دجاج مع الرز 2.5'), { icon: '🍗🍚', badge: 'حبة دجاج 2.5', detail: 'دجاج مع 2.5 كيلو رز' }],
    [n.includes('حبة دجاج 1 كيلو'), { icon: '🍗🍚', badge: 'حبة دجاج', detail: 'دجاج مع 1 كيلو رز' }],
    [n.includes('ربع حبة'), { icon: '🍗🍚', badge: 'ربع دجاج', detail: 'مع 0.5 كيلو رز' }],
    [n.includes('لحمة'), { icon: '🥐🥩', badge: 'لحمة', detail: 'معجنات فرن' }],
    [n.includes('جبنه') || n.includes('قشقوان') || n.includes('كيري'), { icon: '🥐🧀', badge: 'جبنة', detail: 'معجنات جبنة' }],
    [n.includes('زعتر'), { icon: '🥐🌿', badge: 'زعتر', detail: 'معجنات زعتر' }],
    [n.includes('محمرة'), { icon: '🥐🌶️', badge: 'محمرة', detail: 'معجنات محمرة' }],
    [n.includes('مرتديلا'), { icon: '🥐🥓', badge: 'مرتديلا', detail: 'معجنات مرتديلا' }],
    [n.includes('سجق'), { icon: '🥐🌭', badge: 'سجق', detail: 'معجنات سجق' }],
    [n.includes('توشكا'), { icon: '🥐🥩', badge: 'توشكا', detail: 'معجنات توشكا' }],
    [n.includes('سبانخ'), { icon: '🥐🍃', badge: 'سبانخ', detail: 'معجنات سبانخ' }],
    [n.includes('شوكولا'), { icon: '🥐🍫', badge: 'شوكولا', detail: 'معجنات حلوة' }],
    [n.includes('زيتون'), { icon: '🥐🫒', badge: 'زيتون', detail: 'معجنات زيتون' }],
    [n.includes('سنفورة'), { icon: '🥐⭐', badge: 'سنفورة', detail: 'صنف فرن خاص' }],
  ];

  return rules.find(([matches]) => matches)?.[1] || {
    icon: c.includes('فرن') ? '🥐' : c.includes('فلافل') ? '🧆' : c.includes('مشويات') ? '🔥' : c.includes('طواجن') ? '🥘' : c.includes('غربي') ? '🍔' : '🍽️',
    badge: n.slice(0, 20) || 'صنف',
    detail: c || 'مطابخ الشرق',
  };
};

const makeImage = (product: Product) => {
  const [bg, fg, soft, accent] = palette(product.category);
  const v = visualFor(product);
  const title = esc(clean(product.name).slice(0, 36));
  const badge = esc(v.badge.slice(0, 28));
  const detail = esc(v.detail.slice(0, 38));
  const category = esc(clean(product.category || 'مطابخ الشرق').slice(0, 32));
  const price = Number(product.price || 0) > 0 ? `${Number(product.price).toLocaleString('en-US')} ل.س` : 'السعر يحدد لاحقاً';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="480" viewBox="0 0 720 480"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#fff"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#0f172a" flood-opacity="0.16"/></filter></defs><rect width="720" height="480" rx="42" fill="url(#g)"/><circle cx="90" cy="95" r="72" fill="${soft}" opacity=".7"/><circle cx="640" cy="405" r="120" fill="${soft}" opacity=".55"/><rect x="72" y="58" width="576" height="364" rx="38" fill="#ffffff" opacity=".82" filter="url(#shadow)"/><text x="360" y="150" text-anchor="middle" font-size="86">${v.icon}</text><rect x="190" y="184" width="340" height="50" rx="25" fill="${soft}"/><text x="360" y="217" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="23" font-weight="900" fill="${fg}">${badge}</text><text x="360" y="279" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="34" font-weight="900" fill="${fg}">${title}</text><text x="360" y="322" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="22" font-weight="700" fill="#475569">${detail}</text><text x="360" y="358" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="18" font-weight="800" fill="${accent}">${price}</text><text x="104" y="398" text-anchor="start" font-family="Tahoma,Arial,sans-serif" font-size="16" font-weight="800" fill="#64748b">${category}</text><text x="616" y="398" text-anchor="end" font-family="Tahoma,Arial,sans-serif" font-size="16" font-weight="900" fill="#64748b">مطابخ الشرق</text></svg>`;
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

export function applyUniqueProductImages() {
  if (typeof window === 'undefined') return;
  const products = readProducts();
  if (!products.length) return;
  const patched = products.map(product => ({ ...product, image: makeImage(product), notes: product.notes || '' }));
  window.localStorage.setItem('products', JSON.stringify(patched));
}
