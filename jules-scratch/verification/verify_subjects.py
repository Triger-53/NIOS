from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the subjects page
            page.goto("http://localhost:3000/subjects")

            # Expect the main heading to be visible
            expect(page.get_by_role("heading", name="All Subjects")).to_be_visible()

            # Find the "Accountancy" card and click its "View Notes" link
            accountancy_card = page.locator("div.card", has_text="Accountancy").first
            expect(accountancy_card).to_be_visible()

            view_notes_link = accountancy_card.get_by_role("link", name="View Notes →")
            view_notes_link.click()

            # Wait for navigation and expect the page title to match the subject
            expect(page.get_by_role("heading", name="Accountancy")).to_be_visible()

        except Exception as e:
            print(f"An error occurred during verification: {e}")

        finally:
            # Take a screenshot regardless of whether the test passed or failed
            page.screenshot(path="jules-scratch/verification/verification.png")
            browser.close()

if __name__ == "__main__":
    run_verification()