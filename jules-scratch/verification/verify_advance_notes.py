from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000/advance-notes")
        page.wait_for_selector('a[href="/advance-notes/Accountancy"]')
        page.screenshot(path="jules-scratch/verification/advance-notes.png")
        browser.close()

run()
