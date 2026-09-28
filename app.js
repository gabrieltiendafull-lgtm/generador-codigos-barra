/**
 * APLICACIÓN GENERADORA DE CÓDIGOS DE BARRA PARA HOJAS A4
 * Desarrollado con JsBarcode y soporte nativo de impresión A4
 */

// ESTADO GLOBAL DE LA APLICACIÓN
const STATE = {
  products: [],
  settings: {
    preset: '3x8', // 3x8, 4x10, 3x7, 2x5, 2x7, custom
    customCols: 3,
    customHeight: 34,
    showName: true,
    showDesc: true,
    showCodeText: true,
    showBorders: true,
    dottedBorder: false,
    barHeight: 40,
    barWidth: 1.5,
    align: 'center'
  },
  editingId: null,
  zoom: 1
};

// PRESETS DE HOJA A4 (Columnas x Filas por página)
const GRID_PRESETS = {
  '3x8': { cols: 3, rows: 8, perPage: 24, className: 'preset-3x8' },
  '4x10': { cols: 4, rows: 10, perPage: 40, className: 'preset-4x10' },
  '3x7': { cols: 3, rows: 7, perPage: 21, className: 'preset-3x7' },
  '2x5': { cols: 2, rows: 5, perPage: 10, className: 'preset-2x5' },
  '2x7': { cols: 2, rows: 7, perPage: 14, className: 'preset-2x7' },
  'custom': { cols: 3, rows: 8, perPage: 24, className: '' }
};

// PRODUCTOS DE EJEMPLO INICIALES
const SAMPLE_PRODUCTS = [
  {
    id: 'sample-1',
    name: 'Café Tostado en Granos',
    desc: 'Colombia Supremo - 500g - $8.900',
    code: '7791234567890',
    format: 'CODE128',
    qty: 8,
    extra: 'Vto: 12/2026'
  },
  {
    id: 'sample-2',
    name: 'Aceite de Oliva Extra Virgen',
    desc: 'Primera Prensada en Frío - 500ml - $11.500',
    code: '7799876543210',
    format: 'CODE128',
    qty: 6,
    extra: 'Lote: L-204'
  },
  {
    id: 'sample-3',
    name: 'Yerba Mate Orgánica',
    desc: 'Con Palo y Hierbas Serranas - 1 Kg - $4.200',
    code: 'YERBA-ORG-1K',
    format: 'CODE128',
    qty: 6,
    extra: 'Origen: Misiones'
  },
  {
    id: 'sample-4',
    name: 'Miel Pura de Monte',
    desc: 'Floración Primavera - Frasco 500g - $5.300',
    code: 'MIEL-500G-01',
    format: 'CODE128',
    qty: 4,
    extra: '100% Natural'
  }
];

// INICIALIZACIÓN AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  setupEventListeners();
  renderAll();
  updateLiveUnitPreview();
});

// CARGA DE DATOS DESDE LOCALSTORAGE
function loadStoredData() {
  try {
    const savedProducts = localStorage.getItem('barcode_a4_products');
    const savedSettings = localStorage.getItem('barcode_a4_settings');

    if (savedProducts) {
      STATE.products = JSON.parse(savedProducts);
    } else {
      // Si es la primera vez, cargar productos de muestra
      STATE.products = [...SAMPLE_PRODUCTS];
      saveProducts();
    }

    if (savedSettings) {
      STATE.settings = { ...STATE.settings, ...JSON.parse(savedSettings) };
    }
  } catch (e) {
    console.error('Error al cargar datos locales:', e);
    STATE.products = [...SAMPLE_PRODUCTS];
  }

  syncSettingsToUI();
}

function saveProducts() {
  try {
    localStorage.setItem('barcode_a4_products', JSON.stringify(STATE.products));
  } catch (e) {
    console.error('Error al guardar productos:', e);
  }
}

function saveSettings() {
  try {
    localStorage.setItem('barcode_a4_settings', JSON.stringify(STATE.settings));
  } catch (e) {
    console.error('Error al guardar ajustes:', e);
  }
}

