export const ProductCard = (url) => {
    const parseTitle = (link) => {
        try {
            if (link.includes('meli.la')) return "ELITE GEAR RECO Ã°Å¸â€Â¥";
            const parts = link.split('/');
            const slug = parts[3] || "";
            let title = slug.replace(/MLA-\d+-/, '').replace(/-|_/g, ' ');
            if (title.length < 3) return "IRONCLAD EQUIPMENT";
            return title.toUpperCase();
        } catch (e) {
            return "ELITE PERFORMANCE";
        }
    };

    const productTitle = parseTitle(url);
    const imageUrl = "https://placehold.co/600x400/131313/39FF14?text=STRENGTH+EQUIPMENT";

    return `
        <div class="glass-card flex flex-col border border-white/5 hover:border-[#39FF14] transition-all duration-300 group overflow-hidden h-full">
            <div class="relative aspect-square overflow-hidden bg-surface-container-low">
                <img src="${imageUrl}" alt="${productTitle}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100">
                <div class="absolute top-4 left-4 bg-[#39FF14] text-black px-3 py-1 font-headline-md text-[10px] font-black uppercase tracking-widest">
                    OFERTA ELITE
                </div>
            </div>
            <div class="p-8 flex flex-col flex-grow">
                <h3 class="font-headline-md text-xl uppercase mb-2 tracking-tighter">${productTitle}</h3>
                
                <div class="flex flex-col mb-6">
                    <span class="text-white/30 text-xs line-through">$45.000</span>
                    <div class="flex items-center gap-2">
                        <span class="text-[#39FF14] font-headline-md text-2xl font-black italic">$24.500</span>
                        <span class="text-[#39FF14] text-[10px] font-bold">25% OFF</span>
                    </div>
                </div>
                
                <div class="space-y-3 mb-8 flex-grow">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-[#39FF14] text-sm" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                        <span class="text-white/60 text-xs uppercase font-bold tracking-widest">En Oferta por tiempo limitado</span>
                    </div>
                </div>

                <a href="${url}" target="_blank" class="bg-white/5 border border-white/10 text-white hover:bg-[#39FF14] hover:text-black w-full py-4 text-center font-headline-md text-sm font-black uppercase tracking-tighter transition-all">
                    VER EN MERCADO LIBRE
                </a>
            </div>
        </div>
    `;

};
