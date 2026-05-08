import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/fall_detection")
engine = create_engine(DATABASE_URL)

def sync_db():
    columns_to_add = [
        ("elderly_profiles", "video_path", "VARCHAR"),
        ("elderly_profiles", "document_path", "VARCHAR"),
        ("elderly_profiles", "emergency_contact", "VARCHAR"),
        ("elderly_profiles", "emergency_phone", "VARCHAR"),
        ("devices", "cpu_usage", "FLOAT"),
        ("devices", "temperature", "FLOAT"),
        ("devices", "uptime", "VARCHAR"),
    ]
    
    with engine.connect() as conn:
        for table, column, type in columns_to_add:
            try:
                # Check if column exists
                check_query = text(f"""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='{table}' AND column_name='{column}';
                """)
                result = conn.execute(check_query).fetchone()
                
                if not result:
                    print(f"Adding column {column} to table {table}...")
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {type}"))
                    conn.commit()
                else:
                    print(f"Column {column} already exists in {table}.")
            except Exception as e:
                print(f"Error adding column {column}: {e}")

if __name__ == "__main__":
    sync_db()
    print("Database sync complete.")