// SINCRONIZAR AJUSTES CON EL FORMULARIO
function syncSettingsToUI() {
  const s = STATE.settings;
  const presetEl = document.getElementById('grid-preset');
  if (presetEl) presetEl.value = s.preset;

  const customColsEl = document.getElementById('custom-cols');
  if (customColsEl) customColsEl.value = s.customCols;

  const customHeightEl = document.getElementById('custom-height');
  if (customHeightEl) customHeightEl.value = s.customHeight;

  document.getElementById('opt-show-name').checked = s.showName;
  document.getElementById('opt-show-desc').checked = s.showDesc;
  document.getElementById('opt-show-code-text').checked = s.showCodeText;
  document.getElementById('opt-show-borders').checked = s.showBorders;
  document.getElementById('opt-dotted-border').checked = s.dottedBorder;
  
  document.getElementById('opt-bar-height').value = s.barHeight;
  document.getElementById('val-bar-height').textContent = s.barHeight;
  
  document.getElementById('opt-bar-width').value = s.barWidth;
  document.getElementById('val-bar-width').textContent = s.barWidth;
  
  document.getElementById('opt-align').value = s.align;

  toggleCustomGridInputs(s.preset === 'custom');
}

function toggleCustomGridInputs(isCustom) {
  const customBox = document.getElementById('custom-grid-options');
  if (customBox) {
    customBox.classList.toggle('hidden', !isCustom);
  }
}

