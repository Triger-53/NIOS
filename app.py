from flask import Flask, render_template, g
import sqlite3

app = Flask(__name__)
DATABASE = 'book.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/')
def index():
    cursor = get_db().cursor()
    book = cursor.execute('SELECT * FROM books').fetchone()
    db_units = cursor.execute('SELECT * FROM units WHERE book_id = ? ORDER BY id', (book['id'],)).fetchall()

    units_for_display = []
    for unit in db_units:
        unit_dict = dict(unit)
        title = unit_dict['unit_title']
        if title and "Unit" in title and len(title) < 30:
            unit_dict['display_title'] = title
        else:
            unit_dict['display_title'] = f"Unit {unit_dict['id']}"
        units_for_display.append(unit_dict)

    return render_template('index.html', book=book, units=units_for_display)

@app.route('/unit/<int:unit_id>')
def unit(unit_id):
    cursor = get_db().cursor()
    unit = cursor.execute('SELECT * FROM units WHERE id = ?', (unit_id,)).fetchone()
    chapters = cursor.execute('SELECT * FROM chapters WHERE unit_id = ?', (unit_id,)).fetchall()
    return render_template('unit.html', unit=unit, chapters=chapters)

@app.route('/chapter/<int:chapter_id>')
def chapter(chapter_id):
    cursor = get_db().cursor()
    chapter = cursor.execute('SELECT * FROM chapters WHERE id = ?', (chapter_id,)).fetchone()
    sections = cursor.execute('SELECT * FROM sections WHERE chapter_id = ?', (chapter_id,)).fetchall()

    sections_with_content = []
    for section in sections:
        content_blocks = cursor.execute('SELECT * FROM content_blocks WHERE section_id = ?', (section['id'],)).fetchall()
        sections_with_content.append({
            'section': section,
            'content_blocks': content_blocks
        })

    return render_template('chapter.html', chapter=chapter, sections_with_content=sections_with_content)

if __name__ == '__main__':
    app.run(debug=True)