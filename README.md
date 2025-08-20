# Terminal CV — CLI tarzı özgeçmiş sitesi

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=fff)](https://vitejs.dev)
[![Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-000?logo=github)](https://pages.github.com)

**Canlı Demo:** **https://OAdede.github.io/terminal-cv/**

CLI (terminal) temalı, hızlı ve teknik bir CV/portfolyo. `help`, `projects`, `skills`, `theme` gibi
komutlarla gezilebilir; `Tab` ile autocomplete, `↑/↓` ile komut geçmişi vardır.

> Teknik izleyici için “no-bullshit” sunum: hızlı açılır, klavye ile akıcı gezilir.

---

## 🎯 Özellikler
- Terminal arayüzü: komutlar, autocomplete, komut geçmişi
- Tema seçimi: `dark`, `amber`, `light`, `matrix`, `cyber`, `paper`
- **Accent** rengi: `accent #RRGGBB` / `accent reset`
- Prompt özelleştirme: `prompt set ozan@cv:$`
- Banner (ASCII) aç/kapat: `banner on/off`
- Hızlı linkler: `open github|linkedin|cv`, `copy email`
- PDF CV’yi yeni sekmede açma: `cv`
- İçerikler kolayca düzenlenir: `src/data/projects.js`, `src/data/skills.js`

---

## ⌨️ Komutlar (kısa liste)

~~~text
help [komut]          # genel yardım / alt yardım
about                 # kısaca ben
projects [ad]         # projeler (tek proje için ad gir)
skills [kategori]     # frontend | backend | devops | embedded | network
contact               # e-posta ve linkler
social                # kısayol ipuçları
open github|linkedin|cv
copy email
cv                    # PDF CV’yi aç
theme list | theme <dark|amber|light|matrix|cyber|paper>
accent #00ff5a | accent reset
prompt set ozan@cv:$ | prompt reset
banner on | banner off
clear
~~~

---

## 🛠️ Kurulum & Geliştirme

~~~bash
npm install
npm run dev
# üretim derlemesi
npm run build
~~~

> Node 18+ önerilir.

---

## 🌐 Yayınlama

### A) gh-pages (manuel)

~~~bash
npm run deploy
~~~

Bu komut `dist/` içeriğini **gh-pages** dalına yollar.  
`vite.config.js` içinde **`base: "/terminal-cv/",`** olmalıdır.

### B) GitHub Actions (otomatik)

`.github/workflows/deploy.yml` ile **main** dalına her push’ta otomatik build & publish.  
**Settings → Pages → Source:** *GitHub Actions* olmalı.

~~~yaml
name: Deploy Vite site to GitHub Pages
on: { push: { branches: [ main ] } }
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: "pages", cancel-in-progress: false }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages }
    steps:
      - uses: actions/deploy-pages@v4
~~~

---

## 🧩 Özelleştirme
- Projeler / Yetenekler: `src/data/projects.js`, `src/data/skills.js`
- Tema renkleri & stiller: `src/styles/theme.css`
- Banner (ASCII): `src/lib/ascii.js`
- PDF adı: `public/OzanAhmetDede-CV.pdf`  
  (Kodda yol: `import.meta.env.BASE_URL + "OzanAhmetDede-CV.pdf"`)

---

## 🧰 Teknolojiler
React 19 • Vite 7 • GitHub Pages • Vanilla CSS (JetBrains Mono)

---

## 📸 Sosyal Önizleme (opsiyonel)
Repo **Settings → Social preview** kısmına 1200×630 bir görsel yükle.  
`index.html` içine OG etiketleri eklemek istersen:

~~~html
<meta property="og:title" content="Terminal CV — Ozan Ahmet Dede">
<meta property="og:description" content="CLI tarzı, hızlı ve teknik bir CV">
<meta property="og:image" content="/og.png">
<meta name="twitter:card" content="summary_large_image">
~~~

---

## ✉️ İletişim
- E-posta: **dedeozanahmet@gmail.com**
- GitHub: **https://github.com/OAdede**
- LinkedIn: **https://www.linkedin.com/in/ozanahmetdede**
