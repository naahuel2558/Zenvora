// Fitnees Ninja Collector - Content Script (V1.3 - Modo Afiliado)

const saveLink = (url) => {
    // Si tiene mercadolibre o meli.la, adentro. No preguntamos mÃ¡s.
    const isMeliLink = url && (url.includes('mercadolibre') || url.includes('meli.la'));

    if (isMeliLink) {
        chrome.runtime.sendMessage({ type: "NEW_LINK", url: url.trim() });
        console.log("%c[Fitnees Ninja] Ã‚Â¡CAPTURA AFILIADO EXITOSA!: " + url, "background: #cceabb; color: #3f3f44; font-weight: bold; padding: 2px 5px;");
    } else {
        console.log("[Fitnees Ninja] Link ignorado (no parece de MELI): " + url);
    }
};

// Escuchar clicks (Especialmente para el botÃ³n de "Copiar link")
document.addEventListener('click', (e) => {
    const target = e.target;
    const btnText = target.textContent.toLowerCase();
    const parentBtnText = target.closest('button')?.textContent.toLowerCase() || "";

    if (btnText.includes('copiar link') || parentBtnText.includes('copiar link')) {
        console.log("[Fitnees Ninja] Se detectÃ³ click en botÃ³n copiar. Esperando al portapapeles...");
        // Le damos un cachito de tiempo para que MELI actualice el portapapeles con el link de afiliado
        setTimeout(async () => {
            try {
                const text = await navigator.clipboard.readText();
                saveLink(text);
            } catch (err) {
                // Si no podemos leer el portapapeles, guardamos la URL actual como fallback
                saveLink(window.location.href);
            }
        }, 500);
    }
}, true);

// Escuchar evento copy general
document.addEventListener('copy', () => {
    setTimeout(async () => {
        try {
            const text = await navigator.clipboard.readText();
            saveLink(text);
        } catch (err) {}
    }, 500);
});

console.log("%c[Fitnees Ninja V1.3] Modo Afiliado Activado. Capturando todo lo que sea MELI.", "color: #22c55e; font-weight: bold;");
