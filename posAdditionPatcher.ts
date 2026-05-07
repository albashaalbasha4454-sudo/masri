function findCashierArea(): HTMLElement | null {
  const headings = Array.from(document.querySelectorAll('h1,h2,h3')) as HTMLElement[];
  const cashierHeading = headings.find(node => (node.textContent || '').includes('الكاشير') || (node.textContent || '').includes('نقطة البيع'));
  return cashierHeading?.closest('section') as HTMLElement | null;
}

type ManualAddition = { id: string; title: string; amount: number; details: string; createdAt: string };

function readAdditions(): ManualAddition[] {
  try {
    const raw = window.localStorage.getItem('cashierManualAdditions');
    return raw ? JSON.parse(raw) as ManualAddition[] : [];
  } catch {
    return [];
  }
}

function writeAdditions(items: ManualAddition[]) {
  window.localStorage.setItem('cashierManualAdditions', JSON.stringify(items));
}

function ensureAdditionBox() {
  const area = findCashierArea();
  if (!area || document.getElementById('cashier-addition-helper')) return;

  const box = document.createElement('div');
  box.id = 'cashier-addition-helper';
  box.className = 'un-panel';
  box.innerHTML = `
    <h3>إضافة تفصيلية على الفاتورة</h3>
    <p class="muted">استخدمها عندما تحتاج إضافة بند غير موجود ضمن المنتجات، مثل إضافة مايونيز أو فرق سعر أو تفصيل خاص. اكتب البيان والمبلغ والتفاصيل حتى لا يحدث التباس عند المراجعة.</p>
    <div class="form">
      <input id="cashier-add-title" placeholder="اسم الإضافة: مثال إضافة مايونيز" />
      <input id="cashier-add-amount" type="number" placeholder="المبلغ" />
      <input id="cashier-add-details" placeholder="تفاصيل الإضافة وسببها" />
      <button id="cashier-add-save" type="button">حفظ الإضافة مؤقتاً</button>
    </div>
    <div id="cashier-add-list" class="muted"></div>
  `;

  area.parentElement?.insertBefore(box, area.nextSibling);

  box.querySelector('#cashier-add-save')?.addEventListener('click', () => {
    const titleInput = box.querySelector('#cashier-add-title') as HTMLInputElement | null;
    const amountInput = box.querySelector('#cashier-add-amount') as HTMLInputElement | null;
    const detailsInput = box.querySelector('#cashier-add-details') as HTMLInputElement | null;
    const title = titleInput?.value.trim() || '';
    const amount = Number(amountInput?.value || 0);
    const details = detailsInput?.value.trim() || '';
    if (!title || !amount) {
      window.alert('اكتب اسم الإضافة والمبلغ قبل الحفظ.');
      return;
    }
    const items = readAdditions();
    items.push({ id: `add-${Date.now()}`, title, amount, details: details || 'لا توجد تفاصيل إضافية', createdAt: new Date().toISOString() });
    writeAdditions(items);
    if (titleInput) titleInput.value = '';
    if (amountInput) amountInput.value = '';
    if (detailsInput) detailsInput.value = '';
    renderAdditionList();
    window.alert('تم حفظ الإضافة مؤقتاً. راجعها عند تسجيل البيع النهائي.');
  });

  renderAdditionList();
}

function renderAdditionList() {
  const list = document.getElementById('cashier-add-list');
  if (!list) return;
  const items = readAdditions();
  if (!items.length) {
    list.innerHTML = '<p>لا توجد إضافات مؤقتة.</p>';
    return;
  }
  list.innerHTML = items.map(item => `<div class="line"><span>${item.title} - ${item.details}</span><b>${item.amount.toLocaleString('en-US')}</b><button type="button" data-delete-add="${item.id}">حذف</button></div>`).join('');
  list.querySelectorAll('[data-delete-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = (btn as HTMLElement).dataset.deleteAdd;
      writeAdditions(readAdditions().filter(item => item.id !== itemId));
      renderAdditionList();
    });
  });
}

export function installPosAdditionPatcher() {
  if (typeof window === 'undefined') return;
  setInterval(ensureAdditionBox, 1000);
}
