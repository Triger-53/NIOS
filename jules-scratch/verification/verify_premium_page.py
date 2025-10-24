
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Register a new user
        page.goto("http://localhost:3000/register")
        page.get_by_label("Full Name").fill("Test User")
        page.get_by_label("Email").fill("test@example.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Register").click()
        page.wait_for_load_state("networkidle")

        # Log in with the new user
        page.goto("http://localhost:3000/login")
        page.get_by_label("Email").fill("test@example.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Login").click()
        page.wait_for_load_state("networkidle")

        # Go to the premium page
        page.goto("http://localhost:3000/premium")
        page.wait_for_load_state("networkidle")

        # Click the dots icon to open the menu
        page.click('button:has([class*="DotsVerticalIcon"])')

        # Wait for the menu to be visible
        page.wait_for_selector('[role="menu"]')

        page.screenshot(path="jules-scratch/verification/verification.png")
        browser.close()

if __name__ == "__main__":
    run()
