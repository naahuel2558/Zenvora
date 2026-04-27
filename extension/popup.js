// Fitnees Ninja Collector - Popup Script (Elite Version)

document.addEventListener('DOMContentLoaded', () => {
    const linkList = document.getElementById('linkList');
    const openCatalogBtn = document.getElementById('openCatalogBtn');
    const clearBtn = document.getElementById('clearBtn');
    const statusDot = document.getElementById('statusDot');

    // Cargar links guardados
    const updateList = () => {
        chrome.storage.local.get({ products: [] }, (result) => {
            const products = result.products;
            if (products.length === 0) {
                linkList.innerHTML = '<div class="item" style="text-align:center; opacity: 0.5;">Sin capturas todavÃ­a</div>';
                return;
            }
            
            linkList.innerHTML = products.reverse().map(url => {
                const title = url.split('-').slice(0, 3).join(' ').replace(/https?:\/\/articulo.mercadolibre.com.ar\//, '');
                return `<div class="item" title="${url}">${title}...</div>`;
            }).join('');
        });
    };

    // Verificar si el servidor local estÃ¡ online
    const checkServer = () => {
        fetch('http://localhost:3000/api/products')
            .then(res => {
                if (res.ok) {
                    statusDot.classList.add('online');
                } else {
                    statusDot.classList.remove('online');
                }
            })
            .catch(() => {
                statusDot.classList.remove('online');
            });
    };

    // BotÃ³n: VER MARKETPLACE (Abre la pÃ¡gina local)
    openCatalogBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:3000/marketplace.html' });
    });

    // BotÃ³n: Limpiar
    clearBtn.addEventListener('click', () => {
        if (confirm('Ã‚Â¿Borrar historial de capturas locales de la extensiÃ³n?')) {
            chrome.storage.local.set({ products: [] }, () => {
                updateList();
            });
        }
    });

    updateList();
    checkServer();
    // Re-chequear server cada 5 seg
    setInterval(checkServer, 5000);
});
