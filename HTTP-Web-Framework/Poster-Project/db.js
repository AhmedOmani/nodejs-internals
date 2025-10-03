const { Pool } = require('pg');
require("dotenv").config();

// Use environment variables if provided; otherwise fallback to local defaults
const pool = new Pool({
    host: process.env.PGHOST ,
    port: process.env.PGPORT ,
    user: process.env.PGUSER ,
    password: process.env.PGPASSWORD ,
    database: process.env.PGDATABASE 
});

async function ensureSessionsTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);
}

async function ensureUsersAndPostsTables() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
        );
    `);

    const usersCount = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    if (usersCount.rows[0].count === 0) {
        await pool.query(
            `INSERT INTO users(name, username, password) VALUES 
            ($1,$2,$3),
            ($4,$5,$6),
            ($7,$8,$9)`,
            [
                'Ahmed Saber','Omani','123',
                'Ahmed Ali','lolo','123',
                'Joseph','joseph','123'
            ]
        );
    }

    const postsCount = await pool.query('SELECT COUNT(*)::int AS count FROM posts');
    if (postsCount.rows[0].count === 0) {
        // Fetch user ids to map usernames deterministically
        const { rows: seededUsers } = await pool.query('SELECT id, username FROM users');
        const userMap = new Map(seededUsers.map(u => [u.username, u.id]));
        const userId1 = userMap.get('Omani');
        const userId2 = userMap.get('lolo');
        if (userId1 && userId2) {
            await pool.query(
                `INSERT INTO posts(title, body, user_id) VALUES 
                ($1,$2,$3),
                ($4,$5,$6)`,
                [
                    'Adele Song','Hola from the other side', userId1,
                    'TikTok music','Fall in love again and again', userId2
                ]
            );
        }
    }
}

module.exports = { pool, ensureSessionsTable, ensureUsersAndPostsTables };


