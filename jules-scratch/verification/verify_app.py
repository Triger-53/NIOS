from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Go to the home page
    page.goto("http://127.0.0.1:5000")
    page.screenshot(path="jules-scratch/verification/01_home.png")

    # Click on the first unit
    page.click("a:text('Unit 1')")
    page.wait_for_load_state()
    page.screenshot(path="jules-scratch/verification/02_unit.png")

    # Click on the first chapter
    page.click("a:text('Chapter 1')")
    page.wait_for_load_state()
    page.screenshot(path="jules-scratch/verification/03_chapter.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)