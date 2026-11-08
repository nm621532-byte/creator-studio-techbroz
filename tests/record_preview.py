"""Records a ~22 s tour of all five tabs at 390x844 (Playwright video), for the phone preview.
Usage: python3 tests/record_preview.py http://127.0.0.1:8765/ <out_dir>"""
import sys, os, shutil
from playwright.sync_api import sync_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(args=["--no-sandbox"])
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, record_video_dir=OUT,
                              record_video_size={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    page.goto(URL, wait_until="networkidle")
    page.evaluate("localStorage.clear()")
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(1600)                       # home: five cards
    page.evaluate("location.hash = '#/thumb'")
    page.wait_for_timeout(700)
    page.fill("#w1", "CODE"); page.wait_for_timeout(300)
    page.fill("#w2", "30 SEC"); page.wait_for_timeout(300)
    page.fill("#w3", "DONE"); page.wait_for_timeout(500)
    page.click("#presetChips .chip >> nth=0"); page.wait_for_timeout(1300)   # yellow pop preset
    page.evaluate("location.hash = '#/titles'")
    page.wait_for_timeout(500)
    page.fill("#topic", "login form"); page.wait_for_timeout(300)
    page.click("#titleForm button[type=submit]"); page.wait_for_timeout(1500)
    page.evaluate("location.hash = '#/plan'")
    page.wait_for_timeout(500)
    page.locator("#planList input[type=checkbox] >> nth=0").check(); page.wait_for_timeout(300)
    page.locator("#planList input[type=checkbox] >> nth=1").check(); page.wait_for_timeout(1000)
    page.evaluate("location.hash = '#/script'")
    page.wait_for_timeout(400)
    page.fill("#scriptTopic", "CSS flexbox"); page.wait_for_timeout(200)
    page.click("#scriptForm button[type=submit]"); page.wait_for_timeout(900)
    page.click("#teleOpen"); page.wait_for_timeout(300)
    page.click("#telePlay"); page.wait_for_timeout(2600)
    page.click("#teleClose"); page.wait_for_timeout(300)
    page.evaluate("location.hash = '#/check'")
    page.wait_for_timeout(400)
    page.locator("#checkGroups input[type=checkbox] >> nth=0").check(); page.wait_for_timeout(300)
    page.locator("#checkGroups input[type=checkbox] >> nth=1").check(); page.wait_for_timeout(1200)
    page.evaluate("location.hash = '#/'")
    page.wait_for_timeout(1400)
    video = page.video
    page.close()
    ctx.close()
    src = video.path()
    shutil.copy(src, os.path.join(OUT, "tour.webm"))
    print("VIDEO", os.path.join(OUT, "tour.webm"))
    browser.close()
