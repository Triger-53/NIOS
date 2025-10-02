from playwright.sync_api import sync_playwright, expect, Page

def verify_changes(page: Page):
    """
    This script verifies that the application correctly loads subject data
    from JSON files and displays it on the frontend.
    """
    # 1. Navigate to the homepage.
    print("Navigating to http://localhost:3000")
    page.goto("http://localhost:3000", timeout=60000)

    # Wait for the main heading to ensure the page is loaded.
    expect(page.get_by_role("heading", name="Master NIOS Class 10 in 1 Day (English Medium)")).to_be_visible()
    print("Homepage loaded.")

    # 2. Click the link to go to the main subjects page.
    print("Clicking 'Start Learning' link.")
    page.get_by_role("link", name="📘 Start Learning").click()

    # 3. Wait for the subjects page to load and verify the heading.
    print("Waiting for subjects page...")
    page.wait_for_url("http://localhost:3000/subjects")
    expect(page.get_by_role("heading", name="All Subjects")).to_be_visible()
    print("Subjects page loaded.")

    # 4. Find and click the link for the "Accountancy" subject.
    # We target the card that contains the "Accountancy" heading.
    print("Finding and clicking 'Accountancy' subject...")
    accountancy_card = page.locator("div.card:has-text('Accountancy')")
    accountancy_link = accountancy_card.get_by_role("link", name="View Notes →")
    accountancy_link.click()

    # 5. Wait for the subject detail page to load and verify content.
    print("Waiting for Accountancy page...")
    page.wait_for_url("http://localhost:3000/subjects/accountancy")
    expect(page.get_by_role("heading", name="Accountancy")).to_be_visible()
    expect(page.get_by_text("INTRODUCTION TO ACCOUNTING")).to_be_visible()
    print("Accountancy page loaded.")

    # 6. Take a screenshot for visual verification.
    screenshot_path = "jules-scratch/verification/verification.png"
    print(f"Taking screenshot: {screenshot_path}")
    page.screenshot(path=screenshot_path, full_page=True)
    print("Screenshot taken.")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_changes(page)
        finally:
            browser.close()

if __name__ == "__main__":
    main()