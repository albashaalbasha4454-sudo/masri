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

export function installUiTextPatcher() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const patch = () => {
    document.querySelectorAll<HTMLElement>('.material-symbols-outlined').forEach(el => {
      const key = normalize(el.dataset.iconKey || el.textContent);
      if (!key) return;
      const icon = iconMap[key];
      if (!icon) return;
      el.dataset.iconKey = key;
      el.textContent = icon;
      el.classList.add('app-emoji-icon');
    });

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);

    nodes.forEach(node => {
      const key = normalize(node.nodeValue);
      if (textMap[key]) node.nodeValue = textMap[key];
    });
  };

  const observer = new MutationObserver(() => patch());
  const start = () => {
    patch();
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  };

  if (document.body) start();
  else window.addEventListener('DOMContentLoaded', start, { once: true });
}
