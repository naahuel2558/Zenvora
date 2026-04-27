const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = 'ZENVORA_ultra_secret_2026';

app.use(express.json());
app.use(cookieParser());
app.use(cors());

// --- SERVIR FRONTEND ORIGINAL ---
// Servimos primero las pÃ¡ginas para que index.html gane
app.use(express.static(path.join(__dirname, 'pages'))); 
app.use(express.static(__dirname)); // RaÃ­z para assets, componentes, etc.
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const POSTS_FILE = path.join(__dirname, 'data', 'posts.json');
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');

// --- Helpers ---
const readJSON = async (file) => {
    try { return JSON.parse(await fs.readFile(file, 'utf-8')); }
    catch(e) { return []; }
};
const writeJSON = async (file, data) => await fs.writeFile(file, JSON.stringify(data, null, 2));

// --- Auth Middleware ---
const authenticate = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Acceso no autorizado' });
    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token invÃ¡lido' });
    }
};

// --- API: Auth ---
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    const users = await readJSON(USERS_FILE);
    if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email ya registrado' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), username, email, password: hashedPassword, createdAt: new Date().toISOString() };
    users.push(newUser);
    await writeJSON(USERS_FILE, users);
    res.json({ message: 'Usuario registrado con Ã©xito' });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'Credenciales invÃ¡lidas' });
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true });
    res.json({ message: 'Login exitoso', user: { id: user.id, username: user.username } });
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'SesiÃ³n cerrada' });
});

// --- API: Products (Arsenal) ---
app.get('/api/products', async (req, res) => {
    const products = await readJSON(PRODUCTS_FILE);
    res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
    const products = await readJSON(PRODUCTS_FILE);
    const product = products.find(p => p.id.toString().trim() === req.params.id.toString().trim());
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
});

// --- API: Blog Posts ---
app.get('/api/posts', async (req, res) => {
    const posts = await readJSON(POSTS_FILE);
    res.json(posts);
});

app.get('/api/posts/:id', async (req, res) => {
    const posts = await readJSON(POSTS_FILE);
    const post = posts.find(p => p.id == req.params.id);
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    res.json(post);
});

// Create Post (REQUIRES AUTH)
app.post('/api/posts', authenticate, async (req, res) => {
    const { title, content, images, links, category } = req.body;
    const posts = await readJSON(POSTS_FILE);
    const newPost = { id: Date.now().toString(), userId: req.user.id, username: req.user.username, title, content, images, links, category, createdAt: new Date().toISOString() };
    posts.push(newPost);
    await writeJSON(POSTS_FILE, posts);
    res.json(newPost);
});

