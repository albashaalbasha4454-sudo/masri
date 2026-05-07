function findCashierArea(): HTMLElement | null {
  const headings = Array.from(document.querySelectorAll('h1,h2,h3')) as HTMLElement[];
  const cashierHeading = headings.find(node => (node.textContent || '').includes('الكاشير') || (node.textContent || '').includes('نقطة البيع'));
  return cashierHeading?.closest('section') as HTMLElement | null;
}

type ManualAddition = {
  id: string;
  type: string;
  title: string;
  amount: number;
  details: string;
  affectsTotal: boolean;
  createdAt: string;
};

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
  box.className = 'un-panel cashier-addition-box';
  box.innerHTML = `
    <h3>إضافة دقيقة على الفاتورة</h3>
    <p class="muted">لأي حالة غير موجودة ضمن المنتجات: دبل، زيادة، بدون، إضافة خاصة، فرق سعر، أو ملاحظة لا تؤثر على السعر. لا تحفظ إضافة غامضة؛ اكتب النوع والسعر والتفاصيل.</p>
    <div class="form">
      <select id="cashier-add-type" title="نوع الإضافة">
        <option value="دبل">دبل</option>
        <option value="زيادة">زيادة</option>
        <option value="بدون">بدون</option>
        <option value="إضافة مخصصة">إضافة مخصصة</option>
        <option value="فرق سعر">فرق سعر</option>
        <option value="ملاحظة فقط">ملاحظة فقط</option>
      </select>
      <input id="cashier-add-title" placeholder="اسم الإضافة: مثال دبل جبنة / زيادة مايونيز" />
      <input id="cashier-add-amount" type="number" placeholder="السعر أو فرق السعر" />
      <input id="cashier-add-details" placeholder="تفاصيل دقيقة: على أي صنف؟ لماذا؟ لمن؟" />
      <label style="display:flex;align-items:center;gap:6px;font-weight:800">
        <input id="cashier-add-affects-total" type="checkbox" checked /> تدخل في الإجمالي
      </label>
      <button id="cashier-add-save" type="button">حفظ الإضافة</button>
    </div>
    <div class="muted" style="margin-top:8px;font-size:12px">مثال صحيح: النوع دبل، الاسم دبل جبنة، السعر 5000، التفاصيل على بيتزا وسط للفاتورة الحالية.</div>
    <div id="cashier-add-list" class="muted"></div>
  `;

  area.parentElement?.insertBefore(box, area.nextSibling);

  box.querySelector('#cashier-add-save')?.addEventListener('click', () => {
    const typeInput = box.querySelector('#cashier-add-type') as HTMLSelectElement | null;
    const titleInput = box.querySelector('#cashier-add-title') as HTMLInputElement | null;
    const amountInput = box.querySelector('#cashier-add-amount') as HTMLInputElement | null;
    const detailsInput = box.querySelector('#cashier-add-details') as HTMLInputElement | null;
    const affectsTotalInput = box.querySelector('#cashier-add-affects-total') as HTMLInputElement | null;

    const type = typeInput?.value || 'إضافة مخصصة';
    const title = titleInput?.value.trim() || '';
    const amount = Number(amountInput?.value || 0);
    const details = detailsInput?.value.trim() || '';
    const affectsTotal = Boolean(affectsTotalInput?.checked);

    if (!title) {
      window.alert('اكتب اسم الإضافة بدقة. مثال: دبل جبنة، زيادة مايونيز، بدون مخلل.');
      return;
    }
    if (affectsTotal && amount <= 0) {
      window.alert('هذه الإضافة تدخل في الإجمالي، لذلك يجب كتابة السعر أو فرق السعر.');
      return;
    }
    if (!details || details.length < 6) {
      window.alert('اكتب تفاصيل أوضح للإضافة حتى لا يحدث التباس عند المراجعة.');
      return;
    }

    const items = readAdditions();
    items.push({ id: `add-${Date.now()}`, type, title, amount, details, affectsTotal, createdAt: new Date().toISOString() });
    writeAdditions(items);

    if (titleInput) titleInput.value = '';
    if (amountInput) amountInput.value = '';
    if (detailsInput) detailsInput.value = '';
    if (affectsTotalInput) affectsTotalInput.checked = true;
    renderAdditionList();
    window.alert('تم حفظ الإضافة بدقة. راجعها قبل إغلاق الفاتورة.');
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
  const total = items.filter(item => item.affectsTotal).reduce((sum, item) => sum + item.amount, 0);
  list.innerHTML = `
    <div style="margin-top:10px;font-weight:900">إجمالي الإضافات المؤثرة على السعر: ${total.toLocaleString('en-US')}</div>
    ${items.map(item => `<div class="line"><span>${item.type} - ${item.title} - ${item.details} ${item.affectsTotal ? '' : '(ملاحظة فقط)'}</span><b>${item.amount.toLocaleString('en-US')}</b><button type="button" data-delete-add="${item.id}">حذف</button></div>`).join('')}
  `;
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
