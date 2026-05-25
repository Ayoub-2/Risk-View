import asyncpg
from app.core.config import settings
import json

class Database:
    def __init__(self):
        self.pool = None

    async def connect(self):
        # We need a custom init to parse jsonb to dict
        async def init(conn):
            await conn.set_type_codec(
                'jsonb',
                encoder=json.dumps,
                decoder=json.loads,
                schema='pg_catalog'
            )
            
        self.pool = await asyncpg.create_pool(
            settings.DATABASE_URL,
            init=init
        )
        await self.create_tables()

    async def disconnect(self):
        if self.pool:
            await self.pool.close()

    async def create_tables(self):
        async with self.pool.acquire() as conn:
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    hashed_password VARCHAR(255) NOT NULL
                );
            ''')
            
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS assessments (
                    id SERIAL PRIMARY KEY,
                    user_id INT REFERENCES users(id) ON DELETE CASCADE,
                    system_name VARCHAR(255),
                    created_at TIMESTAMP,
                    data JSONB
                );
            ''')
            
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS workspace_shares (
                    id SERIAL PRIMARY KEY,
                    assessment_id INT REFERENCES assessments(id) ON DELETE CASCADE,
                    user_id INT REFERENCES users(id) ON DELETE CASCADE,
                    role VARCHAR(50) NOT NULL,
                    UNIQUE(assessment_id, user_id)
                );
            ''')

db = Database()