// --- API: Ninja Collector (Extension Integration) ---
app.post('/api/ninja/collect', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Falta la URL' });

    console.log(`\nÃ°Å¸Â¥Â· [NINJA] Capturando link: ${url}`);

    try {
        const idMatch = url.match(/MLA-?(\d+)/i);
        const meliId = idMatch ? `MLA${idMatch[1]}` : null;

        if (!meliId) {
            return res.status(400).json({ error: 'No parece un link de MELI AR' });
        }

        // Consultar API de Mercado Libre
        const mlRes = await fetch(`https://api.mercadolibre.com/items/${meliId}`);
        if (!mlRes.ok) throw new Error('Producto no encontrado en MELI');
        const mlData = await mlRes.json();

        // Extraer datos
        const products = await readJSON(PRODUCTS_FILE);
        
        // Evitar duplicados
        if (products.find(p => p.url.includes(meliId))) {
            return res.json({ message: 'El producto ya estÃ¡ en el arsenal', status: 'skipped' });
        }

        const price = mlData.price;
        const oldPrice = mlData.original_price || Math.round(price * 1.3);
        const discount = mlData.original_price ? 
            Math.round((1 - (price / mlData.original_price)) * 100) + "% OFF" : 
            "30% OFF";

        // --- SISTEMA NINJA DE DESCARGA DE IMAGENES ---
        const slug = mlData.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
        const imgDir = path.join(__dirname, 'imagenes', slug);
        if (!require('fs').existsSync(imgDir)) require('fs').mkdirSync(imgDir, { recursive: true });

        const externalImgUrl = mlData.pictures && mlData.pictures.length > 0 ? mlData.pictures[0].secure_url : null;
        let localImgPath = externalImgUrl;

        if (externalImgUrl) {
            const fileName = `img1${path.extname(externalImgUrl).split('?')[0] || '.webp'}`;
            const destPath = path.join(imgDir, fileName);
            
            try {
                // FunciÃ³n interna para descargar (handle redirects)
                const download = (url, dest) => {
                    return new Promise((resolve, reject) => {
                        const httpMod = url.startsWith('https') ? require('https') : require('http');
                        const file = require('fs').createWriteStream(dest);
                        const request = (targetUrl) => {
                            httpMod.get(targetUrl, (res) => {
                                if (res.statusCode === 301 || res.statusCode === 302) {
                                    file.close(); require('fs').unlinkSync(dest);
                                    request(res.headers.location); return;
                                }
                                if (res.statusCode !== 200) { reject(new Error(res.statusCode)); return; }
                                res.pipe(file); file.on('finish', () => { file.close(); resolve(); });
                            }).on('error', (err) => { require('fs').unlink(dest, () => {}); reject(err); });
                        };
                        request(url);
                    });
                };
                await download(externalImgUrl, destPath);
                localImgPath = `/imagenes/${slug}/${fileName}`;
                console.log(`Ã°Å¸â€œÂ¸ [NINJA] Imagen guardada localmente: ${localImgPath}`);
            } catch (imgErr) {
                console.error(`Ã¢Å¡Â Ã¯Â¸Â  [NINJA] Error descargando imagen, usando URL externa:`, imgErr.message);
            }
        }

        const newProduct = {
            id: Date.now().toString(),
            url: url,
            title: mlData.title,
            price: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price),
            oldPrice: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(oldPrice),
            discount: discount,
            category: "Novedades",
            image: localImgPath,
            description: mlData.title + ". Capturado automÃ¡ticamente por Fitnees Ninja."
        };

        products.push(newProduct);
        await writeJSON(PRODUCTS_FILE, products);

        console.log(`Ã¢Å“â€¦ [NINJA] Producto guardado: ${mlData.title}`);
        res.json({ message: 'Producto capturado ninja!', product: newProduct });
        
    } catch (err) {
        console.error('Ã¢ÂÅ’ [NINJA] Error al recolectar:', err.message);
        res.status(500).json({ error: 'Error interno del recolector ninja' });
    }
});

app.delete('/api/posts/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    let posts = await readJSON(POSTS_FILE);
    const post = posts.find(p => p.id == id);
    if (!post || post.userId !== req.user.id) return res.status(403).json({ error: 'No autorizado' });
    posts = posts.filter(p => p.id != id);
    await writeJSON(POSTS_FILE, posts);
    res.json({ message: 'Post eliminado' });
});

app.listen(PORT, () => {
    console.log(`\nÃ°Å¸â€Â¥ ZENVORA SERVER RUNNING: http://localhost:${PORT}`);
    console.log(`Ã°Å¸Å¡â‚¬ Listo para el combate. Pulsa Ctrl+C para detener.\n`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Ã¢ÂÅ’ ERROR: El puerto ${PORT} estÃ¡ ocupado por otro proceso.`);
    } else {
        console.error(`Ã¢ÂÅ’ ERROR AL INICIAR:`, err.message);
    }
});

// Manejo de errores globales para evitar cierres silenciosos
process.on('unhandledRejection', (reason, promise) => {
    console.error('Ã¢Å¡Â Ã¯Â¸Â UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Ã¢Å¡Â Ã¯Â¸Â UNCAUGHT EXCEPTION:', err.message);
});

