CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_title TEXT NOT NULL,
    subject TEXT,
    class TEXT,
    source TEXT
);

CREATE TABLE units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER,
    unit_no INTEGER,
    unit_title TEXT,
    FOREIGN KEY (book_id) REFERENCES books (id)
);

CREATE TABLE chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER,
    chapter_no INTEGER,
    chapter_title TEXT,
    FOREIGN KEY (unit_id) REFERENCES units (id)
);

CREATE TABLE sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_id INTEGER,
    section_no INTEGER,
    section_title TEXT,
    type TEXT,
    FOREIGN KEY (chapter_id) REFERENCES chapters (id)
);

CREATE TABLE content_blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_id INTEGER,
    block_type TEXT,
    text TEXT,
    FOREIGN KEY (section_id) REFERENCES sections (id)
);