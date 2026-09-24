import json
import sqlite3
import os
import shutil

def build_database():
    os.makedirs('data/kent_chapters', exist_ok=True)
    os.makedirs('public/data/kent_chapters', exist_ok=True)

    cache_path = 'data/kent_repertory_cache.json'
    print(f"Reading cache from {cache_path}...")
    with open(cache_path, 'r', encoding='utf-8') as f:
        cache = json.load(f)

    rubrics = cache['rubrics']
    remedies = cache['remedies']

    print(f"Loaded {len(rubrics)} rubrics and {len(remedies)} remedies.")

    db_path = 'data/kent_repertory.db'
    if os.path.exists(db_path):
        os.remove(db_path)

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Optimized SQLite settings
    cur.execute("PRAGMA journal_mode = WAL")
    cur.execute("PRAGMA synchronous = NORMAL")

    cur.execute('''
    CREATE TABLE remedies (
        abbreviation TEXT PRIMARY KEY,
        full_name TEXT
    )
    ''')

    cur.execute('''
    CREATE TABLE rubrics (
        row_num INTEGER PRIMARY KEY AUTOINCREMENT,
        id TEXT,
        chapter TEXT,
        symptom TEXT,
        zusatz_json TEXT,
        path TEXT,
        remedies_json TEXT,
        remedy_count INTEGER
    )
    ''')

    cur.execute('CREATE INDEX idx_rubrics_id ON rubrics(id)')
    cur.execute('CREATE INDEX idx_rubrics_chapter ON rubrics(chapter)')
    cur.execute('CREATE INDEX idx_rubrics_symptom ON rubrics(symptom)')

    cur.execute('''
    CREATE VIRTUAL TABLE rubrics_fts USING fts5(
        id UNINDEXED,
        chapter,
        symptom,
        path,
        content=rubrics,
        content_rowid=row_num
    )
    ''')

    print("Inserting remedies...")
    cur.executemany(
        'INSERT INTO remedies VALUES (?, ?)',
        [(r['abbreviation'], r['fullName']) for r in remedies]
    )

    print("Inserting rubrics...")
    batch = []
    by_chapter = {}

    for idx, r in enumerate(rubrics):
        ch = r.get('chapter', '')
        if ch not in by_chapter:
            by_chapter[ch] = []
        by_chapter[ch].append(r)

        zusatz_str = json.dumps(r.get('zusatz', []), ensure_ascii=False)
        remedies_str = json.dumps(r.get('remedies', {}), ensure_ascii=False)
        batch.append((
            str(r.get('id', idx + 1)),
            ch,
            r.get('symptom', ''),
            zusatz_str,
            r.get('path', ''),
            remedies_str,
            r.get('remedyCount', 0)
        ))

    cur.executemany(
        'INSERT INTO rubrics(id, chapter, symptom, zusatz_json, path, remedies_json, remedy_count) VALUES (?, ?, ?, ?, ?, ?, ?)',
        batch
    )

    print("Populating FTS index...")
    cur.execute('''
    INSERT INTO rubrics_fts(rowid, id, chapter, symptom, path)
    SELECT row_num, id, chapter, symptom, path FROM rubrics
    ''')

    conn.commit()
    conn.close()

    print(f"Database created at {db_path} ({os.path.getsize(db_path) / 1024 / 1024:.2f} MB)")

    # Copy to public/data
    public_db_path = 'public/data/kent_repertory.db'
    shutil.copyfile(db_path, public_db_path)
    print(f"Copied DB to {public_db_path}")

    # Generate individual chapter JSON files for fast chapter loading
    print(f"Generating {len(by_chapter)} chapter JSON files...")
    for ch, ch_rubrics in by_chapter.items():
        # Clean chapter filename
        safe_name = ch.replace('/', '_').replace('\\', '_') + '.json'
        
        # Save in data/kent_chapters
        with open(os.path.join('data/kent_chapters', safe_name), 'w', encoding='utf-8') as out_f:
            json.dump(ch_rubrics, out_f, ensure_ascii=False)

        # Save in public/data/kent_chapters
        with open(os.path.join('public/data/kent_chapters', safe_name), 'w', encoding='utf-8') as out_f:
            json.dump(ch_rubrics, out_f, ensure_ascii=False)

    print("All chapter JSON files created successfully!")

if __name__ == '__main__':
    build_database()
