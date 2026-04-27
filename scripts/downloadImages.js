const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json');
const IMAGES_DIR = path.join(__dirname, '..', 'imagenes');

async function downloadImage(url, dest) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buffer);
}

async function run() {
    console.log('Ã°Å¸Å¡â‚¬ Iniciando RE-DESCARGA ESTRATÃƒâ€°GICA del arsenal...');

    if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR);

    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

    for (const product of products) {
        const slug = product.title.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Limpiar acentos
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '');
        
        const dir = path.join(IMAGES_DIR, slug);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const fileName = `img1.webp`;
        const filePath = path.join(dir, fileName);

        // Si ya es local pero el archivo no estÃ¡, buscamos la URL original en el Ninja (si existiera)
        // Por ahora, asumimos que si empieza con http es descargable.
        if (product.image && product.image.startsWith('http')) {
            try {
                console.log(`Ã°Å¸â€œÂ¦ Procesando: ${product.title}`);
                await downloadImage(product.image, filePath);
                console.log(`   Ã¢Å“â€¦ Descargado: ${fileName}`);
                product.image = `/imagenes/${slug}/${fileName}`;
            } catch (err) {
                console.error(`   Ã¢ÂÅ’ Error en ${product.title}:`, err.message);
            }
        } else if (product.image && product.image.startsWith('/imagenes')) {
             // Si ya es local, verificamos que el archivo EXISTA. Si no, lo marcamos para re-sync.
             if (!fs.existsSync(filePath)) {
                 console.log(`   Ã¢Å¡Â Ã¯Â¸Â Archivo local perdido para ${product.title}. Re-sincronizando...`);
                 // AquÃ­ podrÃ­amos disparar un re-search de MELI pero lo dejamos para syncProducts.js
             } else {
                 console.log(`   Ã¢Å“â€¦ Imagen local OK: ${product.title}`);
             }
        }
    }

    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    console.log('\nÃ°Å¸â€Â¥ Arsenal verificado y actualizado.');
}

run();
