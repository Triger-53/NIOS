import pytest
from app import app as flask_app
import sqlite3

@pytest.fixture
def app():
    yield flask_app

@pytest.fixture
def client(app):
    return app.test_client()

def test_database_population():
    conn = sqlite3.connect('book.db')
    cursor = conn.cursor()

    # Check if books table has data
    cursor.execute("SELECT COUNT(*) FROM books")
    assert cursor.fetchone()[0] > 0, "Books table is empty"

    # Check if units table has data
    cursor.execute("SELECT COUNT(*) FROM units")
    assert cursor.fetchone()[0] > 0, "Units table is empty"

    # Check if chapters table has data
    cursor.execute("SELECT COUNT(*) FROM chapters")
    assert cursor.fetchone()[0] > 0, "Chapters table is empty"

    # Check if sections table has data
    cursor.execute("SELECT COUNT(*) FROM sections")
    assert cursor.fetchone()[0] > 0, "Sections table is empty"

    # Check if content_blocks table has data
    cursor.execute("SELECT COUNT(*) FROM content_blocks")
    assert cursor.fetchone()[0] > 0, "Content blocks table is empty"

    conn.close()

def test_index_page(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b'English' in response.data
    assert b'Table of Contents' in response.data

def test_unit_page(client):
    response = client.get('/unit/1')
    assert response.status_code == 200
    assert b'Unit 1' in response.data
    assert b'Chapters' in response.data

def test_chapter_page(client):
    response = client.get('/chapter/1')
    assert response.status_code == 200
    assert b'Chapter 1' in response.data
    assert b'STEALING AND ATONEMENT' in response.data
    assert b'In this lesson you will read a few extracts' in response.data