import requests
import re
import json

url = "https://www.mercadolibre.com.ar/disco-bumper-olimpico-5-kg-goma-premium-virgen-iwf-standard-negro/p/MLA29544058"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

r = requests.get(url, headers=headers, timeout=15)

# Method 1: __PRELOADED_STATE__
preloaded = re.search(r"window\.__PRELOADED_STATE__\s*=\s*({.*?});\s*</script>", r.text, re.DOTALL)
if preloaded:
    try:
        state = json.loads(preloaded.group(1))
        print("PRELOADED_STATE found!")
        print(json.dumps(list(state.keys())[:10], indent=2))
    except:
        print("PRELOADED_STATE parse failed")

# Method 2: Search for product name patterns in script tags
name_matches = re.findall(r'"name"\s*:\s*"([^"]{10,100})"', r.text)
print(f"\nName fields found: {len(name_matches)}")
for n in name_matches[:5]:
    print(f"  {n}")

# Method 3: price patterns
price_matches = re.findall(r'"price"\s*:\s*(\d+\.?\d*)', r.text)
print(f"\nPrice fields found: {len(price_matches)}")
for p in price_matches[:5]:
    print(f"  ${p}")

# Method 4: og: meta tags
og_title = re.search(r'property="og:title"\s+content="([^"]*)"', r.text)
og_image = re.search(r'property="og:image"\s+content="([^"]*)"', r.text)
print(f"\nog:title: {og_title.group(1) if og_title else 'N/A'}")
print(f"og:image: {og_image.group(1)[:100] if og_image else 'N/A'}")

# Method 5: Schema from scripts
schemas = re.findall(r'"@type"\s*:\s*"Product"', r.text)
print(f"\nProduct schema matches: {len(schemas)}")
