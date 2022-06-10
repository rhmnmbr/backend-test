import psycopg2

from config import config


def get_user_by_nik(nik: str):
    params = config()
    conn = psycopg2.connect(**params)
    cur = conn.cursor()
    sql = "SELECT * FROM users WHERE nik = %s;"
    cur.execute(sql, (nik,))
    rows = cur.fetchall()
    cur.close()
    return rows


def create_user(nik: str, role: str, password: str):
    params = config()
    conn = psycopg2.connect(**params)
    cur = conn.cursor()
    sql = "INSERT INTO users (nik, role, password) VALUES (%s, %s, %s);"
    cur.execute(sql, (nik, role, password))
    conn.commit()
    cur.close()
