const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json');

async function verifyLinks() {
    console.log('Ã°Å¸â€Â Iniciando auditorÃ­a de links del arsenal...');
    
    if (!fs.existsSync(PRODUCTS_FILE)) {
        console.error('Ã¢ÂÅ’ No se encontrÃ³ data/products.json');
        return;
    }

    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    const broken = [];

    for (const p of products) {
        process.stdout.write(`Ã°Å¸â€¢ÂµÃ¯Â¸Â Verificando: ${p.title.substring(0, 30).padEnd(30)} `);
        try {
            // Usamos GET porque HEAD a veces falla con los acortadores de MELI
            const res = await fetch(p.url, { 
                method: 'GET', 
                redirect: 'follow',
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
                }
            });

            // Si llegamos a MELI (o si el redirect fue exitoso)
            if (res.ok && (res.url.includes('mercadolibre') || res.url.includes('meli.la'))) {
                console.log('Ã¢Å“â€¦ OK');
            } else {
                console.log(`Ã¢ÂÅ’ ERROR (${res.status})`);
                broken.push(p);
            }
        } catch (e) {
            console.log(`Ã¢Å¡Â Ã¯Â¸Â FALLO (${e.message})`);
            broken.push(p);
        }
    }

    console.log('\n--- RESULTADO DE LA AUDITORÃƒÂA ---');
    if (broken.length === 0) {
        console.log('Ã°Å¸Å¡â‚¬ Ã‚Â¡Impecable! Todos los links estÃ¡n operativos.');
    } else {
        console.log(`Ã°Å¸Â§Â¨ Se detectaron ${broken.length} links con problemas.`);
        console.log('Asegurate de que estos productos sigan publicados en MELI.');
        broken.forEach(b => console.log(` - ${b.title}: ${b.url}`));
    }
}

verifyLinks();
