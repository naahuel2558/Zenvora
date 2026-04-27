# Fitnees: Affiliate Fitness System (MELI Argentina)

> **⚠️ INSTRUCCIÓN OBLIGATORIA PARA EL ASISTENTE AI:**
> 
> Cuando el usuario agregue productos mediante Ninja Admin u otro método, se debe:
> 1. **Crear una tabla resumen** de los productos agregados dentro de los próximos 20 minutos.
> 2. **Esperar aprobación explícita** del usuario antes de subir/publicar los productos al marketplace.
> 3. Una vez aprobado, subir los productos al marketplace automáticamente.
> 
> **NUNCA publicar productos sin aprobación previa del usuario.**

Sistema modular de agentes de IA diseñado para la creación y gestión de sitios de afiliados de fitness enfocados en Mercado Libre Argentina. Optimizado para bajo consumo de tokens y escalabilidad.

## 🚀 Arquitectura del Sistema

El sistema se basa en una arquitectura de multi-agentes con roles estrictamente delimitados para evitar redundancia y maximizar la eficiencia.

### Agentes
1.  **Product Research Agent**: Encuentra tendencias en MELI AR.
2.  **Content Generator Agent**: Crea copys SEO y artículos.
3.  **Page Builder Agent**: Genera componentes HTML/CSS.
4.  **SEO Agent**: Optimiza keywords para el mercado local.
5.  **Social Media Agent**: Genera ideas para TikTok/Reels.
6.  **Affiliate Strategy Agent**: Experto en identificación de productos wellness de alto potencial para dropshipping y afiliados en ML Argentina.

## 📂 Estructura del Proyecto

- `/agents/`: Definiciones de roles y prompts core.
- `/templates/`: Bloques de construcción (Cards, Layouts, Buttons).
- `/outputs/`: Ejemplos de resultados por agente.
- `README.md`: Documentación central.

## 🛠 Workflow Recomendado

1.  **Investigación**: Ejecutar `Product Research Agent` para obtener data cruda de productos.
2.  **Contenido**: Pasar la data al `Content Generator Agent` para los copys.
3.  **SEO**: Refinar el contenido con el `SEO Agent` (keywords AR).
4.  **Construcción**: Usar el `Page Builder Agent` con los templates para la landing/post.
5.  **Promoción**: Generar ganchos con el `Social Media Agent`.

## 💎 Reglas de Oro (Token Efficiency)
- **Brevedad Extrema**: Salidas en bullet points, sin explicaciones innecesarias.
- **Reuso de Contexto**: No repetir información que ya fue procesada por otro agente.
- **Modularidad**: Cada componente de UI debe ser independiente.
- **Templates**: Usar placeholders (`{{link}}`, `{{price}}`) para evitar regenerar estructuras fijas.

## 🤖 Sistema Automático de Catálogo

Diseñamos un sistema modular para generar cards de producto automáticamente partiendo de links de Mercado Libre Argentina.

### Estructura de Automatización
- `/data/products.js`: Pegá acá tus links de afiliados.
- `/components/ProductCard.js`: Lógica de extracción (mock) y renderizado.
- `/pages/index.html`: La vista final que barre los productos.
- `styles.css`: Estilo visual centralizado.

### Cómo agregar productos
1. Abrí `data/products.js`.
2. Agregá el link de MELI al array.
3. El sistema parsea el slug del link para el título y genera la card con placeholder de imagen y precio simulado.

## 📈 Affiliate Strategy Workflow

Sistema inteligente para la expansión continua del catálogo:

1. **Generación**: Usar el `Affiliate Strategy Agent` para generar ideas de productos basadas en tendencias de wellness, ropa deportiva y calzado de alto rendimiento.
2. **Validación**: Revisar las sugerencias (minimal JSON) de forma manual o semi-automática (Categorías: Fitness, Bienestar, Suplementos, Ropa, Zapatillas).
3.  **Integración**: Agregar los productos aprobados a `products.js` (o base de datos).
4.  **Renderizado**: Los productos aparecen automáticamente en el catálogo.
5.  **Conversión**: Vincular estos productos dentro de los artículos del blog generados.

