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
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS visits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            painting_id INTEGER,
            visit_time TIMESTAMP,
            duration_seconds INTEGER,
            FOREIGN KEY (painting_id) REFERENCES paintings (id)
        )
    ''')
    
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
            
            # ("Мона Лиза", "Леонардо да Винчи", 1503,
            #  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/1200px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
            #  "Портрет Лизы Герардини, жены Франческо дель Джокондо. Самая известная картина в мире.",
            #  65, 45, 25000, 12.5),
            
            # ("Девушка с жемчужной серёжкой", "Ян Вермеер", 1665,
            #  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/1200px-1665_Girl_with_a_Pearl_Earring.jpg",
            #  "Часто называемая «Северной Моной Лизой». Шедевр голландской живописи XVII века.",
            #  80, 20, 12456, 5.1),
            
            # ("Крик", "Эдвард Мунк", 1893,
            #  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/1200px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg",
            #  "Самая известная работа Мунка и один из самых узнаваемых образов в искусстве.",
            #  40, 70, 11203, 4.8),
            
            # ("Ночной дозор", "Рембрандт", 1642,
            #  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/The_Nightwatch_by_Rembrandt_-_Rijksmuseum.jpg/1200px-The_Nightwatch_by_Rembrandt_-_Rijksmuseum.jpg",
            #  "Одно из самых известных произведений Рембрандта. Групповой портрет стрелковой роты.",
            #  55, 55, 9876, 8.3),
            
            # ("Рождение Венеры", "Сандро Боттичелли", 1485,
            #  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1200px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg",
            #  "Одна из самых знаменитых картин итальянского Возрождения. Изображает богиню Венеру.",
            #  30, 40, 8765, 6.7)
        ]
        cursor.executemany('''
            INSERT INTO paintings (title_ru, title_en, author_ru, author_en, year, image_uri, description_ru, description_en, facts_ru, facts_en, drawing_technique_ru, drawing_technique_en, dimensions, art_direction_ru, art_direction_en, map_x, map_y, views, avg_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', paintings_data)
        
        for i in range(1, 7):
            for _ in range(random.randint(50, 200)):
                visit_time = datetime.now() - timedelta(days=random.randint(0, 30), 
                                                        hours=random.randint(0, 23),
                                                        minutes=random.randint(0, 59))
                duration = random.randint(60, 600)
                cursor.execute('''
                    INSERT INTO visits (painting_id, visit_time, duration_seconds)
                    VALUES (?, ?, ?)
                ''', (i, visit_time, duration))
    
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
    conn = get_db_connection()
    
    total_visits = conn.execute('SELECT COUNT(*) FROM visits').fetchone()[0]
    
    unique_users = conn.execute('SELECT COUNT(DISTINCT visit_time) FROM visits').fetchone()[0]
    
    popular = conn.execute('''
        SELECT p.id, p.title_ru, p.author_ru, p.views, p.avg_time
        FROM paintings p
        ORDER BY p.views DESC
        LIMIT 5
    ''').fetchall()
    
    hourly_stats = conn.execute('''
        SELECT strftime('%H', visit_time) as hour, COUNT(*) as count
        FROM visits
        WHERE visit_time > datetime('now', '-7 days')
        GROUP BY hour
        ORDER BY hour
    ''').fetchall()
    
    conn.close()
    
    hours = [f"{h:02d}:00" for h in range(24)]
    visit_counts = [0] * 24
    for stat in hourly_stats:
        hour = int(stat['hour'])
        visit_counts[hour] = stat['count']
    
    return jsonify({
        "total_visits": total_visits,
        "unique_users": unique_users,
        "popular_paintings": [dict(row) for row in popular],
        "hourly_stats": {"labels": hours, "data": visit_counts}
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
    
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO visits (painting_id, visit_time, duration_seconds)
        VALUES (?, datetime('now'), ?)
    ''', (painting_id, duration))
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