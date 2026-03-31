from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import sqlite3
import random
from datetime import datetime, timedelta
from functools import wraps
from flask import session
from collections import defaultdict, Counter

app = Flask(__name__)

CORS(app)

app.secret_key = 'Hxck1bg!8y87#u[b]gh'

def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS paintings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title_ru TEXT NOT NULL,
            title_en TEXT NOT NULL,
            title_de TEXT NOT NULL,
            author_ru TEXT NOT NULL,
            author_en TEXT NOT NULL,
            author_de TEXT NOT NULL,
            year INTEGER,
            image_uri TEXT NOT NULL,
            description_ru TEXT NOT NULL,
            description_en TEXT NOT NULL,
            description_de TEXT NOT NULL,
            facts_ru TEXT NOT NULL,
            facts_en TEXT NOT NULL,
            facts_de TEXT NOT NULL,
            drawing_technique_ru TEXT NOT NULL,
            drawing_technique_en TEXT NOT NULL,
            drawing_technique_de TEXT NOT NULL,
            dimensions TEXT NOT NULL,
            art_direction_ru TEXT NOT NULL,
            art_direction_en TEXT NOT NULL,   
            art_direction_de TEXT NOT NULL,   
            map_x REAL,
            map_y REAL,
            views INTEGER DEFAULT 0,
            avg_time REAL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS visits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            painting_id INTEGER,
            visit_time TIMESTAMP,
            duration_seconds INTEGER,
            user_id TEXT,
            FOREIGN KEY (painting_id) REFERENCES paintings (id)
        )
    ''')
    
    cursor.execute("PRAGMA table_info(visits)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'user_id' not in columns:
        cursor.execute("ALTER TABLE visits ADD COLUMN user_id TEXT")
    
    cursor.execute('SELECT COUNT(*) FROM paintings')
    if cursor.fetchone()[0] == 0:
        paintings_data = [
            ("Звёздная ночь",
             "Starry night",
             "Sternennacht",
             "Винсент Ван Гог",
             "Vincent van Gogh",
             "Vincent van Gogh",
             1889, 
             "static/images/paintings/Van_Gogh-Starry_Night.jpg",
             "Одна из самых узнаваемых картин в истории западного искусства. Написана в июне 1889 года в лечебнице Сен-Поль-де-Мозоль.",
             "One of the most recognizable paintings in the history of Western art. Painted in June 1889 at the Saint-Paul-de-Mausole asylum.",
             "Eines der bekanntesten Gemälde in der Geschichte der westlichen Kunst. Entstanden im Juni 1889 in der Nervenheilanstalt Saint-Paul-de-Mausole.",
             "Факт1:сам факт1;Факт2:сам факт2;Факт3:сам факт3;Факт4:сам факт4;",
             "Fact1:the fact1;Fact2:the fact2;Fact3:the fact3;Fact4:the fact4;",
             "Fact1:the fact1;Fact2:the fact2;Fact3:the fact3;Fact4:the fact4;",
             "Холст, масло",
             "Canvas, oil",
             "Öl auf Leinwand",
             "73.7 × 91.1",
             "Постимпрессионизм",
             "Post-Impressionism",
             "Post-Impressionismus",
             20, 30, 15234, 7.2)
        ]
        cursor.executemany('''
            INSERT INTO paintings (title_ru, title_en, title_de, author_ru, author_en, author_de, year, image_uri, description_ru, description_en, description_de, facts_ru, facts_en, facts_de, drawing_technique_ru, drawing_technique_en, drawing_technique_de, dimensions, art_direction_ru, art_direction_en, art_direction_de, map_x, map_y, views, avg_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', paintings_data)
    
    conn.commit()
    conn.close()

init_db()

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    password = data.get('password')
    if password == 'XxFmh3d9':
        session['admin_logged_in'] = True
        return jsonify({"status": "ok"})
    return jsonify({"error": "Invalid password"}), 401

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.pop('admin_logged_in', None)
    return jsonify({"status": "ok"})

@app.route('/api/paintings')
def get_paintings():
    conn = get_db_connection()
    paintings = conn.execute('SELECT * FROM paintings').fetchall()
    conn.close()
    return jsonify([dict(row) for row in paintings])

@app.route('/api/check-auth')
def check_auth():
    return jsonify({"logged_in": session.get('admin_logged_in', False)})

@app.route('/api/painting/<int:painting_id>')
def get_painting(painting_id):
    conn = get_db_connection()
    painting = conn.execute('SELECT * FROM paintings WHERE id = ?', (painting_id,)).fetchone()
    conn.close()
    if painting:
        return jsonify(dict(painting))
    return jsonify({"error": "Not found"}), 404

@app.route('/api/stats')
@login_required
def get_stats():
    range_param = request.args.get('range', 'month')
    conn = get_db_connection()
    
    date_filter = ""
    if range_param == 'today':
        date_filter = "WHERE visit_time >= date('now')"
    elif range_param == 'week':
        date_filter = "WHERE visit_time >= datetime('now', '-7 days')"
    elif range_param == 'month':
        date_filter = "WHERE visit_time >= datetime('now', '-30 days')"
    elif range_param == 'year':
        date_filter = "WHERE visit_time >= datetime('now', '-1 year')"
    
    total_visits = conn.execute(f'''
        SELECT COUNT(*) FROM visits
        {date_filter}
    ''').fetchone()[0]
    
    unique_users = conn.execute(f'''
        SELECT COUNT(DISTINCT user_id) FROM visits
        {date_filter}
    ''').fetchone()[0]
    
    avg_duration = conn.execute(f'''
        SELECT AVG(duration_seconds) FROM visits
        {date_filter}
    ''').fetchone()[0] or 0
    
    paintings_per_user = 0
    if unique_users > 0:
        paintings_per_user = total_visits / unique_users
    
    popular = conn.execute(f'''
        SELECT p.id, p.title_ru, p.title_en, p.author_ru, p.author_en, COUNT(v.id) as view_count
        FROM paintings p
        LEFT JOIN visits v ON p.id = v.painting_id
        {date_filter.replace('WHERE', 'AND') if date_filter else ''}
        GROUP BY p.id
        ORDER BY view_count DESC
        LIMIT 5
    ''').fetchall()
    
    attention = conn.execute(f'''
        SELECT p.id, p.title_ru, p.title_en, p.author_ru, p.author_en, AVG(v.duration_seconds) as avg_duration
        FROM paintings p
        JOIN visits v ON p.id = v.painting_id
        {date_filter.replace('WHERE', 'AND') if date_filter else ''}
        GROUP BY p.id
        ORDER BY avg_duration DESC
        LIMIT 5
    ''').fetchall()
    
    hourly_stats = conn.execute(f'''
        SELECT strftime('%H', visit_time) as hour, COUNT(*) as count
        FROM visits
        {date_filter}
        GROUP BY hour
        ORDER BY hour
    ''').fetchall()
    
    visits_rows = conn.execute(f'''
        SELECT user_id, painting_id, visit_time
        FROM visits
        {date_filter}
        ORDER BY user_id, visit_time
    ''').fetchall()
    
    user_dict = defaultdict(list)
    for row in visits_rows:
        user_dict[row['user_id']].append((row['visit_time'], row['painting_id']))
    
    user_sequences = []
    for user_id, visits_list in user_dict.items():
        seen = set()
        seq = []
        for _, pid in visits_list:
            if pid not in seen:
                seen.add(pid)
                seq.append(pid)
        if len(seq) >= 2:
            user_sequences.append(seq)
    
    avg_paintings_route = []
    if user_sequences:
        first_paintings = Counter(seq[0] for seq in user_sequences if seq)
        if first_paintings:
            most_common_first = first_paintings.most_common(1)[0][0]
            route_ids = [most_common_first]
            
            for _ in range(10):
                current = route_ids[-1]
                transitions = Counter()
                for seq in user_sequences:
                    try:
                        idx = seq.index(current)
                        if idx + 1 < len(seq):
                            transitions[seq[idx + 1]] += 1
                    except ValueError:
                        continue
                if not transitions:
                    break
                next_id = transitions.most_common(1)[0][0]
                if next_id in route_ids:
                    break
                route_ids.append(next_id)
            
            if route_ids:
                placeholders = ','.join('?' for _ in route_ids)
                paintings_route = conn.execute(f'''
                    SELECT id, title_ru, title_en
                    FROM paintings
                    WHERE id IN ({placeholders})
                ''', route_ids).fetchall()
                
                paintings_dict = {p['id']: p for p in paintings_route}
                
                for pid in route_ids:
                    p = paintings_dict.get(pid)
                    if p:
                        avg_paintings_route.append({
                            "id": p['id'],
                            "title_ru": p['title_ru'],
                            "title_en": p['title_en']
                        })
    
    conn.close()
    
    hours = [f"{h:02d}:00" for h in range(24)]
    visit_counts = [0] * 24
    for stat in hourly_stats:
        hour = int(stat['hour'])
        visit_counts[hour] = stat['count']
    
    return jsonify({
        "total_visits": total_visits,
        "unique_users": unique_users,
        "avg_duration_seconds": round(avg_duration, 1),
        "paintings_per_user": round(paintings_per_user, 2),
        "popular_paintings": [{
            "id": row["id"],
            "title_ru": row["title_ru"],
            "title_en": row["title_en"],
            "author_ru": row["author_ru"],
            "author_en": row["author_en"],
            "views": row["view_count"]
        } for row in popular],
        "attention_paintings": [{
            "id": row["id"],
            "title_ru": row["title_ru"],
            "title_en": row["title_en"],
            "author_ru": row["author_ru"],
            "author_en": row["author_en"],
            "avg_duration_minutes": round(row["avg_duration"] / 60, 1) if row["avg_duration"] else 0
        } for row in attention],
        "hourly_stats": {"labels": hours, "data": visit_counts},
        "average_route": ["Зал импрессионистов", "Классическая живопись", "Современное искусство", "Скульптуры"],
        "average_paintings_route": avg_paintings_route
    })

@app.route('/api/search')
def search_paintings():
    query = request.args.get('q', '').lower()
    conn = get_db_connection()
    paintings = conn.execute('''
        SELECT * FROM paintings 
        WHERE LOWER(title) LIKE ? OR LOWER(author) LIKE ?
    ''', (f'%{query}%', f'%{query}%')).fetchall()
    conn.close()
    return jsonify([dict(row) for row in paintings])

@app.route('/api/visit', methods=['POST'])
def log_visit():
    data = request.json
    painting_id = data.get('painting_id')
    duration = data.get('duration', 300)
    user_id = data.get('user_id', 'anonymous')
    
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO visits (painting_id, visit_time, duration_seconds, user_id)
        VALUES (?, datetime('now'), ?, ?)
    ''', (painting_id, duration, user_id))
    
    conn.execute('''
        UPDATE paintings SET views = views + 1 WHERE id = ?
    ''', (painting_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({"status": "ok"})

@app.route('/api/pause-carousel', methods=['POST'])
def pause_carousel():
    """Сигнал что пользователь смотрит картину - не обновлять главную"""
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)