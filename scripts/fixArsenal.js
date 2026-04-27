const fs = require('fs');
const path = require('path');

const PRODUCTS_JSON = path.join(__dirname, '..', 'data', 'products.json');
const IMAGES_DIR = path.join(__dirname, '..', 'imagenes');

// LÃ³gica de slug UNIFICADA para que no haya 404s
function getSlug(title) {
    return title.toString().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
        .replace(/-+/g, '-');
}

async function fetchImage(url, dest) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buffer);
}

async function fix() {
    console.log('Ã°Å¸Ââ€”Ã¯Â¸Â RECONSTRUCCIÃ“N TOTAL DEL ARSENAL...');
    
    if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR);

    let products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf8'));

    for (const p of products) {
        const slug = getSlug(p.title);
        const dir = path.join(IMAGES_DIR, slug);
        const filePath = path.join(dir, 'img1.webp');

        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        // Si la imagen es un placeholder o no existe el archivo, intentamos rescatar la URL
        // Usamos el backup de emergencia para los 2 fallados
        if (p.title.includes('Asiento')) p.image = 'https://http2.mlstatic.com/D_NQ_NP_900332-MLA75591343355_042024-O.webp';
        if (p.title.includes('Balanza de Cocina')) p.image = 'https://http2.mlstatic.com/D_NQ_NP_603417-MLA71542459424_092023-O.webp';

        if (p.image && p.image.startsWith('http')) {
            try {
                process.stdout.write(`Ã°Å¸â€œÂ¥ Bajando: ${p.title.substring(0, 30).padEnd(30)} `);
                await fetchImage(p.image, filePath);
                p.image = `/imagenes/${slug}/img1.webp`;
                console.log('Ã¢Å“â€¦ OK');
            } catch (e) {
                console.log('Ã¢ÂÅ’ FALLO');
            }
        } else {
            // Si ya es local pero no existe el archivo, es un problema.
            if (!fs.existsSync(filePath)) {
               console.log(`Ã¢Å¡Â Ã¯Â¸Â Perdido: ${p.title}`);
               // Fallback a placeholder pero marcamos el error
               p.image = `https://placehold.co/600x600/131313/00FF00?text=${encodeURIComponent(p.title)}`;
            } else {
               p.image = `/imagenes/${slug}/img1.webp`;
            }
        }
    }

    fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(products, null, 2));
    console.log('\nÃ°Å¸Å¡â‚¬ Arsenal reconstruido. ReiniciÃ¡ el browser.');
}

fix();
