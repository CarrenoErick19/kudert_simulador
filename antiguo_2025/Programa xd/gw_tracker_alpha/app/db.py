import sqlite3
from sqlite3 import Error

# Función para crear la conexión a la base de datos
def create_connection(db_file):
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Error as e:
        print(e)
    return conn

# Función para crear una tabla
def create_table(conn):
    try:
        sql_create_characters_table = """ 
        CREATE TABLE IF NOT EXISTS characters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            rarity INTEGER,
            attribute TEXT,
            role TEXT,
            zodiac TEXT,
            icon TEXT,
            image TEXT,
            thumbnail TEXT
        );
        """
        cursor = conn.cursor()
        cursor.execute(sql_create_characters_table)
    except Error as e:
        print(e)
