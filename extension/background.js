// Fitnees Ninja Collector - Background Service Worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "NEW_LINK") {
        console.log("[NINJA] Nuevo link detectado:", message.url);

        // Enviar al servidor local directamente
        fetch('http://localhost:3000/api/ninja/collect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: message.url })
        })
        .then(response => response.json())
        .then(data => {
            console.log("[NINJA] Respuesta del servidor:", data.message);
            
            // NotificaciÃ³n visual opcional
            chrome.storage.local.get({ products: [] }, (result) => {
                const products = result.products;
                if (!products.includes(message.url)) {
                    products.push(message.url);
                    chrome.storage.local.set({ products: products });
                }
            });
        })
        .catch(err => {
            console.error("[NINJA] Error al enviar al servidor:", err);
            // Si falla el servidor, lo guardamos localmente como backup
            chrome.storage.local.get({ products: [] }, (result) => {
                const products = result.products;
                if (!products.includes(message.url)) {
                    products.push(message.url);
                    chrome.storage.local.set({ products: products });
                }
            });
        });
    }
});
