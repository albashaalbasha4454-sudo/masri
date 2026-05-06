const iconMap: Record<string, string> = {
  dashboard: '📊',
  analytics: '📈',
  summarize: '📋',
  point_of_sale: '🧾',
  receipt_long: '🧾',
  receipt: '🧾',
  inventory_2: '📦',
  history: '🕘',
  rule: '↩️',
  payments: '💵',
  groups: '👥',
  account_balance: '🏦',
  archive: '🗂️',
  manage_accounts: '👤',
  settings: '⚙️',
  database: '💾',
  restaurant_menu: '🍽️',
  add_shopping_cart: '🛒',
  money_off: '🏷️',
  search: '🔎',
  person_add: '👤',
  credit_card: '💳',
  shopping_bag: '🛍️',
  local_shipping: '🚚',
  event_available: '📅',
  delete_sweep: '🧹',
  help: '❔',
  close: '✕',
  logout: '🚪',
  menu: '☰',
  print: '🖨️',
  save: '💾',
  edit: '✏️',
  delete: '🗑️',
  add: '＋',
  filter_list: '🔽',
  expand_more: '⌄',
};

const textMap: Record<string, string> = {
  dashboard: 'لوحة التحكم',
  analytics: 'التقارير',
  summarize: 'الملخص المالي',
  point_of_sale: 'نقطة البيع',
  receipt_long: 'الطلبات',
  receipt: 'الفواتير',
  inventory_2: 'الأصناف',
  history: 'سجل النشاط',
  rule: 'طلبات الإرجاع',
  payments: 'المدفوعات',
  groups: 'العملاء',
  account_balance: 'الخزينة',
  archive: 'الأرشيف',
  manage_accounts: 'المستخدمون',
  settings: 'الإعدادات',
  database: 'إدارة البيانات',
  restaurant_menu: 'قائمة الطعام',
  add_shopping_cart: 'أضف للسلة',
  money_off: 'أصناف بدون سعر',
  search: 'بحث',
  person_add: 'إضافة عميل',
  credit_card: 'بطاقة',
  shopping_bag: 'سفري',
  local_shipping: 'توصيل',
  event_available: 'حجز',
  delete_sweep: 'إفراغ السلة',
  help: 'مساعدة',
  close: 'إغلاق',
  logout: 'خروج',
  menu: 'القائمة',
};

const normalize = (value: string | null | undefined) => (value || '').trim();

let installed = false;
let scheduled = false;

const patchIcons = () => {
  document.querySelectorAll<HTMLElement>('.material-symbols-outlined').forEach(el => {
    const current = normalize(el.textContent);
    const key = normalize(el.dataset.iconKey || current);
    const icon = iconMap[key];
    if (!icon) return;

    el.dataset.iconKey = key;
    el.setAttribute('aria-hidden', 'true');
    el.classList.add('app-emoji-icon');

    if (current !== icon) {
      el.textContent = icon;
    }
  });
};

const patchTextNodes = () => {
  if (!document.body) return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];

  while (walker.nextNode()) {
    nodes.push(walker.currentNode as Text);
  }

  nodes.forEach(node => {
    const key = normalize(node.nodeValue);
    const replacement = textMap[key];
    if (replacement && node.nodeValue !== replacement) {
      node.nodeValue = replacement;
    }
  });
};

const patch = () => {
  scheduled = false;
  patchIcons();
  patchTextNodes();
};

const schedulePatch = () => {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(patch);
};

export function installUiTextPatcher() {
  if (installed || typeof window === 'undefined' || typeof document === 'undefined') return;
  installed = true;

  const start = () => {
    patch();
    const observer = new MutationObserver(schedulePatch);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  };

  if (document.body) start();
  else window.addEventListener('DOMContentLoaded', start, { once: true });
}
