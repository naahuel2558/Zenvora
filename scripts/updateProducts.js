import { MeliExtractor } from './fetchProducts.js';
import { supabaseConfig } from '../lib/supabase.js';

// No podemos usar el CDN acÃ¡ si el entorno es Node o un script directo sin window,
// pero asumimos que este script se corre en el navegador para esta demo.
// Si fuera Node, requerirÃ­a @supabase/supabase-js vÃ­a npm.

export async function updateProducts(urlList, supabaseClient) {
    console.log(`Iniciando actualizaciÃ³n de ${urlList.length} productos...`);
    
    for (const url of urlList) {
        const productData = await MeliExtractor.fetchProductData(url);
        
        if (productData) {
            console.log(`Procesando: ${productData.title}`);
            
            // Intentar actualizar en Supabase (Upsert por URL)
            const { error } = await supabaseClient
                .from('products')
                .upsert({
                    title: productData.title,
                    price: productData.price,
                    image: productData.image,
                    url: productData.link
                }, { onConflict: 'url' });

            if (error) {
                console.error(`Error haciendo upsert de ${productData.title}:`, error);
            }
        }
    }
    
    console.log("ActualizaciÃ³n completada.");
}

/**
 * AutomÃ¡ticamente refresca los productos cada X tiempo (ej. cada 2 horas)
 */
export function startAutoRefresh(urlList, supabaseClient, intervalHours = 2) {
    const ms = intervalHours * 60 * 60 * 1000;
    console.log(`Auto-refresh activado cada ${intervalHours} horas.`);
    
    // EjecuciÃ³n inmediata
    updateProducts(urlList, supabaseClient);
    
    return setInterval(() => {
        updateProducts(urlList, supabaseClient);
    }, ms);
}
