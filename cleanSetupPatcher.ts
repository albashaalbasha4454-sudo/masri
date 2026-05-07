import { applyCleanStoreSetup } from './storeCleanSetup';

function findButton(target: EventTarget | null): HTMLButtonElement | null {
  let node = target as HTMLElement | null;
  while (node && node.tagName !== 'BUTTON') node = node.parentElement;
  return node instanceof HTMLButtonElement ? node : null;
}

function ensureCleanSetupButton() {
  const containers = Array.from(document.querySelectorAll('.actions,.un-actions,.top-actions,header div')) as HTMLElement[];
  const target = containers.find(node => node.querySelector('button')) || document.querySelector('header') as HTMLElement | null;
  if (!target || document.getElementById('clean-store-setup-button')) return;

  const button = document.createElement('button');
  button.id = 'clean-store-setup-button';
  button.type = 'button';
  button.textContent = 'تهيئة نسخة محل جديدة';
  button.title = 'يصفر الفواتير والمبيعات والمصروفات والخزينة في هذا المتصفح، ويثبت الأقسام والمنتجات الأولية.';
  target.appendChild(button);
}

export function installCleanSetupPatcher() {
  if (typeof window === 'undefined') return;

  setInterval(ensureCleanSetupButton, 1000);

  document.addEventListener('click', event => {
    const button = findButton(event.target);
    if (!button) return;
    const label = button.textContent || '';
    if (button.id === 'clean-store-setup-button' || label.includes('تهيئة نسخة محل جديدة')) {
      event.preventDefault();
      event.stopPropagation();
      applyCleanStoreSetup();
    }
  }, true);
}