---

## 🔄 Product Auto-Update System (ML Sync)

Sistema para mantener los precios e imágenes sincronizados con Mercado Libre Argentina automáticamente.

### Cómo funciona
1. **Extracción**: El módulo `/scripts/fetchProducts.js` utiliza la **API pública de Mercado Libre** para obtener datos reales (`title`, `price`, `pictures`) a partir de la URL.
2. **Sincronización**: `/scripts/updateProducts.js` realiza un `upsert` en Supabase, evitando duplicados y actualizando la información existente.
3. **Automatización**: Se puede programar el refresco periódico usando `startAutoRefresh()`.

### Uso Manual
Para disparar una actualización desde la consola del navegador:
```javascript
import { updateProducts } from '../scripts/updateProducts.js';
const urls = ["https://articulo.mercadolibre.com.ar/..."];
updateProducts(urls, supabaseClient);
```

### Ventajas
- **Data Real**: Precios siempre actualizados al valor del mercado.
- **Sin Redundancia**: Solo se actualizan los productos indicados.
- **Escalable**: Fácil de migrar a un cron job en el servidor si fuera necesario.

## 📝 Local Blog Platform (Full-Stack)

Plataforma de blog ligera integrada con Node.js y Express para gestión de contenido local.

### Características
- **Auth**: Registro e inicio de sesión con JWT y BCrypt.
- **Data**: Almacenamiento local en `/data/users.json` y `/data/posts.json`.
- **Panel**: Dashboard premium para crear, editar y borrar artículos.
- **Permisos**: Solo los autores pueden modificar su propio contenido.

### Cómo correr el servidor
1. Instalá las dependencias (si no lo hiciste):
   ```bash
   npm install
   ```
2. Iniciá el servidor:
   ```bash
   node server.js
   ```
3. Abrí en tu navegador: `http://localhost:3000/blog.html`

### Estructura de Datos
- **Usuarios**: Se guardan con contraseñas hasheadas para máxima seguridad.
- **Posts**: Cada post incluye su autor, categoría, imágenes y contenido en Markdown.

### Escalabilidad (Roadmap)
Este sistema está diseñado para ser "plug-and-play". Para migrar a **MongoDB** o **PostgreSQL**, solo necesitás cambiar los helpers `readJSON` y `writeJSON` por llamadas a Mongoose o Sequelize en `server.js`.


---

## 🖼️ Image Download & Organization System

Sistema automatizado para descargar y organizar las imágenes de productos localmente, mejorando la velocidad de carga y permitiendo un control total sobre los activos visuales.

### Cómo funciona
1. **Detección**: Escanea `data/products.json` buscando URLs de imágenes externas.
2. **Organización**: Crea carpetas normalizadas en `/imagenes/{product-slug}/`.
3. **Descarga**: Baja las imágenes y las guarda como `img1`, `img2`, etc.
4. **Optimización**: Salta imágenes ya descargadas para ahorrar ancho de banda.

### Instrucciones de uso
Para descargar y organizar las imágenes de todo el arsenal:

```bash
node scripts/downloadImages.js
```

### Estructura de Salida
```
/imagenes/
  /creatina-star-nutrition/
    img1.webp
  /mancuerda-rusa-12kg/
    img1.jpg
```

### Optimización y Compresión
El script utiliza la extensión nativa del archivo. Para una compresión avanzada (redimensionado y WebP), se recomienda instalar `sharp`:
```bash
npm install sharp
```
*Nota: El sistema base funciona con el módulo nativo `https` para evitar dependencias externas pesadas si no se requiere compresión avanzada.*

---
*Desarrollado para máxima performance y escalabilidad.*


