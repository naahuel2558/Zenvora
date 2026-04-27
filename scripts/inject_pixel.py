import os

pixel_code = """    <!-- Meta Pixel Code -->
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '1313162720725181');
    fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=1313162720725181&ev=PageView&noscript=1"
    /></noscript>
    <!-- End Meta Pixel Code -->
"""

pages_dir = r"c:\Users\Lautaro\.gemini\antigravity\scratch\Fitnees\pages"

for filename in os.listdir(pages_dir):
    if filename.endswith(".html"):
        filepath = os.path.join(pages_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if "Meta Pixel Code" not in content:
            if "</body>" in content:
                new_content = content.replace("</body>", pixel_code + "</body>")
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Pixel inyectado en {filename}")
            else:
                print(f"No se encontró </body> en {filename}")
        else:
            print(f"El Pixel ya existe en {filename}")
