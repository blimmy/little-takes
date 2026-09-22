"""End-to-end checks using Chromium's synthetic camera; no real camera is accessed.

Run with Playwright and Pillow installed:
  python tests/browser_test.py [http://127.0.0.1:4175]
Set CHROME_PATH if Chromium is not installed through Playwright.
"""
import io
import json
import os
from pathlib import Path
import sys

from PIL import Image
from playwright.sync_api import sync_playwright, expect

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:4175'
OUT = Path(__file__).resolve().parents[1] / 'test-results'
OUT.mkdir(exist_ok=True)
CHROME = os.environ.get('CHROME_PATH')
MAC_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
if not CHROME and Path(MAC_CHROME).exists():
    CHROME = MAC_CHROME


def run():
    report = []
    with sync_playwright() as p:
        launch = {'headless': True, 'args': ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']}
        if CHROME:
            launch['executable_path'] = CHROME
        browser = p.chromium.launch(**launch)
        context = browser.new_context(viewport={'width': 1440, 'height': 1080}, permissions=['camera'], accept_downloads=True)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL, wait_until='networkidle')
        expect(page.locator('[data-frame]')).to_have_count(8)
        expect(page.locator('[data-sticker]')).to_have_count(24)
        expect(page.locator('#next-step')).to_be_disabled()
        expect(page.locator('#strip-preview')).to_have_attribute('height', '1536')
        page.screenshot(path=str(OUT / 'desktop.png'), full_page=True)
        page.locator('[data-friend="frog"]').click()
        expect(page.locator('.friend-message')).to_contain_text('เคโระ')
        report.append('Initial page, 8 frames, 24 stickers, garden interactions')

        for width in [320, 390, 768, 1024, 1440]:
            page.set_viewport_size({'width': width, 'height': 900})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Horizontal overflow at {width}px'
        report.append('No horizontal overflow at 320, 390, 768, 1024, 1440 px')

        page.locator('[data-frame="berry"]').click()
        page.locator('[data-filter="dream"]').click()
        page.locator('#enable-camera').click()
        expect(page.locator('#camera')).to_be_visible(timeout=15000)
        page.locator('#timer').select_option('3')
        page.locator('#capture').click()
        expect(page.locator('#countdown')).to_be_visible()
        expect(page.locator('[data-layout="grid"]')).to_be_disabled()
        page.locator('#cancel-capture').click()
        expect(page.locator('#countdown')).to_be_hidden()
        page.wait_for_timeout(1150)
        expect(page.locator('.shot-thumb')).to_have_count(0)
        report.append('Countdown cancellation leaves no unwanted photos')

        page.locator('[data-filter="pixel"]').click()
        expect(page.locator('#pixel-camera')).to_be_visible()
        page.locator('#mirror').click()
        expect(page.locator('#mirror')).to_have_attribute('aria-pressed', 'false')
        page.locator('#timer').select_option('0')
        page.locator('#capture').click()
        expect(page.locator('#edit-stage')).to_be_visible(timeout=15000)
        expect(page.locator('.shot-thumb')).to_have_count(3)
        assert page.locator('#camera').evaluate('(v)=>v.srcObject===null'), 'Camera must close when editing'
        report.append('Synthetic camera, pixel filter, mirror toggle, burst capture, camera release')

        page.locator('[data-sticker="bunny"]').click()
        expect(page.locator('#object-selection')).to_be_visible()
        canvas = page.locator('#strip-preview')
        canvas.scroll_into_view_if_needed()
        box = canvas.bounding_box()
        selection = page.locator('#object-selection').bounding_box()
        page.mouse.move(selection['x'] + selection['width'] / 2, selection['y'] + selection['height'] / 2)
        page.mouse.down()
        page.mouse.move(box['x'] + box['width'] * .62, box['y'] + box['height'] * .45, steps=5)
        page.mouse.up()
        page.locator('[data-edit="rotate"]').click()
        page.locator('[data-edit="larger"]').click()
        page.locator('[data-tab="text"]').click()
        page.locator('#text-input').fill('วันนี้ใจฟู ♡')
        page.locator('#add-text').click()
        expect(page.locator('#object-selection')).to_be_visible()
        page.locator('[data-tab="draw"]').click()
        canvas.scroll_into_view_if_needed()
        box = canvas.bounding_box()
        page.mouse.move(box['x'] + box['width'] * .25, box['y'] + box['height'] * .65)
        page.mouse.down()
        page.mouse.move(box['x'] + box['width'] * .72, box['y'] + box['height'] * .69, steps=12)
        page.mouse.up()
        expect(page.locator('#undo')).to_be_enabled()
        page.locator('#undo').click()
        expect(page.locator('#redo')).to_be_enabled()
        page.locator('#redo').click()
        page.locator('#caption').fill('วันที่น่ารักของเรา')
        page.locator('#show-date').uncheck()
        page.screenshot(path=str(OUT / 'editor.png'), full_page=True)
        report.append('Sticker dragging, resizing, rotation, Thai text, drawing, undo/redo, caption')

        page.locator('#next-step').click()
        expect(page.locator('#download')).to_be_enabled(timeout=10000)
        with page.expect_download() as event:
            page.locator('#download').click()
        event.value.save_as(OUT / 'strip.png')
        with Image.open(OUT / 'strip.png') as im:
            assert im.size == (600, 1536)
            assert len(im.getcolors(3000000)) > 30, 'Export must contain a rendered composition'
        page.locator('[data-format="story"]').click()
        expect(page.locator('#file-info')).to_contain_text('1080 × 1920')
        with page.expect_download() as event:
            page.locator('#download').click()
        event.value.save_as(OUT / 'story.png')
        with Image.open(OUT / 'story.png') as im:
            assert im.size == (1080, 1920)
        page.screenshot(path=str(OUT / 'save.png'), full_page=True)
        report.append('PNG strip and 1080 × 1920 story downloads verified')

        page.evaluate("Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false})")
        page.locator('#share').click()
        expect(page.locator('#info-dialog')).to_be_visible()
        expect(page.locator('#dialog-content')).to_contain_text('Instagram')
        page.locator('.dialog-close').click()
        page.evaluate("Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});Object.defineProperty(navigator,'share',{configurable:true,value:async (d)=>window.sharedFile={type:d.files[0].type,size:d.files[0].size}})")
        page.locator('#share').click()
        assert page.evaluate('window.sharedFile.type') == 'image/png'
        report.append('Unsupported-share guidance and native share file handoff')

        page.locator('#reset').click()
        page.locator('#keep-session').click()
        expect(page.locator('#save-stage')).to_be_visible()
        page.locator('#reset').click()
        page.locator('#confirm-reset').click()
        expect(page.locator('.shot-thumb')).to_have_count(0)
        page.locator('[data-layout="grid"]').click()
        page.locator('#demo').click()
        expect(page.locator('#edit-stage')).to_be_visible()
        expect(page.locator('.shot-thumb')).to_have_count(4)
        page.locator('#next-step').click()
        expect(page.locator('#file-info')).to_contain_text('1200 × 1200')
        report.append('Reset confirmation, sample images, and square grid export')

        page.locator('[data-step="1"]').first.click()
        page.locator('[data-layout="polaroid"]').click()
        expect(page.locator('.shot-thumb')).to_have_count(1)
        page.locator('[data-layout="strip4"]').click()
        expect(page.locator('.shot-thumb')).to_have_count(4)
        page.locator('#next-step').click()
        page.locator('#next-step').click()
        expect(page.locator('#file-info')).to_contain_text('600 × 1908')
        report.append('Layout changes preserve existing photos')

        page.locator('#reset').click()
        page.locator('#confirm-reset').click()
        page.locator('[data-layout="polaroid"]').click()
        fake_image = io.BytesIO()
        Image.new('RGB', (800, 600), (50, 150, 90)).save(fake_image, 'PNG')
        page.locator('#file-input').set_input_files({'name': 'own-photo.png', 'mimeType': 'image/png', 'buffer': fake_image.getvalue()})
        expect(page.locator('#edit-stage')).to_be_visible()
        page.locator('#next-step').click()
        expect(page.locator('#file-info')).to_contain_text('900 × 1100')
        report.append('Local image upload and single-photo export')

        page.set_viewport_size({'width': 390, 'height': 844})
        page.screenshot(path=str(OUT / 'mobile-save.png'), full_page=True)
        page.locator('[data-step="2"]').first.click()
        expect(page.locator('#strip-preview')).to_be_visible()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.screenshot(path=str(OUT / 'mobile-editor.png'), full_page=True)
        report.append('Mobile editor and save screens fit the viewport')

        page.locator('#reset').click()
        page.locator('#confirm-reset').click()
        page.evaluate("()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Permission denied','NotAllowedError')}}")
        page.locator('#enable-camera').click()
        expect(page.locator('#camera-error')).to_contain_text('ยังไม่ได้อนุญาต')
        expect(page.locator('#upload')).to_be_enabled()
        page.screenshot(path=str(OUT / 'mobile.png'), full_page=True)
        report.append('Denied camera permission retains upload fallback')
        assert not errors, errors
        report.append('No uncaught browser errors')
        browser.close()
    (OUT / 'report.json').write_text(json.dumps({'passed': report}, ensure_ascii=False, indent=2))
    print(json.dumps({'passed': report}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    run()
