import os
import random
from flask import Flask, jsonify, request
import mysql.connector

app = Flask(__name__)

def get_db_connection():
    host = os.environ.get("CLOUD_SQL_CONNECTION_NAME")
    user = os.environ.get("DB_USER")
    password = os.environ.get("DB_PASSWORD")
    dbname = os.environ.get("DB_NAME")
    
    conn = mysql.connector.connect(
        user=user,
        password=password,
        host=host,
        database=dbname
    )
    return conn

@app.route("/api/generate", methods=["POST"])
def generate_random_numbers():
    instance_name = request.form.get("instance_name")
    num_numbers = int(request.form.get("num_numbers", 1000))

    conn = get_db_connection()
    cursor = conn.cursor()

    for _ in range(num_numbers):
        num = random.randint(0, 100000)
        cursor.execute(
            "INSERT INTO random_numbers (instance_name, number) VALUES (%s, %s)",
            (instance_name, num)
        )

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"status": "success"})

@app.route("/api/results", methods=["GET"])
def get_results():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT instance_name, COUNT(*) as total FROM random_numbers GROUP BY instance_name"
    )
    instance_totals = cursor.fetchall()

    cursor.execute(
        "SELECT instance_name, number as max_number FROM random_numbers WHERE number = (SELECT MAX(number) FROM random_numbers)"
    )
    max_number = cursor.fetchone()

    cursor.execute(
        "SELECT instance_name, number as min_number FROM random_numbers WHERE number = (SELECT MIN(number) FROM random_numbers)"
    )
    min_number = cursor.fetchone()

    cursor.close()
    conn.close()

    return jsonify({
        "instance_totals": instance_totals,
        "max_number": max_number,
        "min_number": min_number,
    })

if __name__ == "__main__":
    app.run(host="localhost", port=8080, debug=True)