// CONFIGURACIÓN DE EVENT LISTENERS
function setupEventListeners() {
  // Pestañas del sidebar
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(tabId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // Formulario de Producto (Submit)
  const productForm = document.getElementById('product-form');
  productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleProductSubmit();
  });

  // Cancelar Edición
  document.getElementById('btn-cancel-edit').addEventListener('click', cancelEdit);

  // Generador de código aleatorio
  document.getElementById('btn-generate-code').addEventListener('click', () => {
    const format = document.getElementById('prod-format').value;
    const generated = generateRandomCode(format);
    document.getElementById('prod-code').value = generated;
    updateLiveUnitPreview();
  });

  // Actualización en tiempo real de la vista previa unitaria mientras escribe
  const liveInputs = ['prod-name', 'prod-desc', 'prod-code', 'prod-format', 'prod-extra'];
  liveInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateLiveUnitPreview);
      el.addEventListener('change', updateLiveUnitPreview);
    }
  });

  // Ajustes de Hoja A4 y Diseño
  document.getElementById('grid-preset').addEventListener('change', (e) => {
    STATE.settings.preset = e.target.value;
    toggleCustomGridInputs(e.target.value === 'custom');
    saveSettings();
    renderAll();
  });

  document.getElementById('custom-cols').addEventListener('input', (e) => {
    STATE.settings.customCols = parseInt(e.target.value, 10) || 3;
    saveSettings();
    renderAll();
  });

  document.getElementById('custom-height').addEventListener('input', (e) => {
    STATE.settings.customHeight = parseInt(e.target.value, 10) || 34;
    saveSettings();
    renderAll();
  });

  document.getElementById('opt-show-name').addEventListener('change', (e) => {
    STATE.settings.showName = e.target.checked;
    saveSettings();
    renderAll();
    updateLiveUnitPreview();
  });

  document.getElementById('opt-show-desc').addEventListener('change', (e) => {
    STATE.settings.showDesc = e.target.checked;
    saveSettings();
    renderAll();
    updateLiveUnitPreview();
  });

  document.getElementById('opt-show-code-text').addEventListener('change', (e) => {
    STATE.settings.showCodeText = e.target.checked;
    saveSettings();
    renderAll();
    updateLiveUnitPreview();
  });

  document.getElementById('opt-show-borders').addEventListener('change', (e) => {
    STATE.settings.showBorders = e.target.checked;
    saveSettings();
    renderAll();
  });

  document.getElementById('opt-dotted-border').addEventListener('change', (e) => {
    STATE.settings.dottedBorder = e.target.checked;
    saveSettings();
    renderAll();
  });

  document.getElementById('opt-bar-height').addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    STATE.settings.barHeight = val;
    document.getElementById('val-bar-height').textContent = val;
    saveSettings();
    renderAll();
    updateLiveUnitPreview();
  });

  document.getElementById('opt-bar-width').addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    STATE.settings.barWidth = val;
    document.getElementById('val-bar-width').textContent = val;
    saveSettings();
    renderAll();
    updateLiveUnitPreview();
  });

  document.getElementById('opt-align').addEventListener('change', (e) => {
    STATE.settings.align = e.target.value;
    saveSettings();
    renderAll();
  });

  // Botones de Impresión
  const triggerPrint = () => {
    window.print();
  };
  document.getElementById('btn-print').addEventListener('click', triggerPrint);
  document.getElementById('btn-print-secondary').addEventListener('click', triggerPrint);

  // Botón Cargar Ejemplos
  document.getElementById('btn-quick-samples').addEventListener('click', () => {
    if (confirm('¿Deseas restaurar los productos de ejemplo?')) {
      STATE.products = JSON.parse(JSON.stringify(SAMPLE_PRODUCTS));
      saveProducts();
      renderAll();
      switchTab('tab-lista');
    }
  });

  // Botón Vaciar Todo
  document.getElementById('btn-clear-all').addEventListener('click', () => {
    if (STATE.products.length === 0) return;
    if (confirm('¿Estás seguro de que deseas vaciar todos los productos?')) {
      STATE.products = [];
      saveProducts();
      renderAll();
    }
  });

  // Modal Carga Masiva
  const bulkModal = document.getElementById('modal-bulk');
  document.getElementById('btn-bulk-import-modal').addEventListener('click', () => {
    bulkModal.showModal();
  });
  document.getElementById('btn-close-bulk').addEventListener('click', () => bulkModal.close());
  document.getElementById('btn-cancel-bulk').addEventListener('click', () => bulkModal.close());
  document.getElementById('btn-process-bulk').addEventListener('click', processBulkImport);

  // Zoom Selector
  document.getElementById('zoom-selector').addEventListener('change', (e) => {
    const zoomVal = parseFloat(e.target.value);
    const container = document.getElementById('a4-pages-container');
    container.style.transform = `scale(${zoomVal})`;
  });

  // Atajo de teclado Ctrl+P
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
      // Dejamos que el navegador haga el print pero aseguramos vista actualizada
      renderAll();
    }
  });
}

// CAMBIO DE PESTAÑA PROGRAMÁTICO
function switchTab(tabId) {
  const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  if (targetBtn) targetBtn.click();
}

