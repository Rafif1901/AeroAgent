const { Pool } = require('pg');

const isLocal = process.env.PG_URI && (process.env.PG_URI.includes('localhost') || process.env.PG_URI.includes('127.0.0.1'));

const pool = new Pool({
    connectionString: process.env.PG_URI,
    ssl: isLocal ? false : { rejectUnauthorized: false }
});

const connectPG = async () => {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL');

        // 1. Tabel Users (Sesuai Class Diagram: memiliki role admin/public)
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin',
                institution VARCHAR(100) DEFAULT 'DLH DKI Jakarta',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Tabel Warning & Priority Logs (Output Agent 2, 3, dan 4 + Human-in-the-Loop)
        await client.query(`
            CREATE TABLE IF NOT EXISTS warning_logs (
                id SERIAL PRIMARY KEY,
                station_id VARCHAR(50) NOT NULL,
                location_name VARCHAR(100),
                severity_score FLOAT NOT NULL,
                affected_area FLOAT NOT NULL,
                pollution_source VARCHAR(100) NOT NULL,
                priority_index FLOAT NOT NULL,
                urgency_level VARCHAR(30) NOT NULL,
                target_institution VARCHAR(100) NOT NULL,
                recommended_action TEXT NOT NULL,
                warning_message TEXT NOT NULL,
                is_approved BOOLEAN DEFAULT FALSE,
                approved_by VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Tabel Chatbot Feedback (Sesuai GUI Bab 3.3: Thumbs Up/Down & Report Answer)
        await client.query(`
            CREATE TABLE IF NOT EXISTS chatbot_feedback (
                id SERIAL PRIMARY KEY,
                user_query TEXT,
                bot_response TEXT,
                rating VARCHAR(10) NOT NULL,
                reason VARCHAR(50),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        client.release();
    } catch (error) {
        console.error('Failed to connect to PostgreSQL:', error.message);
        process.exit(1);
    }
};

module.exports = { pool, connectPG };