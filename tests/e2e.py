"""End-to-end smoke test: five tabs at 390x844, console errors, PNG download, offline reload.
Usage: python3 tests/e2e.py http://127.0.0.1:8765/ <out_dir>"""
import sys, os, json, struct
from playwright.sync_api import sync_playwright

URL = sys.argv[1]
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)
errors = []
results = {}

def go(h):
    page.evaluate("h => { location.hash = h; }", h)
    page.wait_for_timeout(250)

def png_size(path):
    with open(path, "rb") as f:
        head = f.read(24)
    return struct.unpack(">II", head[16:24])

with sync_playwright() as p:
    browser = p.chromium.launch(args=["--no-sandbox"])
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, accept_downloads=True, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    page.on("console", lambda m: errors.append(f"console.{m.type}: {m.text}") if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    page.goto(URL, wait_until="networkidle")
    page.click("#brand")  # home link works
    page.wait_for_timeout(200)
    page.wait_for_timeout(600)

    # home: five cards
    cards = page.locator("a.card")
    results["home_cards"] = cards.count()
    page.screenshot(path=f"{OUT}/01-home.png")
    overflow = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
    results["home_horizontal_overflow_px"] = overflow

    # back button from a tab returns home
    go("#/thumb")
    page.click("#back")
    page.wait_for_timeout(250)
    results["back_button_home"] = page.locator("#view-home").is_visible()

    # thumbnail maker
    go("#/thumb")
    page.wait_for_timeout(400)
    page.fill("#w1", "CODE")
    page.fill("#w2", "30 SEC")
    page.fill("#w3", "DONE")
    page.click("#presetChips .chip >> nth=0")
    page.wait_for_timeout(200)
    # upload a gallery photo (generated)
    from PIL import Image, ImageDraw
    photo = f"{OUT}/test-photo.jpg"
    im = Image.new("RGB", (900, 1200), (40, 90, 140))
    d = ImageDraw.Draw(im)
    for i in range(0, 1200, 60):
        d.rectangle([0, i, 900, i + 30], fill=(200 - i // 8, 120, 60 + i // 10))
    im.save(photo, quality=90)
    page.set_input_files("#thumbPhoto", photo)
    page.wait_for_timeout(500)
    page.fill("#w4", "")
    page.screenshot(path=f"{OUT}/02-thumb.png")
    with page.expect_download() as dl:
        page.click("#thumbDownload")
    dpath = f"{OUT}/thumbnail-test.png"
    dl.value.save_as(dpath)
    results["thumb_png_size"] = png_size(dpath)
    results["thumb_rules_text"] = page.inner_text("#thumbRules")

    # titles
    go("#/titles")
    page.wait_for_timeout(300)
    page.fill("#topic", "login form")
    page.click("#titleForm button[type=submit]")
    page.wait_for_timeout(300)
    results["title_count"] = page.locator("#titleList li").count()
    results["hash_text"] = page.inner_text("#hashBox")
    page.screenshot(path=f"{OUT}/03-titles.png", full_page=True)

    # planner
    go("#/plan")
    page.wait_for_timeout(300)
    page.locator("#planList input[type=checkbox] >> nth=0").check()
    page.wait_for_timeout(150)
    results["plan_progress_after_tick"] = page.inner_text("#planProgress")
    page.screenshot(path=f"{OUT}/04-plan.png")
    page.reload(wait_until="networkidle")
    go("#/plan")
    page.wait_for_timeout(300)
    results["plan_progress_after_reload"] = page.inner_text("#planProgress")

    # script + teleprompter
    go("#/script")
    page.wait_for_timeout(300)
    page.fill("#scriptTopic", "CSS flexbox")
    page.click("#scriptForm button[type=submit]")
    page.wait_for_timeout(300)
    results["script_stats"] = page.inner_text("#scriptStats")
    page.screenshot(path=f"{OUT}/05-script.png")
    page.click("#teleOpen")
    page.wait_for_timeout(200)
    page.click("#telePlay")
    page.wait_for_timeout(1500)
    y1 = page.evaluate("document.getElementById('teleText').style.transform")
    results["tele_transform_after_play"] = y1
    page.screenshot(path=f"{OUT}/06-teleprompter.png")
    page.click("#teleClose")

    # checklist
    go("#/check")
    page.wait_for_timeout(300)
    page.locator("#checkGroups input[type=checkbox] >> nth=0").check()
    results["check_progress"] = page.inner_text("#checkProgress")
    page.screenshot(path=f"{OUT}/07-check.png", full_page=True)

    # service worker + offline reload
    sw_ready = page.evaluate("navigator.serviceWorker.ready.then(r => !!r.active).catch(() => false)")
    results["sw_active"] = sw_ready
    page.wait_for_timeout(500)
    ctx.set_offline(True)
    page.reload(wait_until="domcontentloaded")
    page.wait_for_timeout(500)
    results["offline_home_cards"] = page.locator("a.card").count()
    ctx.set_offline(False)

    browser.close()

results["console_errors"] = errors
with open(f"{OUT}/results.json", "w") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
print(json.dumps(results, indent=2, ensure_ascii=False))