// GENERAR CÓDIGO ALEATORIO
function generateRandomCode(format) {
  if (format === 'EAN13') {
    // 12 dígitos aleatorios + checksum de EAN13
    let code = '779' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    return calculateEAN13(code.slice(0, 12));
  } else if (format === 'EAN8') {
    let code = '77' + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return calculateEAN8(code.slice(0, 7));
  } else if (format === 'UPC') {
    let code = '0' + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    return calculateEAN13('0' + code.slice(0, 11)).slice(1);
  } else {
    // CODE128 alfanumérico limpio
    const prefix = 'ART-';
    const num = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}${num}`;
  }
}

// CÁLCULO DE DÍGITO VERIFICADOR EAN-13
function calculateEAN13(first12) {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(first12[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return first12 + checkDigit;
}

function calculateEAN8(first7) {
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += parseInt(first7[i], 10) * (i % 2 === 0 ? 3 : 1);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return first7 + checkDigit;
}

// SUBMIT DE PRODUCTO (AGREGAR O EDITAR)
function handleProductSubmit() {
  const name = document.getElementById('prod-name').value.trim();
  const desc = document.getElementById('prod-desc').value.trim();
  let code = document.getElementById('prod-code').value.trim();
  const format = document.getElementById('prod-format').value;
  const qty = parseInt(document.getElementById('prod-qty').value, 10) || 1;
  const extra = document.getElementById('prod-extra').value.trim();

  if (!name || !desc) {
    alert('Por favor completa el nombre y las características del producto.');
    return;
  }

  if (!code) {
    code = generateRandomCode(format);
  }

  if (STATE.editingId) {
    // Modo Edición
    const index = STATE.products.findIndex(p => p.id === STATE.editingId);
    if (index !== -1) {
      STATE.products[index] = {
        ...STATE.products[index],
        name,
        desc,
        code,
        format,
        qty,
        extra
      };
    }
    cancelEdit();
  } else {
    // Modo Nuevo Producto
    const newProduct = {
      id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name,
      desc,
      code,
      format,
      qty,
      extra
    };
    STATE.products.unshift(newProduct);
  }

  saveProducts();
  renderAll();

  // Resetear formulario para el siguiente producto
  document.getElementById('product-form').reset();
  document.getElementById('prod-qty').value = '12';
  document.getElementById('prod-format').value = 'CODE128';
  document.getElementById('prod-name').focus();
  updateLiveUnitPreview();
}

// INICIAR EDICIÓN DE UN PRODUCTO
function startEdit(id) {
  const product = STATE.products.find(p => p.id === id);
  if (!product) return;

  STATE.editingId = id;
  document.getElementById('edit-id').value = id;
  document.getElementById('prod-name').value = product.name;
  document.getElementById('prod-desc').value = product.desc;
  document.getElementById('prod-code').value = product.code;
  document.getElementById('prod-format').value = product.format || 'CODE128';
  document.getElementById('prod-qty').value = product.qty;
  document.getElementById('prod-extra').value = product.extra || '';

  document.getElementById('form-title').textContent = 'Editar Producto';
  document.getElementById('btn-save-label').textContent = 'Guardar Cambios';
  document.getElementById('btn-cancel-edit').classList.remove('hidden');

  switchTab('tab-producto');
  updateLiveUnitPreview();
}

// CANCELAR EDICIÓN
function cancelEdit() {
  STATE.editingId = null;
  document.getElementById('edit-id').value = '';
  document.getElementById('form-title').textContent = 'Agregar Producto';
  document.getElementById('btn-save-label').textContent = 'Agregar Producto a la Lista';
  document.getElementById('btn-cancel-edit').classList.add('hidden');
  document.getElementById('product-form').reset();
  document.getElementById('prod-qty').value = '12';
  updateLiveUnitPreview();
}

// DUPLICAR PRODUCTO
function duplicateProduct(id) {
  const product = STATE.products.find(p => p.id === id);
  if (!product) return;

  const clone = {
    ...product,
    id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: product.name + ' (Copia)',
    code: generateRandomCode(product.format || 'CODE128')
  };

  const idx = STATE.products.findIndex(p => p.id === id);
  STATE.products.splice(idx + 1, 0, clone);
  saveProducts();
  renderAll();
}

// ELIMINAR PRODUCTO
function deleteProduct(id) {
  if (confirm('¿Eliminar este producto de la lista?')) {
    STATE.products = STATE.products.filter(p => p.id !== id);
    if (STATE.editingId === id) cancelEdit();
    saveProducts();
    renderAll();
  }
}

// MODIFICAR CANTIDAD DIRECTAMENTE
function updateProductQty(id, delta) {
  const product = STATE.products.find(p => p.id === id);
  if (!product) return;
  const newQty = (product.qty || 1) + delta;
  if (newQty <= 0) {
    deleteProduct(id);
    return;
  }
  product.qty = newQty;
  saveProducts();
  renderAll();
}

// ACTUALIZACIÓN DE LA VISTA PREVIA INDIVIDUAL (SIDEBAR)
function updateLiveUnitPreview() {
  const name = document.getElementById('prod-name').value.trim() || 'Nombre del Producto';
  const desc = document.getElementById('prod-desc').value.trim() || 'Características / Descripción';
  const code = document.getElementById('prod-code').value.trim() || '7791234567890';
  const format = document.getElementById('prod-format').value || 'CODE128';
  const extra = document.getElementById('prod-extra').value.trim();

  const nameEl = document.getElementById('prev-name');
  const descEl = document.getElementById('prev-desc');
  const extraEl = document.getElementById('prev-extra');
  const barcodeSvg = document.getElementById('prev-barcode');

  nameEl.textContent = name;
  descEl.textContent = desc;
  extraEl.textContent = extra;

  nameEl.style.display = STATE.settings.showName ? 'block' : 'none';
  descEl.style.display = STATE.settings.showDesc ? 'block' : 'none';
  extraEl.style.display = extra ? 'block' : 'none';

  renderBarcodeSafely(barcodeSvg, code, format, {
    displayValue: STATE.settings.showCodeText,
    height: STATE.settings.barHeight,
    width: STATE.settings.barWidth,
    fontSize: 13
  });
}

// RENDERIZADO SEGURO DE CÓDIGO DE BARRAS (CON FALLBACK)
function renderBarcodeSafely(svgElement, code, format, options = {}) {
  if (!svgElement) return;

  const defaultOpts = {
    format: format || 'CODE128',
    displayValue: true,
    fontSize: 12,
    margin: 4,
    textMargin: 2,
    background: '#ffffff',
    lineColor: '#000000',
    ...options
  };

  try {
    JsBarcode(svgElement, code, defaultOpts);
  } catch (err) {
    // Si falla por formato incompatible (ej: letras en EAN13), intentar fallback con CODE128
    try {
      JsBarcode(svgElement, code, {
        ...defaultOpts,
        format: 'CODE128'
      });
    } catch (e2) {
      // Si aún falla, mostrar texto de advertencia dentro del SVG
      svgElement.innerHTML = `<text x="50%" y="50%" text-anchor="middle" fill="#dc2626" font-size="11">Código inválido (${code})</text>`;
    }
  }
}

// PROCESAR CARGA MASIVA
function processBulkImport() {
  const textarea = document.getElementById('bulk-textarea');
  const text = textarea.value.trim();
  if (!text) {
    alert('Ingresa texto para importar.');
    return;
  }

  const lines = text.split('\n');
  let count = 0;

  lines.forEach(rawLine => {
    const line = rawLine.trim();
    if (!line) return;

    // Soportar delimitadores: barra vertical |, tabulación \t, o coma ,
    let parts;
    if (line.includes('|')) {
      parts = line.split('|').map(s => s.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map(s => s.trim());
    } else {
      parts = line.split(',').map(s => s.trim());
    }

    const name = parts[0] || 'Producto sin nombre';
    const desc = parts[1] || 'Sin descripción';
    let code = parts[2] || generateRandomCode('CODE128');
    let qty = parseInt(parts[3], 10) || 12;

    STATE.products.push({
      id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name,
      desc,
      code,
      format: 'CODE128',
      qty,
      extra: ''
    });
    count++;
  });

  saveProducts();
  renderAll();

  textarea.value = '';
  document.getElementById('modal-bulk').close();
  alert(`¡Se importaron ${count} productos con éxito!`);
  switchTab('tab-lista');
}

// RENDERIZADO GLOBAL (LISTA + HOJAS A4 + ESTADÍSTICAS)
function renderAll() {
  renderProductList();
  renderA4Pages();
  updateSummaryStats();
}

// RENDERIZADO DE LA LISTA EN EL TAB "LISTA"
function renderProductList() {
  const container = document.getElementById('product-items-list');
  const badgeCount = document.getElementById('badge-count');
  badgeCount.textContent = STATE.products.length;

  if (STATE.products.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        <p>No tienes productos agregados aún.</p>
        <button class="btn btn-sm btn-outline mt-2" id="btn-load-sample-empty">Cargar datos de ejemplo</button>
      </div>
    `;
    const btnSample = document.getElementById('btn-load-sample-empty');
    if (btnSample) {
      btnSample.addEventListener('click', () => {
        STATE.products = JSON.parse(JSON.stringify(SAMPLE_PRODUCTS));
        saveProducts();
        renderAll();
      });
    }
    return;
  }

  let html = '';
  STATE.products.forEach(p => {
    html += `
      <div class="product-item-card" data-id="${p.id}">
        <div class="prod-info">
          <div class="prod-title" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</div>
          <div class="prod-subtitle" title="${escapeHtml(p.desc)}">${escapeHtml(p.desc)}</div>
          <span class="prod-code-badge">${escapeHtml(p.code)}</span>
        </div>

        <div class="prod-controls">
          <div class="qty-counter">
            <button class="qty-btn" onclick="updateProductQty('${p.id}', -1)" title="Reducir cantidad">−</button>
            <span class="qty-display">${p.qty}</span>
            <button class="qty-btn" onclick="updateProductQty('${p.id}', 1)" title="Aumentar cantidad">+</button>
          </div>

          <button class="item-action-btn" onclick="startEdit('${p.id}')" title="Editar producto">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>

          <button class="item-action-btn" onclick="duplicateProduct('${p.id}')" title="Duplicar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>

          <button class="item-action-btn delete-btn" onclick="deleteProduct('${p.id}')" title="Eliminar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// RENDERIZADO DE LAS HOJAS A4 PARA IMPRESIÓN Y VISTA PREVIA
function renderA4Pages() {
  const container = document.getElementById('a4-pages-container');
  container.innerHTML = '';

  // Expandir productos según su cantidad de copias
  const allLabels = [];
  STATE.products.forEach(prod => {
    const qty = parseInt(prod.qty, 10) || 1;
    for (let i = 0; i < qty; i++) {
      allLabels.push(prod);
    }
  });

  if (allLabels.length === 0) {
    container.innerHTML = `
      <div class="a4-page" style="display: flex; justify-content: center; align-items: center; min-height: 297mm;">
        <div style="text-align: center; color: #64748b;">
          <h3>No hay etiquetas para generar</h3>
          <p style="margin-top: 8px;">Agrega productos o carga ejemplos desde el panel izquierdo.</p>
        </div>
      </div>
    `;
    return;
  }

  // Determinar cuántas etiquetas entran por página A4
  const presetKey = STATE.settings.preset;
  let labelsPerPage = 24;
  let gridClass = 'preset-3x8';
  let customStyle = '';

  if (presetKey === 'custom') {
    const cols = STATE.settings.customCols || 3;
    const minH = STATE.settings.customHeight || 34;
    // Estimación de filas que entran en ~270mm útiles de A4
    const rows = Math.max(1, Math.floor(270 / minH));
    labelsPerPage = cols * rows;
    gridClass = '';
    customStyle = `grid-template-columns: repeat(${cols}, 1fr); grid-auto-rows: minmax(${minH}mm, 1fr);`;
  } else {
    const p = GRID_PRESETS[presetKey] || GRID_PRESETS['3x8'];
    labelsPerPage = p.perPage;
    gridClass = p.className;
  }

  // Dividir el array total de etiquetas en páginas
  const totalPages = Math.ceil(allLabels.length / labelsPerPage);
  let globalBarcodeIndex = 0;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const startIdx = (pageNum - 1) * labelsPerPage;
    const endIdx = Math.min(startIdx + labelsPerPage, allLabels.length);
    const pageLabels = allLabels.slice(startIdx, endIdx);

    const pageEl = document.createElement('div');
    pageEl.className = 'a4-page';

    // Marcador visual de número de página
    const marker = document.createElement('div');
    marker.className = 'a4-page-header-marker no-print';
    marker.textContent = `Página A4 #${pageNum} de ${totalPages} (${pageLabels.length} etiquetas)`;
    pageEl.appendChild(marker);

    // Grilla contenedora de etiquetas
    const gridEl = document.createElement('div');
    gridEl.className = `a4-grid ${gridClass}`;
    if (customStyle) {
      gridEl.setAttribute('style', customStyle);
    }

    pageLabels.forEach((item) => {
      const labelEl = document.createElement('div');
      let labelClasses = 'barcode-label';
      if (STATE.settings.showBorders) labelClasses += ' with-border';
      if (STATE.settings.dottedBorder) labelClasses += ' dotted';
      if (STATE.settings.align === 'left') labelClasses += ' align-left';
      labelEl.className = labelClasses;

      // Nombre
      if (STATE.settings.showName && item.name) {
        const nameDiv = document.createElement('div');
        nameDiv.className = 'lbl-name';
        nameDiv.textContent = item.name;
        labelEl.appendChild(nameDiv);
      }

      // Características / Descripción
      if (STATE.settings.showDesc && item.desc) {
        const descDiv = document.createElement('div');
        descDiv.className = 'lbl-desc';
        descDiv.textContent = item.desc;
        labelEl.appendChild(descDiv);
      }

      // Contenedor del código de barra
      const bcWrapper = document.createElement('div');
      bcWrapper.className = 'lbl-barcode-wrapper';
      const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const uniqueSvgId = `barcode-${globalBarcodeIndex++}`;
      svgEl.id = uniqueSvgId;
      bcWrapper.appendChild(svgEl);
      labelEl.appendChild(bcWrapper);

      // Dato extra
      if (item.extra) {
        const extraDiv = document.createElement('div');
        extraDiv.className = 'lbl-extra';
        extraDiv.textContent = item.extra;
        labelEl.appendChild(extraDiv);
      }

      gridEl.appendChild(labelEl);

      // Renderizar código de barra en el SVG después de adjuntar
      setTimeout(() => {
        renderBarcodeSafely(svgEl, item.code, item.format, {
          displayValue: STATE.settings.showCodeText,
          height: STATE.settings.barHeight,
          width: STATE.settings.barWidth,
          fontSize: 12
        });
      }, 0);
    });

    pageEl.appendChild(gridEl);
    container.appendChild(pageEl);
  }
}

