/**
 * Panel de Administración — Heladería y Frutería Arcoíris
 *
 * Permite editar nombre, precio, categoría, descripción e imagen de cada
 * producto, agregar/eliminar productos, y guardar el catálogo en
 * localStorage (clave PRODUCTS_STORAGE_KEY, definida en products.js).
 *
 * IMPORTANTE: la contraseña de abajo es solo una barrera básica para uso
 * interno del negocio. Es visible en el código fuente y NO reemplaza un
 * sistema de autenticación real — no la uses para proteger datos sensibles.
 */
'use strict';

const ADMIN_PASSWORD = 'arcoiris2026';
const AUTH_KEY = 'arcoiris_admin_auth';
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024; // ~1.5MB: límite razonable para no saturar localStorage

const loginScreen   = document.getElementById('loginScreen');
const adminPanel     = document.getElementById('adminPanel');
const loginForm       = document.getElementById('loginForm');
const loginPassword   = document.getElementById('loginPassword');
const loginError      = document.getElementById('loginError');
const logoutBtn        = document.getElementById('logoutBtn');

const productsTableBody = document.getElementById('productsTableBody');
const addProductBtn      = document.getElementById('addProductBtn');
const saveAllBtn          = document.getElementById('saveAllBtn');
const resetDefaultsBtn    = document.getElementById('resetDefaultsBtn');
const exportJsonBtn       = document.getElementById('exportJsonBtn');
const toast                = document.getElementById('toast');

let adminProducts = [];

/* =============================================
   AUTENTICACIÓN BÁSICA
============================================= */
function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

function showPanel() {
  loginScreen.style.display = 'none';
  adminPanel.style.display  = 'block';
  adminProducts = getProducts();
  renderTable();
}

function showLogin() {
  loginScreen.style.display = 'flex';
  adminPanel.style.display  = 'none';
}

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  if (loginPassword.value === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, 'true');
    loginError.textContent = '';
    loginPassword.value = '';
    showPanel();
  } else {
    loginError.textContent = 'Contraseña incorrecta.';
  }
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem(AUTH_KEY);
  showLogin();
});

isAuthenticated() ? showPanel() : showLogin();

/* =============================================
   TOAST DE NOTIFICACIÓN
============================================= */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* =============================================
   RENDER DE LA TABLA DE PRODUCTOS
============================================= */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function rowHTML(product, index) {
  const imgSrc = resolveProductImg(product.img) || 'https://placehold.co/80x80?text=%20';
  const categoryOptions = Object.keys(CATEGORY_META).map(cat =>
    `<option value="${cat}" ${cat === product.category ? 'selected' : ''}>${CATEGORY_META[cat].emoji} ${CATEGORY_META[cat].label}</option>`
  ).join('');

  return `
    <tr data-index="${index}">
      <td class="col-img">
        <img src="${imgSrc}" alt="${escapeHtml(product.name)}" class="admin-thumb" />
        <label class="upload-btn">
          📷 Cambiar
          <input type="file" accept="image/*" class="field-img" />
        </label>
      </td>
      <td><input type="text" class="field-name" value="${escapeHtml(product.name)}" /></td>
      <td><select class="field-category">${categoryOptions}</select></td>
      <td><input type="number" class="field-price" min="0" step="500" value="${product.price}" /></td>
      <td><textarea class="field-desc" rows="2">${escapeHtml(product.desc)}</textarea></td>
      <td><label class="popular-check"><input type="checkbox" class="field-popular" ${product.popular ? 'checked' : ''} /> ⭐</label></td>
      <td><button class="btn-delete-row" title="Eliminar producto" aria-label="Eliminar producto">🗑️</button></td>
    </tr>
  `;
}

function renderTable() {
  productsTableBody.innerHTML = adminProducts.map(rowHTML).join('');
}

/* =============================================
   EDICIÓN DE CAMPOS (delegación de eventos)
============================================= */
productsTableBody.addEventListener('input', e => {
  const row = e.target.closest('tr');
  if (!row) return;
  const product = adminProducts[Number(row.dataset.index)];
  if (!product) return;

  if (e.target.classList.contains('field-name'))  product.name  = e.target.value;
  if (e.target.classList.contains('field-price')) product.price = Number(e.target.value) || 0;
  if (e.target.classList.contains('field-desc'))  product.desc  = e.target.value;
});

productsTableBody.addEventListener('change', e => {
  const row = e.target.closest('tr');
  if (!row) return;
  const product = adminProducts[Number(row.dataset.index)];
  if (!product) return;

  if (e.target.classList.contains('field-category')) {
    product.category = e.target.value;
  }

  if (e.target.classList.contains('field-popular')) {
    product.popular = e.target.checked;
  }

  if (e.target.classList.contains('field-img')) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_BYTES) {
      showToast('⚠️ Esa imagen es muy pesada (máx. ~1.5MB). Elige una más liviana.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      product.img = reader.result; // se guarda como dataURL (base64)
      row.querySelector('.admin-thumb').src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

productsTableBody.addEventListener('click', e => {
  const delBtn = e.target.closest('.btn-delete-row');
  if (!delBtn) return;
  const row = delBtn.closest('tr');
  const index = Number(row.dataset.index);
  const product = adminProducts[index];
  if (!product) return;
  if (!confirm(`¿Eliminar "${product.name}"?`)) return;
  adminProducts.splice(index, 1);
  renderTable();
});

/* =============================================
   ACCIONES DE LA BARRA DE HERRAMIENTAS
============================================= */
addProductBtn.addEventListener('click', () => {
  adminProducts.push({
    id: 'producto-' + Date.now(),
    name: 'Nuevo producto',
    desc: '',
    price: 0,
    category: 'helados',
    img: '',
    popular: false
  });
  renderTable();
  productsTableBody.lastElementChild?.querySelector('.field-name')?.focus();
});

saveAllBtn.addEventListener('click', () => {
  saveProducts(adminProducts);
  showToast('✅ Guardado. Recarga la página principal (index.html) para ver los cambios.');
});

resetDefaultsBtn.addEventListener('click', () => {
  if (!confirm('Esto borrará tus cambios guardados y volverá al catálogo original. ¿Continuar?')) return;
  localStorage.removeItem(PRODUCTS_STORAGE_KEY);
  adminProducts = getProducts();
  renderTable();
  showToast('↺ Catálogo restaurado a los valores originales.');
});

exportJsonBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(adminProducts, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'products.json';
  a.click();
  URL.revokeObjectURL(url);
});
