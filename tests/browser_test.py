"""Five-stage booth checks with Chromium's synthetic camera (no physical camera).
Run: python tests/browser_test.py [http://127.0.0.1:4175]
Requires Playwright and Pillow; CHROME_PATH can select an installed Chrome.
"""
import io
import json
import os
from pathlib import Path
import subprocess
import sys
from PIL import Image, ImageChops, ImageStat
from playwright.sync_api import sync_playwright, expect

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:4175'
OUT = Path(__file__).resolve().parents[1] / 'test-results'
OUT.mkdir(exist_ok=True)
CHROME = os.environ.get('CHROME_PATH')
MAC_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
if not CHROME and Path(MAC_CHROME).exists():
    CHROME = MAC_CHROME


def widths(page, stage):
    for width in [320, 390, 768, 1024, 1440]:
        page.set_viewport_size({'width': width, 'height': 900})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Stage {stage} overflows at {width}px'
    page.set_viewport_size({'width': 390, 'height': 844})
    page.locator(f'#stage-{stage}').scroll_into_view_if_needed()
    page.screenshot(path=str(OUT / f'retro-mobile-stage-{stage}.png'))
    page.set_viewport_size({'width': 1440, 'height': 1000})


def download(page, selector, name):
    with page.expect_download(timeout=45000) as event:
        page.locator(selector).click()
    event.value.save_as(OUT / name)
    return event.value.suggested_filename