// ACTUALIZACIÓN DE RESUMEN Y CONTADORES
function updateSummaryStats() {
  const totalProducts = STATE.products.length;
  let totalLabels = 0;
  STATE.products.forEach(p => {
    totalLabels += (parseInt(p.qty, 10) || 0);
  });

  const presetKey = STATE.settings.preset;
  let labelsPerPage = 24;
  if (presetKey === 'custom') {
    const cols = STATE.settings.customCols || 3;
    const minH = STATE.settings.customHeight || 34;
    const rows = Math.max(1, Math.floor(270 / minH));
    labelsPerPage = cols * rows;
  } else {
    labelsPerPage = GRID_PRESETS[presetKey]?.perPage || 24;
  }

  const pagesCount = totalLabels > 0 ? Math.ceil(totalLabels / labelsPerPage) : 0;

  document.getElementById('stat-products-count').textContent = totalProducts;
  document.getElementById('stat-labels-count').textContent = totalLabels;
  document.getElementById('stat-pages-count').textContent = pagesCount;

  const previewStatsEl = document.getElementById('preview-stats');
  if (previewStatsEl) {
    previewStatsEl.textContent = `${totalLabels} etiquetas en total · ${pagesCount} hoja(s) A4`;
  }
}

// ESCAPADO BÁSICO DE HTML PARA SEGURIDAD
function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Hacer funciones disponibles globalmente para onclick inline
window.updateProductQty = updateProductQty;
window.startEdit = startEdit;
window.duplicateProduct = duplicateProduct;
window.deleteProduct = deleteProduct;
window.loadSampleProducts = () => {
  STATE.products = JSON.parse(JSON.stringify(SAMPLE_PRODUCTS));
  saveProducts();
  renderAll();
  switchTab('tab-lista');
};
