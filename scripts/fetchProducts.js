/**
 * Product Data Extraction Module for Mercado Libre Argentina
 * Uses the public ML API for real data extraction.
 */

export const MeliExtractor = {
    /**
     * Extracts Product ID from a Mercado Libre Argentina URL
     * @param {string} url 
     * @returns {string|null}
     */
    extractId(url) {
        const match = url.match(/MLA-?(\d+)/i);
        return match ? `MLA${match[1]}` : null;
    },

    /**
     * Fetches real product data from the public Mercado Libre API
     * @param {string} url 
     * @returns {Promise<Object|null>}
     */
    async fetchProductData(url) {
        const id = this.extractId(url);
        if (!id) return null;

        try {
            const response = await fetch(`https://api.mercadolibre.com/items/${id}`);
            if (!response.ok) throw new Error('Product not found');
            
            const data = await response.json();
            
            return {
                title: data.title,
                price: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(parseInt(data.price)),
                image: data.pictures && data.pictures.length > 0 ? data.pictures[0].secure_url : 'https://placehold.co/600x600/0a0a0a/00FF00?text=SIN+IMAGEN',
                link: url,
                id_meli: id
            };
        } catch (error) {
            console.error(`Error fetching ML data for ${id}:`, error);
            // Fallback to placeholder logic if API fails
            return {
                title: url.split('/').pop().replace(/-/g, ' ').toUpperCase(),
                price: "$0",
                image: 'https://placehold.co/600x600/0a0a0a/00FF00?text=ML+FALLBACK',
                link: url,
                id_meli: id
            };
        }
    }
};