def decode_video(name, size):
    probe, ffmpeg = Path('/opt/homebrew/bin/ffprobe'), Path('/opt/homebrew/bin/ffmpeg')
    if not probe.exists():
        return 'Video downloaded; install ffmpeg for decode verification'
    path = str(OUT / name)
    info = json.loads(subprocess.check_output([str(probe), '-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', path]))
    video = next(s for s in info['streams'] if s['codec_type'] == 'video')
    assert (video['width'], video['height']) == size, video
    assert 5.5 <= float(info['format']['duration']) <= 7.5, info['format']
    assert int(video['nb_read_frames']) >= 45, video
    frames = []
    for position in ['0.3', '1.1']:
        data = subprocess.check_output([str(ffmpeg), '-v', 'error', '-ss', position, '-i', path, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'])
        frames.append(Image.open(io.BytesIO(data)).convert('RGB'))
    assert sum(ImageStat.Stat(ImageChops.difference(*frames)).mean) > .1, 'Export must contain motion'
    return f"Decoded {video['codec_name']}: {video['nb_read_frames']} moving frames at {size}"


def run():
    report = []
    with sync_playwright() as p:
        launch = {'headless': True, 'args': ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']}
        if CHROME:
            launch['executable_path'] = CHROME
        browser = p.chromium.launch(**launch)
        page = browser.new_page(viewport={'width': 1440, 'height': 1000}, permissions=['camera'], accept_downloads=True, reduced_motion='reduce')
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL, wait_until='networkidle')
        for selector, count in [('[data-layout]', 20), ('[data-sticker]', 64), ('[data-frame]', 12), ('[data-filter]', 7)]:
            expect(page.locator(selector)).to_have_count(count)
        page.locator('[data-layout-category="special"]').click()
        expect(page.locator('[data-layout]')).to_have_count(3)
        page.locator('[data-layout-category="all"]').click()
        page.locator('[data-layout="strip3"]').click()
        widths(page, 1)
        page.screenshot(path=str(OUT / 'retro-desktop-final.png'), full_page=True)
        page.locator('#choose-frame').click()
        expect(page.locator('#photo-counter')).to_have_text('0 / 8')
        expect(page.locator('#finish-capture')).to_be_disabled()
        widths(page, 2)
        report.append('20 templates, categories, 64 PNG stickers, 12 pastel palettes, seven filters')
        page.locator('#enable-camera').click()
        expect(page.locator('#camera')).to_be_visible(timeout=15000)
        for timer, indicator in [('3', '#countdown'), ('0', '#live-recording')]:
            page.locator('#timer').select_option(timer)
            page.locator('#capture').click()
            expect(page.locator(indicator)).to_be_visible()
            page.locator('#cancel-capture').click()
            expect(page.locator('#capture')).to_be_enabled()
            expect(page.locator('#photo-counter')).to_have_text('0 / 8')
        report.append('Countdown and Live cancellation leave no unwanted photos')
        page.locator('#mirror').click()
        expect(page.locator('#mirror')).to_have_attribute('aria-pressed', 'false')
        for count in range(1, 4):
            page.locator('#capture').click()
            expect(page.locator('#photo-counter')).to_have_text(f'{count} / 8', timeout=10000)
            expect(page.locator('#capture')).to_be_enabled()
        expect(page.locator('#finish-capture')).to_be_enabled()
        expect(page.locator('#photo-tray [data-live-photo]')).to_have_count(3)
        page.locator('#burst-capture').click()
        expect(page.locator('#photo-counter')).to_have_text('8 / 8', timeout=25000)
        expect(page.locator('#capture')).to_be_disabled()
        expect(page.locator('#burst-capture')).to_be_disabled()
        expect(page.locator('#photo-tray [data-live-photo]')).to_have_count(8)
        page.locator('#photo-tray [data-live-photo]').first.click()
        page.wait_for_function('document.querySelector("#dialog-content video").currentTime > .1')
        page.locator('.dialog-close').click()
        page.locator('#finish-capture').click()
        assert page.locator('#camera').evaluate('(v)=>v.srcObject===null')
        report.append('Eight still/Live pairs, eight-photo cap, early finish after three, camera release')
        ids = page.locator('[data-pick-photo]').evaluate_all('(els)=>els.map(e=>e.dataset.pickPhoto)')
        for i in [7, 2, 5]:
            page.locator(f'[data-pick-photo="{ids[i]}"]').click()
        expect(page.locator('#selection-count')).to_have_text('3 / 3 ช่อง')
        expect(page.locator('[data-slot="0"]')).to_have_attribute('aria-label', 'ช่องที่ 1 รูปที่ 8')
        page.locator('[data-slot="0"]').click()
        page.locator(f'[data-pick-photo="{ids[2]}"]').click()
        expect(page.locator('[data-slot="1"]')).to_have_attribute('aria-label', 'ช่องที่ 2 รูปที่ 8')
        expect(page.locator('.contact-pick.selected')).to_have_count(3)
        widths(page, 3)
        page.locator('#finish-selection').click()
        report.append('Select three favorites from eight; slot order can be swapped')
        page.locator('[data-tab="colors"]').click()
        page.locator('[data-frame="peach"]').click()
        page.locator('#frame-bg').evaluate("e=>{e.value='#fff3dd';e.dispatchEvent(new Event('change',{bubbles:true}))}")
        previous = page.locator('#strip-preview').evaluate('(c)=>c.toDataURL()')
        page.locator('[data-filter="ascii"]').click()
        page.wait_for_function('old=>document.querySelector("#strip-preview").toDataURL()!==old', arg=previous)
        page.locator('[data-filter="peach"]').click()
        page.locator('[data-tab="stickers"]').click()
        page.locator('[data-sticker="bunny"]').click()
        expect(page.locator('#object-selection')).to_be_visible()
        canvas = page.locator('#strip-preview')
        canvas.scroll_into_view_if_needed()
        box, selection = canvas.bounding_box(), page.locator('#object-selection').bounding_box()
        page.mouse.move(selection['x'] + selection['width'] / 2, selection['y'] + selection['height'] / 2)
        page.mouse.down()
        page.mouse.move(box['x'] + box['width'] * .65, box['y'] + box['height'] * .45, steps=6)
        page.mouse.up()
        page.locator('[data-edit="rotate"]').click()
        page.locator('[data-edit="larger"]').click()
        custom = io.BytesIO()
        Image.new('RGBA', (64, 64), (200, 100, 50, 110)).save(custom, 'PNG')
        page.locator('#sticker-input').set_input_files({'name': 'custom.png', 'mimeType': 'image/png', 'buffer': custom.getvalue()})
        page.locator('[data-tab="text"]').click()
        page.locator('#text-input').fill('วันนี้ใจฟู ♡')
        page.locator('#add-text').click()
        page.locator('[data-tab="draw"]').click()
        canvas.scroll_into_view_if_needed()
        box = canvas.bounding_box()
        page.mouse.move(box['x'] + box['width'] * .2, box['y'] + box['height'] * .7)
        page.mouse.down()
        page.mouse.move(box['x'] + box['width'] * .8, box['y'] + box['height'] * .75, steps=12)
        page.mouse.up()
        page.locator('#undo').click()
        expect(page.locator('#redo')).to_be_enabled()
        page.locator('#redo').click()
        page.locator('#caption').fill('วันที่น่ารักของเรา')
        page.locator('#show-date').uncheck()
        widths(page, 4)
        page.screenshot(path=str(OUT / 'retro-editor-final.png'), full_page=True)
        page.locator('#finish-decoration').click()
        expect(page.locator('#download')).to_be_enabled(timeout=10000)
        report.append('Custom colors, ASCII filter, PNG import, transforms, Thai lettering, drawing, undo/redo')
        download(page, '#download', 'retro-live-strip.png')
        with Image.open(OUT / 'retro-live-strip.png') as im:
            assert im.size == (600, 1536)
            assert len(im.getcolors(3000000)) > 100
        page.locator('#preview-live').click()
        expect(page.locator('#video-progress')).to_be_visible()
        page.locator('#cancel-export').click()
        expect(page.locator('#video-progress')).to_be_hidden()
        expect(page.locator('body > video')).to_have_count(0)
        filename = download(page, '#download-video', 'retro-live-video.mp4')
        assert filename.endswith(('.mp4', '.webm'))
        expect(page.locator('#save-video')).to_be_visible()
        report.append(decode_video('retro-live-video.mp4', (600, 1536)))
        page.evaluate("Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});Object.defineProperty(navigator,'share',{configurable:true,value:async d=>window.sharedFile={type:d.files[0].type,size:d.files[0].size}})")
        page.locator('#share').click()
        assert page.evaluate('window.sharedFile.type').startswith('video/')
        page.locator('[data-format="story"]').click()
        expect(page.locator('#file-info')).to_contain_text('1080 × 1920')
        download(page, '#download', 'retro-live-story.png')
        with Image.open(OUT / 'retro-live-story.png') as im:
            assert im.size == (1080, 1920)
        download(page, '#download-video', 'retro-live-story.mp4')
        report.append(decode_video('retro-live-story.mp4', (1080, 1920)))
        page.locator('#preview-still').click()
        page.locator('#share').click()
        assert page.evaluate('window.sharedFile.type') == 'image/png'
        page.evaluate("Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false})")
        page.locator('#share').click()
        expect(page.locator('#dialog-content')).to_contain_text('Instagram')
        page.locator('.dialog-close').click()
        widths(page, 5)
        report.append('PNG/video downloads, Story size, export cancellation, file sharing and fallback')
        page.locator('[data-step="1"]').first.click()
        page.locator('[data-layout="grid8"]').click()
        page.locator('[data-step="3"]').first.click()
        expect(page.locator('[data-pick-photo]')).to_have_count(8)
        page.locator('#clear-slots').click()
        expect(page.locator('#finish-selection')).to_be_disabled()
        page.locator('#auto-fill').click()
        expect(page.locator('#selection-count')).to_have_text('8 / 8 ช่อง')
        page.locator('#close-window').click()
        page.locator('#keep-session').click()
        expect(page.locator('#stage-3')).to_be_visible()
        page.locator('#close-window').click()
        page.locator('#confirm-reset').click()
        expect(page.locator('#stage-1')).to_be_visible()
        expect(page.locator('#photo-counter')).to_have_text('0 / 8')
        page.locator('[data-layout="polaroid"]').click()
        page.locator('#choose-frame').click()
        page.evaluate("()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Permission denied','NotAllowedError')}}")
        page.locator('#enable-camera').click()
        expect(page.locator('#camera-error')).to_contain_text('ยังไม่ได้อนุญาต')
        expect(page.locator('#upload')).to_be_enabled()
        page.locator('#file-input').set_input_files({'name': 'own-photo.png', 'mimeType': 'image/png', 'buffer': custom.getvalue()})
        expect(page.locator('#photo-counter')).to_have_text('1 / 8')
        expect(page.locator('#finish-capture')).to_be_enabled()
        page.locator('#finish-capture').click()
        page.locator('[data-pick-photo]').click()
        page.locator('#finish-selection').click()
        page.locator('#finish-decoration').click()
        expect(page.locator('#file-info')).to_contain_text('900 × 1100')
        report.append('Layout changes preserve originals; reset, denied camera and upload-only sessions')
        assert not errors, errors
        report.append('All five stages fit 320–1440 px; no uncaught browser errors')
        browser.close()
    (OUT / 'report.json').write_text(json.dumps({'passed': report}, ensure_ascii=False, indent=2))
    print(json.dumps({'passed': report}, ensure_ascii=False, indent=2), flush=True)


if __name__ == '__main__':
    run()
