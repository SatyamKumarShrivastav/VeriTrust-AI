"""
VeriTrust AI — MySQL Database Setup Script
Creates the database if it does not exist.
"""
import mysql.connector
import sys

connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Kri&Satya$19@sql",
    port=3306
)

cursor = connection.cursor()
cursor.execute("CREATE DATABASE IF NOT EXISTS veritrust_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
cursor.execute("SHOW DATABASES LIKE 'veritrust_ai';")
result = cursor.fetchone()
if result:
    print("OK: Database 'veritrust_ai' is ready.")
else:
    print("FAILED: Database creation failed.")
    sys.exit(1)

cursor.close()
connection.close()
print("Database setup complete.")
