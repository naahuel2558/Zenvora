const fs = require('fs');
const path = require('path');

// Reutilizar la lÃ³gica de Ninja para normalizar y descargar
// Pero simplificado para este script de mantenimiento

const PRODUCTS_JS = path.join(__dirname, '..', 'data', 'products.js');
const PRODUCTS_JSON = path.join(__dirname, '..', 'data', 'products.json');
const IMG_DIR = path.join(__dirname, '..', 'imagenes');

function slugify(text) {
    return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
}

async function sync() {
    console.log('Ã°Å¸â€â€ž Sincronizando arsenal con DEEP SEARCH (MELI API)...');
    
    // Leer el JS
    const content = fs.readFileSync(PRODUCTS_JS, 'utf8');
    const match = content.match(/const products = (\[[\s\S]*?\]);/);
    if (!match) return console.error('Ã¢ÂÅ’ No se pudo parsear products.js');

    const rawProducts = eval(match[1]);
    const syncedProducts = [];

    for (const p of rawProducts) {
        let finalData = {
            id: p.id.toString(),
            url: p.url,
            title: p.title,
            price: p.price,
            oldPrice: "$" + (parseInt(p.price.replace(/[^0-9]/g, '')) * 1.3).toLocaleString(),
            discount: "30% OFF",
            category: p.category,
            description: p.description || p.title,
            image: p.image || null
        };

        // Si no tiene imagen, intentamos buscarla en MELI
        if (!finalData.image) {
            const idMatch = p.url.match(/MLA-?(\d+)|meli.la\/(\w+)/i);
            if (idMatch) {
                console.log(`Ã°Å¸â€Â [MELI] Buscando data para: ${p.title}...`);
                try {
                    // Si es meli.la, hay que resolver el redirect primero pero para items cortos la API suele fallar.
                    // Usaremos solo si es MLA
                    const mla = p.url.match(/MLA-?(\d+)/i);
                    if (mla) {
                        const res = await fetch(`https://api.mercadolibre.com/items/MLA${mla[1]}`);
                        if (res.ok) {
                            const ml = await res.json();
                            finalData.title = ml.title;
                            finalData.image = ml.pictures && ml.pictures.length > 0 ? ml.pictures[0].secure_url : null;
                            finalData.price = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(ml.price);
                        }
                    }
                } catch (e) {
                    console.error(`Ã¢Å¡Â Ã¯Â¸Â Error buscando ${p.title}: ${e.message}`);
                }
            }
        }

        // Slugify para el path local
        const slug = slugify(finalData.title);
        if (finalData.image) {
            finalData.image = `/imagenes/${slug}/img1.webp`;
        } else {
            finalData.image = 'https://placehold.co/600x600/0a0a0a/00FF00?text=SIN+IMAGEN';
        }

        syncedProducts.push(finalData);
    }

    fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(syncedProducts, null, 2));
    console.log(`Ã¢Å“â€¦ ${syncedProducts.length} productos procesados en products.json`);
}

sync();
