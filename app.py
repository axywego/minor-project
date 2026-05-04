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
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            painting_id INTEGER NOT NULL,
            author TEXT NOT NULL,
            text TEXT NOT NULL,
            rating INTEGER NOT NULL DEFAULT 5,
            approved INTEGER BOOLEAN FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (painting_id) REFERENCES paintings (id)
        )
    ''')
    
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
    
    # Проверяем, есть ли уже картины
    cursor.execute('SELECT COUNT(*) FROM paintings')
    if cursor.fetchone()[0] == 0:
        # Добавляем все картины
        paintings_data = get_all_paintings()
        cursor.executemany('''
            INSERT INTO paintings (
                title_ru, title_en, title_de,
                author_ru, author_en, author_de,
                year, image_uri,
                description_ru, description_en, description_de,
                facts_ru, facts_en, facts_de,
                drawing_technique_ru, drawing_technique_en, drawing_technique_de,
                dimensions,
                art_direction_ru, art_direction_en, art_direction_de,
                map_x, map_y, views, avg_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', paintings_data)
    
    conn.commit()
    conn.close()

def get_all_paintings():
    """Возвращает список всех картин для инициализации БД"""
    paintings = []
    
    # Координаты для карты (распределяем по кругу)
    import math
    base_x, base_y = 50, 50
    radius = 30
    
    paintings_list = [
        # 1. Звездная ночь
        {
            "title_ru": "Звёздная ночь",
            "title_en": "Starry Night",
            "title_de": "Sternennacht",
            "author_ru": "Винсент Ван Гог",
            "author_en": "Vincent van Gogh",
            "author_de": "Vincent van Gogh",
            "year": 1889,
            "technique_ru": "Холст, масло",
            "technique_en": "Canvas, oil",
            "technique_de": "Öl auf Leinwand",
            "dimensions": "73.7 × 91.1 см",
            "direction_ru": "Постимпрессионизм",
            "direction_en": "Post-Impressionism",
            "direction_de": "Post-Impressionismus",
            "description_ru": "Одна из самых узнаваемых картин в истории западного искусства. Написана в июне 1889 года в лечебнице Сен-Поль-де-Мозоль в Сен-Реми-де-Прованс.",
            "description_en": "One of the most recognizable paintings in the history of Western art. Painted in June 1889 at the Saint-Paul-de-Mausole asylum in Saint-Rémy-de-Provence.",
            "description_de": "Eines der bekanntesten Gemälde in der Geschichte der westlichen Kunst. Entstanden im Juni 1889 in der Nervenheilanstalt Saint-Paul-de-Mausole in Saint-Rémy-de-Provence.",
            "facts_ru": "До того, как попасть в Музей современного искусства в Нью-Йорке, картина некоторое время висела в ванной комнате дома писателя и коллекционера Стивена Кларка;Ван Гог не был доволен «Звездной ночью»;В 2004 году ученые, наблюдая за картиной через телескоп, заметили, что вихри на небе Ван Гога подчиняются сложному математическому закону турбулентности;В июне 1889 года, когда Ван Гог работал над полотном, планета Венера была необычайно ярко видна на утреннем небе в Провансе",
            "facts_en": "Before entering The Museum of Modern Art in New-York, the artwork was hung in a bathroom of a writer and collector Stephen Clark;Van Gogh wasn't satisfied with the 'Starry Night';In 2004 while watching the painting through the telescope, scientists noticed that vortices on the Van Gogh's sky obey the complex mathematical law of turbulence;In June 1889, while Van Gogh was working on the canvas, the planet Venus was unusually bright in the morning sky in Provence",
            "facts_de": "Bevor das Gemälde ins Museum of Modern Art in New York kam, hing es eine Zeit lang im Badezimmer des Schriftstellers und Sammlers Stephen Clark;Van Gogh war mit der 'Sternennacht' nicht zufrieden;2004 beobachteten Wissenschaftler das Gemälde durch ein Teleskop und stellten fest, dass die Wirbel an Van Goghs Himmel einem komplexen mathematischen Gesetz der Turbulenz folgen;Im Juni 1889, als Van Gogh an dem Gemälde arbeitete, war der Planet Venus am Morgenhimmel der Provence ungewöhnlich hell zu sehen",
            "image": "Van_Gogh-Starry_Night.jpg"
        },
        # 2. Мужчина с кларнетом
        {
            "title_ru": "Мужчина с кларнетом",
            "title_en": "Man with a Clarinet",
            "title_de": "Mann mit Klarinette",
            "author_ru": "Пабло Пикассо",
            "author_en": "Pablo Picasso",
            "author_de": "Pablo Picasso",
            "year": 1911,
            "technique_ru": "Холст, масло",
            "technique_en": "Canvas, oil",
            "technique_de": "Öl auf Leinwand",
            "dimensions": "106 × 69 см",
            "direction_ru": "Аналитический кубизм",
            "direction_en": "Analytical Cubism",
            "direction_de": "Analytischer Kubismus",
            "description_ru": "Картина испанского/французского художника Пабло Пикассо, написанная в 1911-1912 годах. Находится в Музее Тиссен-Борнемиса в Мадриде.",
            "description_en": "A painting by Spanish/French artist Pablo Picasso made in 1911-1912. Located in Thyssen-Bornemisza National Museum in Madrid.",
            "description_de": "Gemälde des spanisch-französischen Künstlers Pablo Picasso, entstanden in den Jahren 1911-1912. Befindet sich im Museum Thyssen-Bornemisza in Madrid.",
            "facts_ru": "Цвета на картине нанесены неоимпрессионистской техникой;Несмотря на абстрактный вид картины, Пикассо сохраняет стандартный формат портрета: вертикальное положение фигуры;Пикассо создал картину в своей мастерской на бульваре де Клиши после проведенного лета во французском городе Сере;Работал в тесном сотрудничестве с французским художником Жоржем Браком",
            "facts_en": "The colours in the painting are applied with the use of neo-impressionist technique;Despite the abstract look of the painting, Picasso keeps the standard canvas format: vertical position of the figure;Picasso created the painting in his studio on Boulevard de Clichy after spending the summer in French town Céret;He worked closely with a French artist Georges Braque",
            "facts_de": "Die Farben auf dem Gemälde sind in neoimpressionistischer Technik aufgetragen;Obwohl das Gemälde abstrakt wirkt, hält Picasso an der traditionellen Porträtform fest: die Figur ist vertikal ausgerichtet;Picasso schuf das Gemälde in seinem Atelier am Boulevard de Clichy, nachdem er den Sommer in der französischen Stadt Céret verbracht hatte;Er arbeitete eng mit dem französischen Künstler Georges Braque zusammen",
            "image": "Picasso-Man_with_Clarinet.jpg"
        },
        # 3. Качели
        {
            "title_ru": "Качели",
            "title_en": "The Swing",
            "title_de": "Die Schaukel",
            "author_ru": "Жан-Оноре Фрагонар",
            "author_en": "Jean-Honoré Fragonard",
            "author_de": "Jean-Honoré Fragonard",
            "year": 1768,
            "technique_ru": "Холст, масло",
            "technique_en": "Canvas, oil",
            "technique_de": "Öl auf Leinwand",
            "dimensions": "81 × 64.2 см",
            "direction_ru": "Рококо",
            "direction_en": "Rococo",
            "direction_de": "Rokoko",
            "description_ru": "Картина французского живописца Жана Оноре Фрагонара, написанная около 1767 года. Наиболее известная работа художника, считающаяся одним из шедевров «галантного жанра» эпохи искусства стиля рококо.",
            "description_en": "A painting by French painter Jean-Honoré Fragonard made around 1767. The most famous artist's work, considered one of the masterpieces of 'gallant genre' of the Rococo era.",
            "description_de": "Das Gemälde des französischen Malers Jean-Honoré Fragonard, entstanden ca. 1768. Eines der bekanntesten Werke des Künstlers und zählt darüber hinaus zu den bedeutendsten Werken des Rokokos.",
            "facts_ru": "Изначально один из придворных короля Людовика XV заказал эту картину Габриэлю-Франсуа Дуайену в качестве сюжетного портрета своей любовницы и себя;Полное название картины «Счастливые возможности качелей»;Известны две копии картины, ни одна из которых не выполнена самим Фрагонаром;В 2021 году была завершена реставрация картины",
            "facts_en": "Initially, one of King Louis XV's courtiers commissioned this painting from Gabriel-François Doyen as a narrative portrait of his mistress and himself;The full name of the painting is 'The Happy Accidents of the Swing';There are two copies of the painting. Neither of them was made by Fragonard;The restoration of the painting ended in 2021",
            "facts_de": "Ursprünglich bestellte einer der Höflinge König Ludwigs XV. dieses Gemälde bei Gabriel-François Doyen als ein Porträt seiner Geliebten und seiner selbst;Der vollständige Titel des Gemäldes lautet 'Der glückliche Zufall mit der Schaukel';Es sind zwei Kopien des Gemäldes bekannt, von denen keine von Fragonard selbst angefertigt wurde;Im Jahr 2021 wurde die Restaurierung des Gemäldes abgeschlossen",
            "image": "Fragonard-The_Swing.jpg"
        },
        # 4. Последний день Помпеи
        {
            "title_ru": "Последний день Помпеи",
            "title_en": "The Last Day of Pompeii",
            "title_de": "Der letzte Tag von Pompeji",
            "author_ru": "Карл Брюллов",
            "author_en": "Karl Bryullov",
            "author_de": "Karl Brjullow",
            "year": 1833,
            "technique_ru": "Холст, масло",
            "technique_en": "Canvas, oil",
            "technique_de": "Öl auf Leinwand",
            "dimensions": "456.5 × 651 см",
            "direction_ru": "Романтизм",
            "direction_en": "Romanticism",
            "direction_de": "Romantik",
            "description_ru": "Крупноформатная картина русского художника Карла Брюллова (1799-1852), работа над которой была завершена в 1833 году. На картине изображены события в Помпеях во время катастрофического извержения Везувия, которое произошло в 79 году нашей эры.",
            "description_en": "A large-format painting by Russian artist Karl Bryullov (1799-1852) which was finished in 1833. The painting pictures the events of Pompeii during the catastrophic eruption of Vesuvius, which occurred in 79 AD.",
            "description_de": "Ein großformatiges Gemälde des russischen Künstlers Karl Brjullow (1799-1852), das 1833 fertiggestellt wurde. Das Gemälde zeigt die Ereignisse in Pompeji während des katastrophalen Ausbruchs des Vesuvs im Jahr 79 n. Chr.",
            "facts_ru": "Картина вдохновлена романом «Последние дни Помпеи» Эдварда Бульвер-Литтона;В левом углу художник изобразил себя: он спасает ящик с кистями и красками;Картина хранилась в Риме, Милане, Париже, а затем вернулась на хранение в Россию;Картина сделала Брюллова первой русской мировой звездой живописи",
            "facts_en": "The painting is inspired by the novel 'The Last Days of Pompeii' by Edward Bulwer-Lytton;The artist depicted himself in the left corner: he is saving a box with brushes and paint;The painting have been stored in Rome, Milan, Paris, and now it's stored in Russia;The painting made Bryullov the first Russian world star of painting",
            "facts_de": "Das Gemälde ist von dem Roman 'Die letzten Tage von Pompeji' von Edward Bulwer-Lytton inspiriert;In der linken Ecke hat der Künstler sich selbst dargestellt: Er rettet einen Kasten mit Pinseln und Farben;Das Gemälde wurde in Rom, Mailand und Paris aufbewahrt und kehrte dann nach Russland zurück;Das Gemälde machte Brjullow zum ersten russischen Weltstar der Malerei",
            "image": "Bryullov-Last_Day_of_Pompeii.jpg"
        },
        # 5. Неравный брак
        {
            "title_ru": "Неравный брак",
            "title_en": "The Unequal Marriage",
            "title_de": "Die ungleiche Heirat",
            "author_ru": "Василий Пукирев",
            "author_en": "Vasili Pukirev",
            "author_de": "Wassili Pukirew",
            "year": 1862,
            "technique_ru": "Холст, масло",
            "technique_en": "Canvas, oil",
            "technique_de": "Öl auf Leinwand",
            "dimensions": "173 × 136.5 см",
            "direction_ru": "Реализм",
            "direction_en": "Realism",
            "direction_de": "Realismus",
            "description_ru": "На картине изображено таинство венчания в православной церкви. Среди полумрака церкви падающий из окна свет ярко освещает лишь жениха, невесту и священника.",
            "description_en": "The painting depicts the sacrament of a wedding in the Orthodox Church. In the twilight of the church, the light falling from the window brightly illuminates only the groom, the bride and the priest.",
            "description_de": "Das Gemälde zeigt das Sakrament der Trauung in einer orthodoxen Kirche. Im Dämmerlicht der Kirche beleuchtet das durch das Fenster fallende Licht nur den Bräutigam, die Braut und den Priester.",
            "facts_ru": "Работа была написана сразу после окончания Московского училища живописи, ваяния и зодчества. За данную работу Академия наградила Пукирева званием профессора;Сюжет картины основан на драме друга художника;Друг узнал себя на картине и устроил скандал, как итог — вместо друга художник изобразил себя, скрестив руки на груди;Существуют две почти идентичные версии картины: в Третьяковской галерее и в Национальном художественном музее Беларуси",
            "facts_en": "The work was written immediately after graduating from the Moscow School of Painting, Sculpture and Architecture. For this work, the Academy awarded Pukirev the title of professor;The plot of the picture is based on the drama of the artist's friend;The friend recognized himself in the painting and caused a scandal, as a result - instead of the friend, the artist depicted himself, crossing his arms over his chest;There are two almost identical versions of the painting: in the Tretyakov Gallery and in the National Art Museum of Belarus",
            "facts_de": "Das Werk entstand unmittelbar nach dem Abschluss der Moskauer Schule für Malerei, Bildhauerei und Architektur. Für dieses Werk verlieh die Akademie Pukirew den Professorentitel;Die Handlung des Bildes basiert auf dem Drama eines Freundes des Künstlers;Der Freund erkannte sich auf dem Gemälde wieder und verursachte einen Skandal, woraufhin der Künstler stattdessen sich selbst mit vor der Brust verschränkten Armen darstellte;Es gibt zwei fast identische Versionen des Gemäldes: in der Tretjakow-Galerie und im Nationalen Kunstmuseum von Belarus",
            "image": "Pukirev-Unequal_Marriage.jpg"
        },
        # 6. Рождение Венеры
        {
            "title_ru": "Рождение Венеры",
            "title_en": "The Birth of Venus",
            "title_de": "Die Geburt der Venus",
            "author_ru": "Сандро Боттичелли",
            "author_en": "Sandro Botticelli",
            "author_de": "Sandro Botticelli",
            "year": 1485,
            "technique_ru": "Холст, темпера",
            "technique_en": "Canvas, tempera",
            "technique_de": "Leinwand, Tempera",
            "dimensions": "172.5 × 278.5 см",
            "direction_ru": "Раннее Возрождение",
            "direction_en": "Early Renaissance",
            "direction_de": "Frührenaissance",
            "description_ru": "Картина итальянского живописца периода кватроченто флорентийской школы Сандро Боттичелли. Согласно философии неоплатоников, слияние божественного и человеческого осуществляется через любовь, это слияние воплощает богиня Венера.",
            "description_en": "Painting by the Italian painter of the Quattrocento period of the Florentine school Sandro Botticelli. According to the philosophy of the Neoplatonists, the fusion of the divine and the human is carried out through love, this fusion is embodied by the goddess Venus.",
            "description_de": "Gemälde des italienischen Malers des Quattrocento der florentinischen Schule Sandro Botticelli. Nach der Philosophie der Neuplatoniker vollzieht sich die Verschmelzung des Göttlichen und des Menschlichen durch die Liebe, verkörpert durch die Göttin Venus.",
            "facts_ru": "Картина была создана для украшения спальни на вилле Кастелло, принадлежавшей Лоренцо ди Пьерфранческо Медичи;Прототипом Венеры стала Симонетта Веспуччи — первая красавица Флоренции, в которую был влюблен покровитель Боттичелли;В эпоху Раннего Возрождения художники предпочитали писать на деревянных панелях, но из-за огромного размера Боттичелли выбрал холст;«Рождение Венеры» стало первой крупноформатной картиной со времен античности, где центральной фигурой была полностью обнаженная языческая богиня",
            "facts_en": "The painting was created to decorate the bedroom at Villa Castello, which belonged to Lorenzo di Pierfrancesco Medici;The prototype of Venus was Simonetta Vespucci, the first beauty of Florence, with whom Botticelli's patron was in love;During the Early Renaissance, artists preferred to paint on wooden panels, but due to the enormous size, Botticelli chose canvas;'The Birth of Venus' was the first large-format painting since antiquity, where the central figure was a completely naked pagan goddess",
            "facts_de": "Das Gemälde wurde zur Dekoration des Schlafzimmers in der Villa Castello geschaffen, die Lorenzo di Pierfrancesco Medici gehörte;Das Vorbild für Venus war Simonetta Vespucci, die erste Schönheit von Florenz, in die Botticellis Mäzen verliebt war;In der Frührenaissance malten Künstler bevorzugt auf Holztafeln, aber aufgrund der enormen Größe wählte Botticelli Leinwand;'Die Geburt der Venus' war das erste großformatige Gemälde seit der Antike, dessen zentrale Figur eine völlig nackte heidnische Göttin war",
            "image": "Botticelli-Birth_of_Venus.jpg"
        },
        # 7. Поцелуй
        {
            "title_ru": "Поцелуй",
            "title_en": "The Kiss",
            "title_de": "Der Kuss",
            "author_ru": "Густав Климт",
            "author_en": "Gustav Klimt",
            "author_de": "Gustav Klimt",
            "year": 1908,
            "technique_ru": "Холст, масло, сусальное золото",
            "technique_en": "Canvas, oil, gold leaf",
            "technique_de": "Öl auf Leinwand, Blattgold",
            "dimensions": "180 × 180 см",
            "direction_ru": "Модерн",
            "direction_en": "Art Nouveau",
            "direction_de": "Jugendstil",
            "description_ru": "Картина австрийского художника Густава Климта. Написана в 1908-1909 годах, считается ключевым произведением «золотого периода» в творчестве художника.",
            "description_en": "Painting by the Austrian artist Gustav Klimt. Painted in 1908-1909, it is considered a key work of the 'golden period' in the artist's work.",
            "description_de": "Gemälde des österreichischen Künstlers Gustav Klimt. Entstanden 1908-1909, gilt es als Schlüsselwerk der 'goldenen Periode' im Schaffen des Künstlers.",
            "facts_ru": "Государственная галерея выкупила картину за рекордные для Австрии 25 000 крон;Картина стала результатом глубокого творческого кризиса, когда Климта жестко критиковали за «порнографию» в его работах;В картине Климт использовал дорогое сусальное золото. Это была отсылка к византийским мозаикам;Губы влюбленных на картине не соприкасаются — это момент предвкушения поцелуя",
            "facts_en": "The State Gallery bought the painting for a record 25,000 crowns for Austria;The painting was the result of a deep creative crisis, when Klimt was harshly criticized for 'pornography' in his works;In the painting, Klimt used expensive gold leaf. It was a reference to the Byzantine mosaics;The lips of the lovers in the picture do not touch - this is the moment of anticipation of the kiss",
            "facts_de": "Die Staatsgalerie kaufte das Gemälde für die in Österreich rekordverdächtige Summe von 25.000 Kronen;Das Gemälde war das Ergebnis einer tiefen Schaffenskrise, als Klimt heftig für 'Pornographie' in seinen Werken kritisiert wurde;In dem Gemälde verwendete Klimt teures Blattgold. Dies war eine Anspielung auf die byzantinischen Mosaike;Die Lippen der Liebenden auf dem Bild berühren sich nicht - dies ist der Moment der Erwartung des Kusses",
            "image": "Klimt-The_Kiss.jpg"
        },
        # 8. Дама с зонтиком
        {
            "title_ru": "Прогулка. Дама с зонтиком",
            "title_en": "Woman with a Parasol",
            "title_de": "Dame mit Sonnenschirm",
            "author_ru": "Клод Моне",
            "author_en": "Claude Monet",
            "author_de": "Claude Monet",
            "year": 1875,
            "technique_ru": "Холст, масло",
            "technique_en": "Canvas, oil",
            "technique_de": "Öl auf Leinwand",
            "dimensions": "100 × 81 см",
            "direction_ru": "Импрессионизм",
            "direction_en": "Impressionism",
            "direction_de": "Impressionismus",
            "description_ru": "Картина Клода Моне также известна под названием «Камилла Моне с сыном Жаном». На картине изображена супруга художника Камилла с их сыном Жаном в один из ветреных летних дней.",
            "description_en": "Claude Monet's painting is also known as 'Camille Monet with her son Jean'. The painting depicts the artist's wife Camille with their son Jean on one of the windy summer days.",
            "description_de": "Das Gemälde von Claude Monet ist auch als 'Camille Monet mit Sohn Jean' bekannt. Das Gemälde zeigt die Frau des Künstlers Camille mit ihrem Sohn Jean an einem windigen Sommertag.",
            "facts_ru": "Это не единственная «Дама с зонтиком» у Моне. Спустя 11 лет он напишет ещё две картины с зонтиками;Сейчас это одна из самых узнаваемых работ импрессионизма, но на выставке 1876 года публика и критики почти не заметили «Прогулку»;Картина так понравилась художнику Джону Сингеру Сардженту, что он написал по её мотивам свою знаменитую работу;На картине нет резких контуров — фигуры буквально сотканы из отдельных быстрых мазков",
            "facts_en": "This is not the only 'Lady with an Umbrella' by Monet. 11 years later he would paint two more paintings with umbrellas;It is now one of the most recognizable works of Impressionism, but at the 1876 exhibition the public and critics barely noticed the painting;The artist John Singer Sargent liked the painting so much that he wrote his famous work based on it;There are no sharp contours in the picture - the figures are literally woven from individual quick strokes",
            "facts_de": "Dies ist nicht die einzige 'Dame mit Sonnenschirm' von Monet. 11 Jahre später malte er zwei weitere Gemälde mit Sonnenschirmen;Es ist heute eines der bekanntesten Werke des Impressionismus, aber auf der Ausstellung von 1876 beachteten Publikum und Kritiker das Gemälde kaum;Das Gemälde gefiel dem Künstler John Singer Sargent so gut, dass er sein berühmtes Werk danach schuf;Es gibt keine scharfen Konturen auf dem Bild - die Figuren sind buchstäblich aus einzelnen schnellen Pinselstrichen gewoben",
            "image": "Monet-Woman_with_Parasol.jpg"
        },
        # 9. Падший ангел
        {
            "title_ru": "Падший ангел",
            "title_en": "Fallen Angel",
            "title_de": "Gefallener Engel",
            "author_ru": "Александр Кабанель",
            "author_en": "Alexandre Cabanel",
            "author_de": "Alexandre Cabanel",
            "year": 1847,
            "technique_ru": "Холст, масло",
            "technique_en": "Canvas, oil",
            "technique_de": "Öl auf Leinwand",
            "dimensions": "120.5 × 196.5 см",
            "direction_ru": "Романтизм",
            "direction_en": "Romanticism",
            "direction_de": "Romantik",
            "description_ru": "Картина французского художника Александра Кабанеля изображает Дьявола после его падения с небес. Романтическая работа, фигура падшего ангела написана таким образом, словно перед нами греческий бог или герой.",
            "description_en": "The painting by French artist Alexandre Cabanel depicts the Devil after his fall from heaven. A romantic work, the figure of a fallen angel is painted in such a way as if we were looking at a Greek god or hero.",
            "description_de": "Das Gemälde des französischen Künstlers Alexandre Cabanel zeigt den Teufel nach seinem Fall aus dem Himmel. Ein romantisches Werk, die Figur des gefallenen Engels ist so gemalt, als stünde ein griechischer Gott oder Held vor uns.",
            "facts_ru": "На момент написания картины художнику было 24 года;Картина вдохновлена поэмой Джона Мильтона «Потерянный рай»;Данная картина шокировала комиссию, так как Дьявола раньше никто не писал;За год до этого он написал эту же фигуру, сидящую в позе отчаяния",
            "facts_en": "At the time of painting, the artist was 24 years old;The painting is inspired by John Milton's poem 'Paradise Lost';This picture shocked the commission, since no one had painted the Devil before;The year before, he painted the same figure, sitting in a pose of despair",
            "facts_de": "Zum Zeitpunkt der Entstehung des Gemäldes war der Künstler 24 Jahre alt;Das Gemälde ist von John Miltons Gedicht 'Paradise Lost' inspiriert;Dieses Bild schockierte die Kommission, da noch nie jemand den Teufel gemalt hatte;Ein Jahr zuvor malte er dieselbe Figur in einer Pose der Verzweiflung",
            "image": "Cabanel-Fallen_Angel.jpg"
        }
    ]
    
    for i, p in enumerate(paintings_list):
        # Распределяем картины по кругу на карте
        angle = (i / len(paintings_list)) * 2 * math.pi
        map_x = base_x + radius * math.cos(angle)
        map_y = base_y + radius * math.sin(angle)
        
        paintings.append((
            p["title_ru"], p["title_en"], p["title_de"],
            p["author_ru"], p["author_en"], p["author_de"],
            p["year"],
            f"static/images/paintings/{p['image']}",
            p["description_ru"], p["description_en"], p["description_de"],
            p["facts_ru"], p["facts_en"], p["facts_de"],
            p["technique_ru"], p["technique_en"], p["technique_de"],
            p["dimensions"],
            p["direction_ru"], p["direction_en"], p["direction_de"],
            map_x, map_y, 0, 0
        ))
    
    return paintings

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
    print(f"\n{'='*60}")
    print(f"📊 [БЭКЕНД] ЗАПРОС СТАТИСТИКИ")
    print(f"📊 [БЭКЕНД] range = {range_param}")
    print(f"{'='*60}")
    
    conn = get_db_connection()
    
    # Определяем фильтр по дате
    date_filter = ""
    if range_param == 'today':
        date_filter = "WHERE visit_time >= date('now')"
        print(f"📅 [БЭКЕНД] Фильтр: СЕГОДНЯ")
        print(f"📅 [БЭКЕНД] SQL: {date_filter}")
    elif range_param == 'week':
        date_filter = "WHERE visit_time >= datetime('now', '-7 days')"
        print(f"📅 [БЭКЕНД] Фильтр: НЕДЕЛЯ")
        print(f"📅 [БЭКЕНД] SQL: {date_filter}")
    elif range_param == 'month':
        date_filter = "WHERE visit_time >= datetime('now', '-30 days')"
        print(f"📅 [БЭКЕНД] Фильтр: МЕСЯЦ")
        print(f"📅 [БЭКЕНД] SQL: {date_filter}")
    elif range_param == 'year':
        date_filter = "WHERE visit_time >= datetime('now', '-1 year')"
        print(f"📅 [БЭКЕНД] Фильтр: ГОД")
        print(f"📅 [БЭКЕНД] SQL: {date_filter}")
    else:
        print(f"📅 [БЭКЕНД] Фильтр: ВСЁ ВРЕМЯ (без фильтра)")
    
    # Общая статистика
    print(f"\n📈 [БЭКЕНД] ОБЩАЯ СТАТИСТИКА:")
    
    total_visits = conn.execute(f'''
        SELECT COUNT(*) FROM visits
        {date_filter}
    ''').fetchone()[0]
    print(f"  ✅ Всего посещений: {total_visits}")
    
    unique_users = conn.execute(f'''
        SELECT COUNT(DISTINCT user_id) FROM visits
        {date_filter}
    ''').fetchone()[0]
    print(f"  ✅ Уникальных пользователей: {unique_users}")
    
    avg_duration = conn.execute(f'''
        SELECT AVG(duration_seconds) FROM visits
        {date_filter}
    ''').fetchone()[0] or 0
    print(f"  ✅ Средняя длительность: {round(avg_duration, 1)} сек")
    
    paintings_per_user = 0
    if unique_users > 0:
        paintings_per_user = total_visits / unique_users
    print(f"  ✅ Картин на пользователя: {round(paintings_per_user, 2)}")
    
    # Популярные картины
    print(f"\n🏆 [БЭКЕНД] ПОПУЛЯРНЫЕ КАРТИНЫ:")
    popular = conn.execute(f'''
        SELECT p.id, p.title_ru, p.title_en, p.author_ru, p.author_en, COUNT(v.id) as view_count
        FROM paintings p
        LEFT JOIN visits v ON p.id = v.painting_id
        {date_filter.replace('WHERE', 'AND') if date_filter else ''}
        GROUP BY p.id
        ORDER BY view_count DESC
        LIMIT 5
    ''').fetchall()
    
    for i, row in enumerate(popular, 1):
        print(f"  {i}. {row['title_ru']} - {row['view_count']} просмотров")
    
    # По задержке внимания
    print(f"\n⏱️ [БЭКЕНД] ПО ЗАДЕРЖКЕ ВНИМАНИЯ:")
    attention = conn.execute(f'''
        SELECT p.id, p.title_ru, p.title_en, p.author_ru, p.author_en, AVG(v.duration_seconds) as avg_duration
        FROM paintings p
        JOIN visits v ON p.id = v.painting_id
        {date_filter.replace('WHERE', 'AND') if date_filter else ''}
        GROUP BY p.id
        ORDER BY avg_duration DESC
        LIMIT 5
    ''').fetchall()
    
    for i, row in enumerate(attention, 1):
        avg_min = round(row['avg_duration'] / 60, 1) if row['avg_duration'] else 0
        print(f"  {i}. {row['title_ru']} - {avg_min} мин")
    
    # === СТАТИСТИКА ПО ВРЕМЕНИ В ЗАВИСИМОСТИ ОТ ДИАПАЗОНА ===
    stats_data = {}
    
    if range_param == 'today':
        print(f"\n🕐 [БЭКЕНД] ГЕНЕРИРУЕМ ПОЧАСОВУЮ СТАТИСТИКУ (24 часа)")
        
        hourly_stats = conn.execute(f'''
            SELECT strftime('%H', visit_time) as hour, COUNT(*) as count
            FROM visits
            {date_filter}
            GROUP BY hour
            ORDER BY hour
        ''').fetchall()
        
        print(f"  📈 Найдено записей по часам: {len(hourly_stats)}")
        
        hours = [f"{h:02d}:00" for h in range(24)]
        visit_counts = [0] * 24
        for stat in hourly_stats:
            hour = int(stat['hour'])
            visit_counts[hour] = stat['count']
            if stat['count'] > 0:
                print(f"    Час {hour:02d}:00 - {stat['count']} пос.")
        
        stats_data['hourly_stats'] = {"labels": hours, "data": visit_counts}
        print(f"  📤 Отправляем hourly_stats: {len(hours)} меток, сумма={sum(visit_counts)}")
        
    elif range_param == 'week':
        print(f"\n📅 [БЭКЕНД] ГЕНЕРИРУЕМ СТАТИСТИКУ ПО ДНЯМ НЕДЕЛИ (7 дней)")
        
        daily_stats = conn.execute(f'''
            SELECT strftime('%w', visit_time) as weekday, 
                   strftime('%Y-%m-%d', visit_time) as day,
                   COUNT(*) as count
            FROM visits
            {date_filter}
            GROUP BY day
            ORDER BY day
        ''').fetchall()
        
        print(f"  📈 Найдено записей по дням: {len(daily_stats)}")
        for stat in daily_stats:
            print(f"    День {stat['day']} - {stat['count']} пос.")
        
        day_names_short = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        
        days = []
        counts = []
        today = datetime.now().date()
        
        for i in range(7):
            day = today - timedelta(days=6-i)
            day_str = day.strftime('%Y-%m-%d')
            
            weekday_index = day.weekday()
            day_label = f"{day_names_short[weekday_index]} {day.strftime('%d.%m')}"
            days.append(day_label)
            
            count = 0
            for stat in daily_stats:
                if stat['day'] == day_str:
                    count = stat['count']
                    break
            counts.append(count)
            print(f"    {day_label}: {count} пос.")
        
        stats_data['daily_stats'] = {"labels": days, "data": counts}
        print(f"  📤 Отправляем daily_stats: {len(days)} дней, сумма={sum(counts)}")
        
    elif range_param == 'month':
        print(f"\n📅 [БЭКЕНД] ГЕНЕРИРУЕМ СТАТИСТИКУ ПО ДНЯМ (30 дней)")
        
        daily_stats = conn.execute(f'''
            SELECT strftime('%Y-%m-%d', visit_time) as day, COUNT(*) as count
            FROM visits
            {date_filter}
            GROUP BY day
            ORDER BY day
        ''').fetchall()
        
        print(f"  📈 Найдено записей по дням: {len(daily_stats)}")
        
        days = []
        counts = []
        today = datetime.now().date()
        
        for i in range(30):
            day = today - timedelta(days=29-i)
            day_str = day.strftime('%Y-%m-%d')
            day_label = day.strftime('%d.%m')
            days.append(day_label)
            
            count = 0
            for stat in daily_stats:
                if stat['day'] == day_str:
                    count = stat['count']
                    break
            counts.append(count)
            if count > 0:
                print(f"    {day_label}: {count} пос.")
        
        stats_data['daily_stats'] = {"labels": days, "data": counts}
        print(f"  📤 Отправляем daily_stats: {len(days)} дней, сумма={sum(counts)}")
        
    elif range_param == 'year':
        print(f"\n📅 [БЭКЕНД] ГЕНЕРИРУЕМ СТАТИСТИКУ ПО МЕСЯЦАМ (12 месяцев)")
        
        monthly_stats = conn.execute(f'''
            SELECT strftime('%Y-%m', visit_time) as month, COUNT(*) as count
            FROM visits
            {date_filter}
            GROUP BY month
            ORDER BY month
        ''').fetchall()
        
        print(f"  📈 Найдено записей по месяцам: {len(monthly_stats)}")
        
        months = []
        counts = []
        today = datetime.now()
        
        month_names = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 
                      'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
        
        for i in range(12):
            month_date = today - timedelta(days=30*(11-i))
            month_str = month_date.strftime('%Y-%m')
            month_label = month_names[month_date.month - 1]
            months.append(month_label)
            
            count = 0
            for stat in monthly_stats:
                if stat['month'] == month_str:
                    count = stat['count']
                    break
            counts.append(count)
            if count > 0:
                print(f"    {month_label}: {count} пос.")
        
        stats_data['monthly_stats'] = {"labels": months, "data": counts}
        print(f"  📤 Отправляем monthly_stats: {len(months)} месяцев, сумма={sum(counts)}")
        
    else:  # 'all'
        print(f"\n📅 [БЭКЕНД] ГЕНЕРИРУЕМ СТАТИСТИКУ ПО ГОДАМ")
        
        yearly_stats = conn.execute(f'''
            SELECT strftime('%Y', visit_time) as year, COUNT(*) as count
            FROM visits
            GROUP BY year
            ORDER BY year
        ''').fetchall()
        
        print(f"  📈 Найдено записей по годам: {len(yearly_stats)}")
        
        years = []
        counts = []
        
        if yearly_stats:
            for stat in yearly_stats[-5:]:
                years.append(stat['year'])
                counts.append(stat['count'])
                print(f"    {stat['year']}: {stat['count']} пос.")
        else:
            current_year = datetime.now().year
            years = [str(current_year - i) for i in range(4, -1, -1)]
            counts = [0] * 5
            print(f"    Нет данных, создаем пустые года: {years}")
        
        stats_data['monthly_stats'] = {"labels": years, "data": counts}
        print(f"  📤 Отправляем monthly_stats (годы): {len(years)} лет, сумма={sum(counts)}")
    
    # Построение среднего маршрута
    print(f"\n🗺️ [БЭКЕНД] ПОСТРОЕНИЕ СРЕДНЕГО МАРШРУТА:")
    
    visits_rows = conn.execute(f'''
        SELECT user_id, painting_id, visit_time
        FROM visits
        {date_filter}
        ORDER BY user_id, visit_time
    ''').fetchall()
    
    print(f"  📈 Всего записей о посещениях: {len(visits_rows)}")
    
    user_dict = defaultdict(list)
    for row in visits_rows:
        user_dict[row['user_id']].append((row['visit_time'], row['painting_id']))
    
    print(f"  👥 Уникальных пользователей с историей: {len(user_dict)}")
    
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
    
    print(f"  🔗 Найдено последовательностей (>=2 картин): {len(user_sequences)}")
    
    avg_paintings_route = []
    if user_sequences:
        first_paintings = Counter(seq[0] for seq in user_sequences if seq)
        if first_paintings:
            most_common_first = first_paintings.most_common(1)[0][0]
            route_ids = [most_common_first]
            
            print(f"  🎯 Начальная картина ID: {most_common_first}")
            
            for step in range(10):
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
                    print(f"  ⏹️ Нет переходов, остановка на шаге {step}")
                    break
                next_id = transitions.most_common(1)[0][0]
                if next_id in route_ids:
                    print(f"  🔄 Обнаружен цикл, остановка")
                    break
                route_ids.append(next_id)
                print(f"  ➡️ Шаг {step+1}: ID {next_id}")
            
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
                        print(f"    ✅ {p['title_ru']}")
    
    conn.close()
    print(f"\n🔒 [БЭКЕНД] Соединение с БД закрыто")
    
    # Формируем ответ
    response = {
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
        "average_route": ["Зал импрессионистов", "Классическая живопись", "Современное искусство", "Скульптуры"],
        "average_paintings_route": avg_paintings_route
    }
    
    # Добавляем соответствующую статистику в зависимости от диапазона
    response.update(stats_data)
    
    print(f"\n📦 [БЭКЕНД] ИТОГОВЫЙ ОТВЕТ:")
    print(f"  🔑 Ключи в ответе: {list(response.keys())}")
    if 'hourly_stats' in response:
        print(f"  📊 hourly_stats: {len(response['hourly_stats']['data'])} значений")
    if 'daily_stats' in response:
        print(f"  📊 daily_stats: {len(response['daily_stats']['data'])} значений")
    if 'monthly_stats' in response:
        print(f"  📊 monthly_stats: {len(response['monthly_stats']['data'])} значений")
    
    print(f"{'='*60}\n")
    
    return jsonify(response)

@app.route('/api/admin/paintings', methods=['POST'])
@login_required
def create_painting():
    data = request.json
    required = ['title_ru','title_en','title_de','author_ru','author_en','author_de',
                'year','image_uri','description_ru','description_en','description_de',
                'facts_ru','facts_en','facts_de','drawing_technique_ru','drawing_technique_en',
                'drawing_technique_de','dimensions','art_direction_ru','art_direction_en',
                'art_direction_de']
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO paintings (title_ru, title_en, title_de, author_ru, author_en, author_de,
            year, image_uri, description_ru, description_en, description_de,
            facts_ru, facts_en, facts_de, drawing_technique_ru, drawing_technique_en,
            drawing_technique_de, dimensions, art_direction_ru, art_direction_en,
            art_direction_de, map_x, map_y, views, avg_time)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ?,?,?)
    ''', (
        data['title_ru'], data['title_en'], data['title_de'],
        data['author_ru'], data['author_en'], data['author_de'],
        data['year'], data['image_uri'],
        data['description_ru'], data['description_en'], data['description_de'],
        data['facts_ru'], data['facts_en'], data['facts_de'],
        data['drawing_technique_ru'], data['drawing_technique_en'], data['drawing_technique_de'],
        data['dimensions'],
        data['art_direction_ru'], data['art_direction_en'], data['art_direction_de'],
        data.get('map_x', 50.0), data.get('map_y', 50.0), 0, 0
    ))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"}), 201

@app.route('/api/admin/paintings/<int:painting_id>', methods=['PUT'])
@login_required
def update_painting(painting_id):
    data = request.json
    conn = get_db_connection()
    # Строим динамический UPDATE только по переданным полям
    allowed = ['title_ru','title_en','title_de','author_ru','author_en','author_de',
               'year','image_uri','description_ru','description_en','description_de',
               'facts_ru','facts_en','facts_de','drawing_technique_ru','drawing_technique_en',
               'drawing_technique_de','dimensions','art_direction_ru','art_direction_en',
               'art_direction_de','map_x','map_y']
    updates = {k: data[k] for k in allowed if k in data}
    if not updates:
        return jsonify({"error": "No valid fields"}), 400
    set_clause = ', '.join(f"{k}=?" for k in updates.keys())
    values = list(updates.values()) + [painting_id]
    conn.execute(f"UPDATE paintings SET {set_clause} WHERE id=?", values)
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})

@app.route('/api/admin/paintings/<int:painting_id>', methods=['DELETE'])
@login_required
def delete_painting(painting_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM paintings WHERE id=?", (painting_id,))
    # Удаляем связанные отзывы и посещения
    conn.execute("DELETE FROM reviews WHERE painting_id=?", (painting_id,))
    conn.execute("DELETE FROM visits WHERE painting_id=?", (painting_id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})

@app.route('/api/admin/reviews')
@login_required
def get_all_reviews():
    conn = get_db_connection()
    reviews = conn.execute('''
        SELECT r.id, r.painting_id, r.author, r.text, r.rating,
               r.approved, r.created_at,
               p.title_ru, p.title_en
        FROM reviews r
        JOIN paintings p ON r.painting_id = p.id
        ORDER BY r.created_at DESC
    ''').fetchall()
    conn.close()
    return jsonify({"reviews": [dict(row) for row in reviews]})

@app.route('/api/admin/reviews/<int:review_id>/approve', methods=['POST'])
@login_required
def approve_review(review_id):
    conn = get_db_connection()
    conn.execute("UPDATE reviews SET approved=TRUE WHERE id=?", (review_id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})

@app.route('/api/admin/reviews/<int:review_id>/reject', methods=['POST'])
@login_required
def reject_review(review_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM reviews WHERE id=?", (review_id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})

@app.route('/api/search')
def search_paintings():
    query = request.args.get('q', '').lower()
    conn = get_db_connection()
    paintings = conn.execute('''
        SELECT * FROM paintings 
        WHERE LOWER(title_ru) LIKE ? OR LOWER(title_en) LIKE ? 
        OR LOWER(author_ru) LIKE ? OR LOWER(author_en) LIKE ?
    ''', (f'%{query}%', f'%{query}%', f'%{query}%', f'%{query}%')).fetchall()
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

@app.route('/api/reviews/<int:painting_id>')
def get_reviews(painting_id):
    conn = get_db_connection()
    reviews = conn.execute('''
        SELECT id, author, text, rating, created_at
        FROM reviews
        WHERE painting_id = ? AND approved = 1
        ORDER BY created_at DESC
    ''', (painting_id,)).fetchall()
    conn.close()
    return jsonify({"reviews": [dict(row) for row in reviews]})

@app.route('/api/reviews/<int:painting_id>', methods=['POST'])
def add_review(painting_id):
    data = request.json
    author = data.get('author', 'Аноним')
    text = data.get('text', '')
    rating = data.get('rating', 5)
    
    if not text.strip():
        return jsonify({"error": "Empty review"}), 400
    
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO reviews (painting_id, author, text, rating) 
        VALUES (?, ?, ?, ?)
    ''', (painting_id, author, text, rating))
    conn.commit()
    conn.close()
    
    return jsonify({"status": "ok"})

@app.route('/api/pause-carousel', methods=['POST'])
def pause_carousel():
    """Сигнал что пользователь смотрит картину - не обновлять главную"""
    return jsonify({"status": "ok"})

@app.route('/api/upload', methods=['POST'])
@login_required
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file"}), 400
    # Генерируем уникальное имя
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    safe_name = f"{timestamp}_{file.filename}"
    filepath = os.path.join('static', 'images', 'paintings', safe_name)
    file.save(filepath)
    url = f"/static/images/paintings/{safe_name}"
    return jsonify({"url": url})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)