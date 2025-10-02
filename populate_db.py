import json
import sqlite3

def populate_database():
    # Connect to the SQLite database (or create it if it doesn't exist)
    conn = sqlite3.connect('book.db')
    cursor = conn.cursor()

    # Read the schema and create tables
    with open('schema.sql', 'r') as f:
        schema = f.read()
        cursor.executescript(schema)

    # Read the JSON data
    with open('english.json', 'r') as f:
        data = json.load(f)

    # Insert book metadata
    metadata = data['metadata']
    cursor.execute("INSERT INTO books (book_title, subject, class, source) VALUES (?, ?, ?, ?)",
                   (metadata['book_title'], metadata['subject'], metadata['class'], metadata['source']))
    book_id = cursor.lastrowid

    # Insert content
    for unit in data['contents']:
        if unit is None:
            continue
        cursor.execute("INSERT INTO units (book_id, unit_no, unit_title) VALUES (?, ?, ?)",
                       (book_id, unit.get('unit_no'), unit.get('unit_title')))
        unit_id = cursor.lastrowid

        if 'chapters' in unit and unit['chapters']:
            for chapter in unit['chapters']:
                if chapter is None:
                    continue
                cursor.execute("INSERT INTO chapters (unit_id, chapter_no, chapter_title) VALUES (?, ?, ?)",
                               (unit_id, chapter.get('chapter_no'), chapter.get('chapter_title')))
                chapter_id = cursor.lastrowid

                if 'sections' in chapter and chapter['sections']:
                    for section in chapter['sections']:
                        if section is None:
                            continue
                        cursor.execute("INSERT INTO sections (chapter_id, section_no, section_title, type) VALUES (?, ?, ?, ?)",
                                       (chapter_id, section.get('section_no'), section.get('section_title'), section.get('type')))
                        section_id = cursor.lastrowid

                        if 'content' in section and section['content']:
                            for content_block in section['content']:
                                if content_block is None:
                                    continue
                                cursor.execute("INSERT INTO content_blocks (section_id, block_type, text) VALUES (?, ?, ?)",
                                               (section_id, content_block.get('block_type'), content_block.get('text')))

    # Commit changes and close the connection
    conn.commit()
    conn.close()

if __name__ == '__main__':
    populate_database()
    print("Database populated successfully.")