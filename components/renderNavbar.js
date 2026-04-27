export const renderNavbar = (active = '') => {
    const container = document.getElementById('navbar-container');
    if (!container) return;

    container.innerHTML = `
        <nav class="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-xl border-b border-white/5 px-10 py-6">
            <div class="max-w-[1400px] mx-auto flex justify-between items-center">
                <a href="index.html" class="font-space text-3xl font-black tracking-tighter text-primary hover:scale-105 transition-all">ZENVORA</a>
                
                <div class="flex items-center gap-10">
                    <a href="index.html" class="text-[10px] uppercase font-black tracking-[0.2em] ${active === 'inicio' ? 'text-primary' : 'text-white/40'} hover:text-primary transition-all">Inicio</a>
                    <a href="marketplace.html" class="text-[10px] uppercase font-black tracking-[0.2em] ${active === 'arsenal' ? 'text-primary' : 'text-white/40'} hover:text-primary transition-all">Marketplace</a>
                    <a href="blog.html" class="text-[10px] uppercase font-black tracking-[0.2em] ${active === 'blog' ? 'text-primary' : 'text-white/40'} hover:text-primary transition-all">Blog</a>
                    
                    <div class="relative group">
                        <button class="text-[10px] uppercase font-black tracking-[0.2em] text-white/40 hover:text-primary flex items-center gap-2">
                            Admin <span class="text-[14px]">▼</span>
                        </button>
                        <div class="absolute right-0 top-full mt-4 w-48 bg-surface border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all rounded-xl p-2 shadow-2xl">
                            <a href="create-post.html" class="block w-full text-left px-4 py-3 text-[10px] uppercase font-black text-white/60 hover:text-primary hover:bg-white/5 rounded-lg transition-all">Crear Post</a>
                            <a href="login.html" class="block w-full text-left px-4 py-3 text-[10px] uppercase font-black text-white/60 hover:text-primary hover:bg-white/5 rounded-lg transition-all">Login</a>
                            <a href="register.html" class="block w-full text-left px-4 py-3 text-[10px] uppercase font-black text-white/60 hover:text-primary hover:bg-white/5 rounded-lg transition-all">Registrarse</a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        <div class="h-24"></div>
    `;
};
