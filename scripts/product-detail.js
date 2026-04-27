// ── DOM References ──
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const content = document.getElementById('product-content');

// ── Get product ID from URL ──
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

function showError() {
    loading.classList.add('hidden');
    error.classList.remove('hidden');
}

async function loadProduct() {
    if (!productId) {
        showError();
        return;
    }

    try {
        let product = null;

        // Try Express API first (local dev)
        let res = await fetch(`/api/products/${productId}`).catch(() => null);
        if (res && res.ok) {
            product = await res.json();
        } else {
            // Fallback: load all products from static JSON (Netlify/static hosting)
            res = await fetch('/data/products.json');
            const all = await res.json();
            product = all.find(p => p.id === productId);
        }

        if (!product) throw new Error('Not found');

        // Fallback image
        const fallbackImage = 'data:image/svg+xml,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" fill="%23222"><rect width="600" height="600"/><text x="300" y="310" text-anchor="middle" fill="%23555" font-size="16" font-family="sans-serif">Sin imagen</text></svg>'
        );

        document.title = `ZENVORA | ${product.title}`;

        const imgEl = document.getElementById('product-image');
        imgEl.src = product.image || fallbackImage;
        imgEl.onerror = function () { this.src = fallbackImage; };

        document.getElementById('product-title').textContent = product.title;
        document.getElementById('product-price').textContent = product.price;
        document.getElementById('product-category').textContent = product.category;

        const descEl = document.getElementById('product-description');
        if (product.description) {
            descEl.innerHTML = product.description
                .split('\n')
                .filter(line => line.trim() !== '')
                .map(line => `<p class="mb-4">${line}</p>`)
                .join('');
        } else {
            descEl.innerHTML = '<p class="mb-4">Sin descripción disponible.</p>';
        }

        const buyBtn = document.getElementById('buy-button');
        buyBtn.href = product.url;
        buyBtn.textContent = 'VER EN MERCADO LIBRE';

        loading.classList.add('hidden');
        content.classList.remove('hidden');
    } catch (e) {
        console.error('Error cargando producto:', e);
        showError();
    }
}

loadProduct();
