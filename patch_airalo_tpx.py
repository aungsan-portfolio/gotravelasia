import os

targets = [
  "client/src/pages/Home.tsx",
  "client/src/pages/destinations/Phuket.tsx",
  "client/src/pages/destinations/Pai.tsx",
  "client/src/pages/destinations/Krabi.tsx",
  "client/src/pages/destinations/ChiangRai.tsx",
  "client/src/pages/destinations/ChiangMai.tsx",
  "client/src/pages/destinations/Bangkok.tsx",
  "client/src/pages/blog/BestEsimThailand.tsx",
  "client/src/components/StickyCTA.tsx",
  "client/src/components/MobileNav.tsx"
]

involve_asia_link_1 = "https://invol.co/aff_m?aff_id=1072854&source=gotravel&url=https%3A%2F%2Fwww.airalo.com%2Fthailand-esim"
involve_asia_link_2 = "https://invol.co/aff_m?aff_id=1072854&source=gotravel&url=https%3A%2F%2Fwww.airalo.com%2F"
new_tpx_link = "https://airalo.tpx.gr/rLWEywcV"

for path in targets:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace first format
        content = content.replace(involve_asia_link_1, new_tpx_link)

        # Replace second format
        content = content.replace(involve_asia_link_2, new_tpx_link)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {path}")
    else:
        print(f"Missing file: {path}")
