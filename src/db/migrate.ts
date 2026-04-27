import dbpool from "./client.ts";

const createTables = async () => {
    try {
        // ── audits table (unchanged) ───────────────────────────────────────
        await dbpool.query(`
            CREATE TABLE IF NOT EXISTS audits (
                id serial primary key,
                url text not null,
                title text,
                meta_description text,
                word_count integer,
                image_count integer,
                images_without_alt integer,
                internal_links integer,
                score integer,
                issues jsonb,
                warnings jsonb,
                recommendations jsonb,
                summary text,
                created_at timestamp default now()
            )
        `);
        console.log("✅ Audits table ready");

        // ── users table (updated) ──────────────────────────────────────────
        await dbpool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id            SERIAL PRIMARY KEY,
                email         TEXT UNIQUE NOT NULL,
                password      TEXT NOT NULL,
                phone         TEXT UNIQUE NOT NULL,
                firebase_uid  TEXT UNIQUE,
                name          TEXT,
                role          TEXT NOT NULL DEFAULT 'user',
                is_active     BOOLEAN NOT NULL DEFAULT TRUE,
                created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                last_login_at TIMESTAMPTZ
            )
        `);
        console.log("✅ Users table ready");

        // ── refresh_tokens table ───────────────────────────────────────────
        await dbpool.query(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token_hash  TEXT NOT NULL UNIQUE,
                expires_at  TIMESTAMPTZ NOT NULL,
                revoked_at  TIMESTAMPTZ,
                ip_address  TEXT,
                user_agent  TEXT,
                created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
        console.log("✅ Refresh tokens table ready");

        // ── indexes ────────────────────────────────────────────────────────
        await dbpool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
            CREATE INDEX IF NOT EXISTS idx_users_phone        ON users(phone);
            CREATE INDEX IF NOT EXISTS idx_users_email        ON users(email);
            CREATE INDEX IF NOT EXISTS idx_refresh_token_hash ON refresh_tokens(token_hash);
            CREATE INDEX IF NOT EXISTS idx_refresh_user_id    ON refresh_tokens(user_id);
        `);
        console.log("✅ Indexes ready");

        process.exit(0);
    } catch (error: any) {
        console.error("❌ Migration error:", error.message);
        process.exit(1);
    }
};

createTables();