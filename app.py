from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import sqlite3
import random
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # Таблица картин
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS paintings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title_ru TEXT NOT NULL,
            title_en TEXT NOT NULL,
            author_ru TEXT NOT NULL,
            author_en TEXT NOT NULL,
            year INTEGER,
            image_uri TEXT NOT NULL,
            description_ru TEXT NOT NULL,
            description_en TEXT NOT NULL,
            facts_ru TEXT NOT NULL,
            facts_en TEXT NOT NULL,
            drawing_technique_ru TEXT NOT NULL,
            drawing_technique_en TEXT NOT NULL,
            dimensions TEXT NOT NULL,
            art_direction_ru TEXT NOT NULL,
            art_direction_en TEXT NOT NULL,             
            map_x REAL,
            map_y REAL,
            views INTEGER DEFAULT 0,
            avg_time REAL
        )
    ''')
    
    # Таблица посещений
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
    
    # Проверяем, есть ли колонка user_id (для старых БД)
    cursor.execute("PRAGMA table_info(visits)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'user_id' not in columns:
        cursor.execute("ALTER TABLE visits ADD COLUMN user_id TEXT")
    
    # Заполнение тестовыми данными, если таблица картин пуста
    cursor.execute('SELECT COUNT(*) FROM paintings')
    if cursor.fetchone()[0] == 0:
        paintings_data = [
            ("Звёздная ночь",
             "Starry night",
             "Винсент Ван Гог",
             "Vincent van Gogh",
             1889, 
             "static/images/paintings/Van_Gogh-Starry_Night.jpg",
             "Одна из самых узнаваемых картин в истории западного искусства. Написана в июне 1889 года в лечебнице Сен-Поль-де-Мозоль.",
             "One of the most recognizable paintings in the history of Western art. Painted in June 1889 at the Saint-Paul-de-Mausole asylum.",
             "Факт1:сам факт1;Факт2:сам факт2;Факт3:сам факт3;Факт4:сам факт4;",
             "Fact1:the fact1;Fact2:the fact2;Fact3:the fact3;Fact4:the fact4;",
             "Холст, масло",
             "Canvas, oil",
             "73.7 × 91.1",
             "Постимпрессионизм",
             "Post-Impressionism",
             20, 30, 15234, 7.2)
        ]
        cursor.executemany('''
            INSERT INTO paintings (title_ru, title_en, author_ru, author_en, year, image_uri, description_ru, description_en, facts_ru, facts_en, drawing_technique_ru, drawing_technique_en, dimensions, art_direction_ru, art_direction_en, map_x, map_y, views, avg_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', paintings_data)
        
        # Генерация тестовых посещений с user_id
        # user_ids = [f"user_{i}" for i in range(1, 21)]  # 20 уникальных пользователей
        # for i in range(1, 7):  # для 6 картин
        #     for _ in range(random.randint(50, 200)):
        #         visit_time = datetime.now() - timedelta(days=random.randint(0, 30), 
        #                                                 hours=random.randint(0, 23),
        #                                                 minutes=random.randint(0, 59))
        #         duration = random.randint(60, 600)
        #         user_id = random.choice(user_ids)
        #         cursor.execute('''
        #             INSERT INTO visits (painting_id, visit_time, duration_seconds, user_id)
        #             VALUES (?, ?, ?, ?)
        #         ''', (i, visit_time, duration, user_id))
    
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

@app.route('/api/paintings')
def get_paintings():
    conn = get_db_connection()
    paintings = conn.execute('SELECT * FROM paintings').fetchall()
    conn.close()
    return jsonify([dict(row) for row in paintings])

@app.route('/api/painting/<int:painting_id>')
def get_painting(painting_id):
    conn = get_db_connection()
    painting = conn.execute('SELECT * FROM paintings WHERE id = ?', (painting_id,)).fetchone()
    conn.close()
    if painting:
        return jsonify(dict(painting))
    return jsonify({"error": "Not found"}), 404

@app.route('/api/stats')
def get_stats():
    range_param = request.args.get('range', 'month')
    conn = get_db_connection()
    
    # Определяем временной фильтр
    date_filter = ""
    if range_param == 'today':
        date_filter = "WHERE visit_time >= date('now')"
    elif range_param == 'week':
        date_filter = "WHERE visit_time >= datetime('now', '-7 days')"
    elif range_param == 'month':
        date_filter = "WHERE visit_time >= datetime('now', '-30 days')"
    elif range_param == 'year':
        date_filter = "WHERE visit_time >= datetime('now', '-1 year')"
    # else 'all' – без фильтра
    
    # 1. Общее количество посещений
    total_visits = conn.execute(f'''
        SELECT COUNT(*) FROM visits
        {date_filter}
    ''').fetchone()[0]
    
    # 2. Уникальные пользователи
    unique_users = conn.execute(f'''
        SELECT COUNT(DISTINCT user_id) FROM visits
        {date_filter}
    ''').fetchone()[0]
    
    # 3. Средняя длительность просмотра (секунды)
    avg_duration = conn.execute(f'''
        SELECT AVG(duration_seconds) FROM visits
        {date_filter}
    ''').fetchone()[0] or 0
    
    # 4. Среднее количество картин на пользователя
    paintings_per_user = 0
    if unique_users > 0:
        paintings_per_user = total_visits / unique_users
    
    # 5. Популярные картины по количеству просмотров
    popular = conn.execute(f'''
        SELECT p.id, p.title_ru, p.title_en, p.author_ru, p.author_en, COUNT(v.id) as view_count
        FROM paintings p
        LEFT JOIN visits v ON p.id = v.painting_id
        {date_filter.replace('WHERE', 'AND') if date_filter else ''}
        GROUP BY p.id
        ORDER BY view_count DESC
        LIMIT 5
    ''').fetchall()
    
    # 6. Картины по задержке внимания (среднее время просмотра)
    attention = conn.execute(f'''
        SELECT p.id, p.title_ru, p.title_en, p.author_ru, p.author_en, AVG(v.duration_seconds) as avg_duration
        FROM paintings p
        JOIN visits v ON p.id = v.painting_id
        {date_filter.replace('WHERE', 'AND') if date_filter else ''}
        GROUP BY p.id
        ORDER BY avg_duration DESC
        LIMIT 5
    ''').fetchall()
    
    # 7. Почасовая статистика
    hourly_stats = conn.execute(f'''
        SELECT strftime('%H', visit_time) as hour, COUNT(*) as count
        FROM visits
        {date_filter}
        GROUP BY hour
        ORDER BY hour
    ''').fetchall()
    
    # 8. Средний маршрут (заглушка – можно заменить реальными данными)
    average_route = ["Зал импрессионистов", "Классическая живопись", "Современное искусство", "Скульптуры"]
    
    conn.close()
    
    # Подготовка данных для часов
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
        "average_route": average_route
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
    user_id = data.get('user_id', 'anonymous')  # если нет – ставим заглушку
    
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO visits (painting_id, visit_time, duration_seconds, user_id)
        VALUES (?, datetime('now'), ?, ?)
    ''', (painting_id, duration, user_id))
    
    # Обновляем счётчик просмотров в таблице paintings
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