import tkinter as tk
from tkinter import ttk, messagebox
import json
import os
import re
import threading
import unicodedata
import ssl
from datetime import datetime
from io import BytesIO

import requests as req_lib
from PIL import Image, ImageTk

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS_JSON = os.path.join(BASE_DIR, 'data', 'products.json')
HISTORY_JSON = os.path.join(BASE_DIR, 'data', 'history.json')
IMAGES_DIR = os.path.join(BASE_DIR, 'imagenes')

CATEGORIES = [
    "Suplementos", "Fitness", "Bienestar", "Salud",
    "Deportes", "Nutrición", "Belleza", "Ortopedia", "Novedades"
]


class NinjaAdmin:
    def __init__(self, root):
        self.root = root
        self.root.title("ZENVORA | NINJA PRODUCT MANAGER 5.0")
        self.root.geometry("950x700")
        self.root.configure(bg="#0A0A0A")
        self.root.resizable(True, True)

        self.pending_products = []  # Products ready to build
        self.thumb_refs = []  # Keep image references alive

        # ── Style ──
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("Treeview", background="#131313", foreground="white",
                        fieldbackground="#131313", rowheight=60, font=("Arial", 9))
        style.configure("Treeview.Heading", background="#1a1a1a", foreground="#00FF00",
                        font=("Arial", 9, "bold"))
        style.map("Treeview", background=[("selected", "#1a3a1a")])

        # ── Header ──
        hdr = tk.Frame(root, bg="#0A0A0A")
        hdr.pack(fill="x", padx=20, pady=(15, 5))
        tk.Label(hdr, text="NINJA PRODUCT MANAGER", bg="#0A0A0A", fg="#00FF00",
                 font=("Arial", 20, "bold")).pack(side="left")
        self.counter_lbl = tk.Label(hdr, text="0 productos pendientes",
                                    bg="#0A0A0A", fg="gray", font=("Arial", 10))
        self.counter_lbl.pack(side="right")

        # ── Toolbar ──
        toolbar = tk.Frame(root, bg="#0A0A0A")
        toolbar.pack(fill="x", padx=20, pady=10)
        tk.Button(toolbar, text="➕ AGREGAR PRODUCTO", command=self.open_add_window,
                  bg="#333", fg="white", font=("Arial", 11, "bold"),
                  borderwidth=0, cursor="hand2", padx=20, pady=8).pack(side="left")
        tk.Button(toolbar, text="🗑 QUITAR SELECCION", command=self.remove_selected,
                  bg="#222", fg="#ff4444", font=("Arial", 9, "bold"),
                  borderwidth=0, cursor="hand2", padx=15, pady=8).pack(side="left", padx=10)

        # ── Table ──
        table_frame = tk.Frame(root, bg="#0A0A0A")
        table_frame.pack(fill="both", expand=True, padx=20, pady=5)

        cols = ("img", "title", "price", "category", "affiliate")
        self.tree = ttk.Treeview(table_frame, columns=cols, show="tree headings", height=8)
        self.tree.heading("#0", text="")
        self.tree.heading("img", text="")
        self.tree.heading("title", text="Producto")
        self.tree.heading("price", text="Precio")
        self.tree.heading("category", text="Categoría")
        self.tree.heading("affiliate", text="Link Afiliado")
        self.tree.column("#0", width=65, stretch=False)
        self.tree.column("img", width=0, stretch=False)
        self.tree.column("title", width=350)
        self.tree.column("price", width=100, anchor="e")
        self.tree.column("category", width=110, anchor="center")
        self.tree.column("affiliate", width=200)

        scrollbar = ttk.Scrollbar(table_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        self.tree.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # ── Bottom bar ──
        bottom = tk.Frame(root, bg="#0A0A0A")
        bottom.pack(fill="x", padx=20, pady=15)
        self.status_lbl = tk.Label(bottom, text="Listo", bg="#0A0A0A", fg="gray",
                                   font=("Arial", 9))
        self.status_lbl.pack(side="left")
        self.build_btn = tk.Button(bottom, text="✅ CONSTRUIR Y SUBIR AL MARKETPLACE",
                                   command=self.build_all, bg="#00FF00", fg="black",
                                   font=("Arial", 12, "bold"), borderwidth=0,
                                   cursor="hand2", padx=20, pady=10, state="disabled")
        self.build_btn.pack(side="right")

    # ══════════════════════════════════════════
    # ADD PRODUCT SUB-WINDOW
    # ══════════════════════════════════════════
    def open_add_window(self):
        win = tk.Toplevel(self.root)
        win.title("Agregar Producto")
        win.geometry("550x400")
        win.configure(bg="#0A0A0A")
        win.transient(self.root)
        win.grab_set()

        tk.Label(win, text="AGREGAR PRODUCTO", bg="#0A0A0A", fg="#00FF00",
                 font=("Arial", 14, "bold")).pack(pady=(20, 15))

        # Product URL
        tk.Label(win, text="URL DEL PRODUCTO (link largo de Mercado Libre)",
                 bg="#0A0A0A", fg="white", font=("Arial", 9, "bold")).pack(anchor="w", padx=20)
        url_entry = tk.Entry(win, bg="#131313", fg="#00FF00", insertbackground="#00FF00",
                             borderwidth=0, font=("Consolas", 10))
        url_entry.pack(padx=20, pady=5, fill="x", ipady=6)

        # Affiliate link
        tk.Label(win, text="LINK DE AFILIADO (meli.la/xxx)",
                 bg="#0A0A0A", fg="white", font=("Arial", 9, "bold")).pack(anchor="w", padx=20, pady=(10, 0))
        aff_entry = tk.Entry(win, bg="#131313", fg="#00FF00", insertbackground="#00FF00",
                             borderwidth=0, font=("Consolas", 10))
        aff_entry.pack(padx=20, pady=5, fill="x", ipady=6)

        # Category
        cat_frame = tk.Frame(win, bg="#0A0A0A")
        cat_frame.pack(fill="x", padx=20, pady=10)
        tk.Label(cat_frame, text="CATEGORÍA:", bg="#0A0A0A", fg="white",
                 font=("Arial", 9, "bold")).pack(side="left")
        cat_var = tk.StringVar(value="Suplementos")
        ttk.Combobox(cat_frame, textvariable=cat_var, values=CATEGORIES, width=20).pack(side="left", padx=10)

        # Status
        status = tk.Label(win, text="", bg="#0A0A0A", fg="gray", font=("Arial", 9))
        status.pack(pady=5)

        # Button
        scan_btn = tk.Button(win, text="🔍 ESCANEAR Y AGREGAR",
                             bg="#00FF00", fg="black", font=("Arial", 12, "bold"),
                             borderwidth=0, cursor="hand2",
                             command=lambda: self._scan_and_add(
                                 win, url_entry, aff_entry, cat_var, status, scan_btn))
        scan_btn.pack(pady=15, fill="x", padx=40)

    def _scan_and_add(self, win, url_entry, aff_entry, cat_var, status_lbl, scan_btn):
        product_url = url_entry.get().strip()
        affiliate_url = aff_entry.get().strip()
        category = cat_var.get()

        if not product_url:
            messagebox.showwarning("AVISO", "Pega la URL del producto.", parent=win)
            return
        if not affiliate_url:
            messagebox.showwarning("AVISO", "Pega el link de afiliado.", parent=win)
            return
        if "mercadolibre" not in product_url:
            messagebox.showerror("ERROR", "La URL debe ser de mercadolibre.com.ar", parent=win)
            return

        scan_btn.config(state="disabled", text="ESCANEANDO...")
        status_lbl.config(text="Escaneando pagina...")

        def _fetch():
            try:
                # Scrape directly from the product page (API returns 403)
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                                  "Chrome/120.0.0.0 Safari/537.36"
                }
                resp = req_lib.get(product_url, headers=headers, timeout=15)
                print(f"[NINJA] Page status: {resp.status_code}")
                if resp.status_code != 200:
                    raise Exception(f"Page error: {resp.status_code}")

                html = resp.text

                # Extract from og: meta tags
                og_title = re.search(r'property="og:title"\s+content="([^"]*)"', html)
                og_image = re.search(r'property="og:image"\s+content="([^"]*)"', html)

                if not og_title:
                    raise Exception("No se pudo leer el titulo del producto")

                raw_title = og_title.group(1)
                # Title comes as "Producto - $76.000" so split at " - $"
                parts = raw_title.rsplit(" - $", 1)
                title = parts[0].strip() if parts else raw_title
                price_str = parts[1].strip() if len(parts) > 1 else "0"
                price_fmt = f"${price_str}"

                img_url = og_image.group(1) if og_image else None

                # Try to get description from name fields
                desc_parts = [title]
                names = re.findall(r'"name"\s*:\s*"([^"]{5,80})"', html[:20000])
                seen = set()
                for n in names:
                    clean = n.strip()
                    if clean not in seen and clean != title and "Mercado" not in clean:
                        desc_parts.append(clean)
                        seen.add(clean)
                    if len(desc_parts) >= 6:
                        break

                product = {
                    "title": title,
                    "price": price_fmt,
                    "url": affiliate_url,
                    "image_url": img_url,
                    "description": "\n".join(desc_parts),
                    "category": category,
                    "product_url": product_url
                }

                self.pending_products.append(product)
                safe_title = title.encode("ascii", "replace").decode("ascii")
                print(f"[NINJA] OK: {safe_title} -- {price_fmt}")

                self.root.after(0, lambda: self._refresh_table())
                self.root.after(0, lambda: win.destroy())

            except Exception as e:
                err_msg = str(e).encode("ascii", "replace").decode("ascii")
                print(f"[NINJA] ERROR: {err_msg}")
                self.root.after(0, lambda: status_lbl.config(text=f"Error: {err_msg}"))
                self.root.after(0, lambda: scan_btn.config(
                    state="normal", text="ESCANEAR Y AGREGAR"))

        threading.Thread(target=_fetch, daemon=True).start()

    # ══════════════════════════════════════════
    # TABLE MANAGEMENT
    # ══════════════════════════════════════════
    def _refresh_table(self):
        self.tree.delete(*self.tree.get_children())
        self.thumb_refs.clear()

        for i, p in enumerate(self.pending_products):
            # Load thumbnail
            thumb = None
            if p.get('image_url'):
                try:
                    resp = req_lib.get(p['image_url'], timeout=10)
                    img = Image.open(BytesIO(resp.content))
                    img.thumbnail((55, 55))
                    thumb = ImageTk.PhotoImage(img)
                    self.thumb_refs.append(thumb)
                except Exception:
                    pass

            aff_short = p['url'][:35] + "..." if len(p['url']) > 35 else p['url']
            self.tree.insert("", "end", image=thumb if thumb else "",
                             values=("", p['title'][:55], p['price'],
                                     p['category'], aff_short))

        count = len(self.pending_products)
        self.counter_lbl.config(text=f"{count} producto(s) pendientes")
        self.build_btn.config(state="normal" if count > 0 else "disabled")
        self.status_lbl.config(text=f"{count} producto(s) listos para construir")

    def remove_selected(self):
        sel = self.tree.selection()
        if not sel:
            return
        indices = [self.tree.index(item) for item in sel]
        for idx in sorted(indices, reverse=True):
            self.pending_products.pop(idx)
        self._refresh_table()

    # ══════════════════════════════════════════
    # BUILD & SAVE
    # ══════════════════════════════════════════
    def slugify(self, text):
        text = unicodedata.normalize('NFD', text).encode('ascii', 'ignore').decode('utf-8')
        return re.sub(r'[^\w-]', '', text.lower().replace(' ', '-')).strip('-')

    def download_image(self, url, slug):
        target_dir = os.path.join(IMAGES_DIR, slug)
        os.makedirs(target_dir, exist_ok=True)
        target_path = os.path.join(target_dir, "img1.webp")
        try:
            resp = req_lib.get(url, timeout=15)
            img = Image.open(BytesIO(resp.content))
            img.thumbnail((800, 800))
            img.save(target_path, "WEBP", quality=85)
            return f"/imagenes/{slug}/img1.webp"
        except Exception as e:
            print(f"[NINJA] Image error: {e}")
            return url

    def build_all(self):
        if not self.pending_products:
            return
        count = len(self.pending_products)
        listing = "\n".join(
            [f"• {p['title'][:45]} — {p['price']}" for p in self.pending_products])
        if not messagebox.askyesno(
            "CONFIRMAR",
            f"¿Construir {count} producto(s) y subirlos al marketplace?\n\n{listing}"
        ):
            return

        self.build_btn.config(state="disabled", text="⏳ CONSTRUYENDO...")
        threading.Thread(target=self._build_thread, daemon=True).start()

    def _build_thread(self):
        products = []
        if os.path.exists(PRODUCTS_JSON):
            try:
                with open(PRODUCTS_JSON, 'r', encoding='utf-8-sig') as f:
                    c = f.read().strip()
                    if c:
                        products = json.loads(c)
            except Exception:
                products = []

        history = []
        if os.path.exists(HISTORY_JSON):
            try:
                with open(HISTORY_JSON, 'r', encoding='utf-8-sig') as f:
                    c = f.read().strip()
                    if c:
                        history = json.loads(c)
            except Exception:
                history = []

        built = 0
        for p in self.pending_products:
            try:
                slug = self.slugify(p['title'])
                self.root.after(0, lambda t=p['title'][:40]:
                    self.status_lbl.config(text=f"Descargando: {t}..."))

                local_img = p.get('image_url', '')
                if local_img and local_img.startswith('http'):
                    local_img = self.download_image(local_img, slug)

                new_product = {
                    "id": str(int(datetime.now().timestamp() * 1000)),
                    "url": p['url'],  # Affiliate link!
                    "title": p['title'],
                    "price": p['price'],
                    "category": p['category'],
                    "description": p.get('description', p['title']),
                    "image": local_img,
                    "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
                products.append(new_product)
                history.append(new_product)
                built += 1
            except Exception as e:
                print(f"[NINJA] Build error: {e}")

        with open(PRODUCTS_JSON, 'w', encoding='utf-8') as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        with open(HISTORY_JSON, 'w', encoding='utf-8') as f:
            json.dump(history, f, indent=2, ensure_ascii=False)

        self.root.after(0, lambda: self._build_complete(built))

    def _build_complete(self, count):
        self.pending_products.clear()
        self._refresh_table()
        self.build_btn.config(text="✅ CONSTRUIR Y SUBIR AL MARKETPLACE", state="disabled")
        self.status_lbl.config(text=f"✅ {count} producto(s) construidos")
        messagebox.showinfo("ÉXITO",
            f"{count} producto(s) subidos al marketplace.\n\nRefrescá la web para verlos.")


if __name__ == "__main__":
    root = tk.Tk()
    app = NinjaAdmin(root)
    root.mainloop()
