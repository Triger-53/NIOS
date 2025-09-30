import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# --- Supabase Credentials ---
# Make sure to set these in your .env file or as environment variables
# SUPABASE_URL="https://your-project-id.supabase.co"
# SUPABASE_KEY="your-service-role-key" # Use the service_role key for server-side operations
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# --- Initialize Supabase Client ---
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL and Key must be set in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_json_to_supabase(subject: str, book_title: str, merged_json: dict):
    """
    Uploads JSON content chunks to the Supabase 'books' table.

    Args:
        subject (str): The subject of the book (e.g., "english").
        book_title (str): The title of the book.
        merged_json (dict): The JSON object containing the book's content chunks.
                          Expected format: {"contents": [...]}.
    """
    contents = merged_json.get("contents", [])

    if not contents:
        print("No content found in the JSON to upload.")
        return

    print(f"Starting upload for subject: {subject}, book: {book_title}")

    for idx, chunk in enumerate(contents):
        data_to_insert = {
            "subject": subject,
            "book_title": book_title,
            "chunk_index": idx,
            "content": chunk  # 'chunk' is the JSONB content
        }

        try:
            response = supabase.table("books").insert(data_to_insert).execute()

            # Check if the response indicates an error
            if response.data:
                 print(f"Successfully inserted chunk {idx} for '{book_title}'.")
            else:
                 print(f"Possible issue inserting chunk {idx}. Response: {response}")

        except Exception as e:
            print(f"An error occurred inserting chunk {idx}: {e}")

# --- Example Usage ---
if __name__ == "__main__":
    # 1. Define your book details
    subject_name = "english"
    title_of_book = "Advanced English Grammar"

    # 2. Your merged JSON data from the AI pipeline
    # This is a sample structure. Replace it with your actual JSON data.
    sample_merged_json = {
        "contents": [
            {
                "chapter": "Chapter 1: The Tenses",
                "summary": "This chapter covers the past, present, and future tenses in English.",
                "keywords": ["tense", "grammar", "verb"]
            },
            {
                "chapter": "Chapter 2: Nouns and Pronouns",
                "summary": "A deep dive into different types of nouns and their corresponding pronouns.",
                "keywords": ["noun", "pronoun", "subject", "object"]
            }
        ]
    }

    # 3. Call the upload function
    # Before running, ensure you have a .env file in the same directory with:
    # SUPABASE_URL=...
    # SUPABASE_KEY=... (use your service_role key for write access)
    print("Running the upload script...")
    upload_json_to_supabase(subject_name, title_of_book, sample_merged_json)
    print("Upload script finished.")