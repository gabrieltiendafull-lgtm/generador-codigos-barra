# Generador de Códigos de Barra para Impresión en Hojas A4

Aplicación web profesional para crear, personalizar e imprimir códigos de barra en hojas de papel tamaño **A4**. Diseñada especialmente para comercios, depósitos, inventarios y etiquetado de productos.

---

## 🚀 Cómo Usarlo

Tienes dos formas muy sencillas de abrir y usar la aplicación:

### Opción 1: Abrir directamente el archivo (Sin instalar nada extra)
1. Ve a la carpeta del proyecto:
   `C:\Users\Usuario\.gemini\antigravity\scratch\generador-codigos-barra`
2. Haz doble clic en el archivo **`index.html`**.
3. Se abrirá en tu navegador web preferido (Google Chrome, Microsoft Edge, Firefox, Brave, etc.). ¡Funciona 100% offline!

### Opción 2: Usar el servidor local
El servidor ya se encuentra activo en tu computadora. Puedes abrir directamente en tu navegador:
👉 **[http://localhost:3000](http://localhost:3000)**

Para iniciarlo manualmente en cualquier momento desde una terminal:
```bash
node server.js
```

---

## ✨ Características Principales

1. **Información Completa en Cada Etiqueta**:
   - **Nombre del producto** (destacado en negrita).
   - **Características / Detalle** (talle, color, presentación, precio, mililitros, gramos, etc.).
   - **Código de barras vectorial (SVG)** de alta resolución y contraste para lectura inmediata con pistola láser o escáner óptico.
   - **Número o código legible** debajo de las barras.
   - **Dato adicional opcional** (fecha de vencimiento, lote, SKU, origen).

2. **Carga de Múltiples Productos**:
   - Agrega productos uno por uno con cantidad de etiquetas personalizadas (ej: 12 de un producto, 6 de otro, 24 de otro).
   - Botón **"🎲"** para generar códigos de barra aleatorios válidos si no tienes códigos previos.
   - Botón **"Carga Masiva"**: Pega listas completas copiadas de Excel o texto con formato:
     `Nombre | Características | Código | Cantidad`
   - Gestión interactiva: sumar/restar copias con botones `+` y `-`, editar, duplicar o eliminar.
   - Guardado automático en tu navegador (`localStorage`): no perderás tus productos al cerrar o recargar.

3. **Optimizado para Impresión en Hoja A4**:
   - Vista previa en tiempo real que simula hojas físicas A4 con paginación automática (`Página A4 #1`, `Página A4 #2`, etc.).
   - **Plantillas preconfiguradas**:
     - **3 × 8 (24 etiquetas por hoja)**: Estándar para hojas adhesivas comerciales (Avery/Apli).
     - **4 × 10 (40 etiquetas por hoja)**: Etiquetas compactas para artículos pequeños.
     - **3 × 7 (21 etiquetas por hoja)**.
     - **2 × 5 (10 etiquetas por hoja)**: Etiquetas grandes para cajas o góndolas.
     - **Personalizado**: Elige el número de columnas y alto en milímetros.
   - Opciones visuales:
     - Guías de corte (bordes sólidos o punteados con tijera).
     - Ajuste de altura y grosor de barras.
     - Alineación centrada o a la izquierda.
   - Botón directo de impresión o atajo **`Ctrl + P`**.

---

## 🖨️ Consejos para una Impresión Perfecta en A4

Al presionar **Imprimir A4** o `Ctrl + P`:
1. **Destino**: Selecciona tu impresora o "Guardar como PDF".
2. **Tamaño de papel**: Asegúrate de seleccionar **A4** (210 × 297 mm).
3. **Márgenes**: Selecciona **Predeterminado** o **Ninguno** (la página ya incluye los 8mm de margen calculados).
4. **Escala**: Deja en **100% (Predeterminada)**.
5. **Opciones adicionales**: Desmarca la casilla **"Encabezados y pies de página"** para que no aparezca la fecha ni URL del navegador en los bordes.
