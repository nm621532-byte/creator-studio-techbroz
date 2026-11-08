# Creator Studio by Tab

YouTube creators ke liye ek chhota, phone-first web app. Thumbnail banao, title aur tags nikaalo, 30 din ka plan rakho, Shorts ki script aur teleprompter, aur channel checklist. Bina backend, bina API key, bina account ke. Ek baar khulne ke baad offline bhi chalta hai.

**Live:** https://creator-studio-tab.sites.tab.bot/
**Preview (phone screen, 19 sec):** [`docs/preview.mp4`](docs/preview.mp4)

## Kya kya hai (5 tabs)

1. **Thumbnail Maker** — gallery se photo lo ya gradient chuno. 3-4 bold words likho, colour, font, position, arrow, glow, emoji sticker lagao. Preview 1280×720 mein live dikhta hai. PNG download karo.
   - Rules: 3 words se kam rakho, ek hi colour series mein. Presets (Yellow pop, Clean white, Cyan tech, Red alert) ek click mein set ho jaate hain.
2. **Title + Tags** — topic aur language likho. 10 search-phrase-first titles (sab 60 characters ke andar), description (line 2 mein free editor ka link), 12-15 tags, aur exactly 3 hashtags. Har cheez ke saath Copy button.
   - Ye templates se bante hain, koi AI nahi. Final title ek baar padh lo.
3. **30-Day Planner** — Coding ya Shop niche chuno. Har din ek Short, aur 6 din long video (ek din rest). Checkboxes localStorage mein save hote hain. Text export (copy) bhi hai.
4. **Short Script** — Hook, problem, demo, payoff, CTA (Hinglish templates). 25 second ka timing guide. Teleprompter mein big text scroll hota hai, speed aur size slider ke saath.
5. **Channel Checklist** — SEO, thumbnail, Shorts aur upload routine ki checklist. Progress save hota hai.

## Phone par install kaise karein

1. Chrome mein https://creator-studio-tab.sites.tab.bot/ kholo.
2. Upar right ke ⋮ menu se **Install app** (ya **Add to Home screen**) dabao.
3. Home screen par icon aa jaayega. Ab ye app ki tarah khulega.

Pehli baar internet chahiye (app ki files download hoti hain). Uske baad flight mode mein bhi khulega.

## Chalane ke liye (computer par)

```bash
# sirf static files hain: site/ folder kisi bhi static server se chalao
cd site && python3 -m http.server 8080
# phir http://localhost:8080 kholo

# unit tests (generators)
node --test tests/
```

`tests/e2e.py` (Playwright) ek browser mein 390×844 par saare tabs check karta hai: console errors, PNG download, offline reload.

## Project structure

```
site/                 deploy hone wali static app
  index.html          home + saare tabs
  css/app.css         dark studio theme
  js/gen.js           titles, description, tags, plan, script, checklist (pure functions)
  js/thumb.js         canvas thumbnail renderer (1280×720)
  js/app.js           UI, routing, storage, copy, install prompt
  sw.js               service worker (offline cache)
  manifest.webmanifest, icons/
tests/
  gen.test.mjs        node --test unit tests
  e2e.py              Playwright smoke test
  record_preview.py   preview video recorder
docs/preview.mp4      phone preview
```

## Limits (imandari se)

- Ye ek web app hai. Abhi tak isko kisi asli Android phone par test nahi kiya gaya. Desktop Chrome aur 390×844 mobile viewport par test hua hai. Install aur offline behaviour phone par ek baar check karna.
- Thumbnail font aapke phone ke system fonts par chalte hain (Android par "Arial Black" nahi ho to Roboto bold use hota hai).
- Titles aur tags templates se bante hain. Ye SEO ka shortcut hai, jaadu nahi. Apne video ke asli content se match karna zaroori hai.
- Planner aur checklist ka data sirf is phone ke browser mein save hota hai. Cloud sync nahi hai.
- Emoji sticker phone ke emoji font par depend karta hai.

## License

Abhi koi license nahi lagaya gaya. Code dekhne aur chalane ke liye hai; reuse se pehle poochh lo.
