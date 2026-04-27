// ── State ──
let allProducts = [];
let currentCategory = 'Todos';
let searchQuery = '';

// ── DOM References ──
const grid = document.getElementById('products-grid');
const emptyState = document.getElementById('empty-state');
const categoriesContainer = document.getElementById('categories-container');
const searchInput = document.getElementById('search-input');

// ── Render category filter buttons ──
function renderCategoryButtons() {
    const categories = ['Todos', ...new Set(allProducts.map(p => p.category))];
    
    categoriesContainer.innerHTML = categories.map(c => `
        <button 
            data-category="${c}" 
            class="filter-btn ${c === currentCategory ? 'active' : ''} border border-white/10 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all"
        >${c}</button>
    `).join('');

    categoriesContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            render();
        });
    });
}

// ── Filter products based on current state ──
function getFilteredProducts() {
    let filtered = allProducts;

    if (currentCategory !== 'Todos') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }

    if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(p => p.title.toLowerCase().includes(q));
    }

    return filtered;
}

// ── Render a single product card ──
function renderCard(p) {
    const fallbackImage = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="%23222"><rect width="400" height="400"/><text x="200" y="210" text-anchor="middle" fill="%23555" font-size="14" font-family="sans-serif">Sin imagen</text></svg>'
    );
    const imgSrc = p.image || fallbackImage;

    return `
        <div class="group bg-surface border border-white/5 rounded-3xl overflow-hidden hover:border-primary/30 transition-all flex flex-col">
            <div class="aspect-square relative overflow-hidden bg-black cursor-pointer" onclick="window.location.href='articulo.html?id=${p.id}'">
                <img src="${imgSrc}" alt="${p.title}" class="w-full h-full object-contain p-6 group-hover:scale-110 transition-all duration-700" onerror="this.src='${fallbackImage}'">
            </div>
            <div class="p-8 flex flex-col flex-grow">
                <span class="text-[10px] font-black text-primary uppercase tracking-widest mb-2">${p.category}</span>
                <h3 class="font-space text-lg font-black uppercase mb-4 line-clamp-1 cursor-pointer hover:text-primary transition-all tracking-tighter" onclick="window.location.href='articulo.html?id=${p.id}'">${p.title}</h3>
                <div class="mt-auto flex justify-between items-center">
                    <span class="text-2xl font-black text-white">${p.price}</span>
                    <a href="articulo.html?id=${p.id}" class="bg-primary text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all rounded-full shadow-2xl">VER DETALLES</a>
                </div>
            </div>
        </div>
    `;
}

// ── Master render function ──
function render() {
    const filtered = getFilteredProducts();

    // Update active button
    categoriesContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === currentCategory);
    });

    if (filtered.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        grid.innerHTML = filtered.map(renderCard).join('');
    }

    const countEl = document.getElementById('results-count');
    if (countEl) {
        countEl.textContent = `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`;
    }
}

// ── Search listener ──
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
    });
}

// ── Init: fetch products (API or static JSON) ──
async function init() {
    try {
        // Try Express API first (local dev), then static JSON (Netlify/static hosting)
        let res = await fetch('/api/products').catch(() => null);
        if (!res || !res.ok) {
            res = await fetch('/data/products.json');
        }
        allProducts = await res.json();
        renderCategoryButtons();
        render();
    } catch (e) {
        console.error('Error cargando productos:', e);
        emptyState.classList.remove('hidden');
    }
}

init();
