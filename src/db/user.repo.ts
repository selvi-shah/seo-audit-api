import dbpool from "./client.ts";
import type { User } from "../types/auth.ts";


export async function createUser(
    email: string,
    password: string,
    phone: string
) {
    const result = await dbpool.query<User>(
        `INSERT INTO users (email, password, phone)
         VALUES ($1, $2, $3)
         RETURNING id, email, phone, name, role, is_active, created_at, last_login_at`,
        [email, password, phone]
    );
    return result.rows[0];
}

export async function findUserByEmail(email: string) {
    const result = await dbpool.query<User>(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );
    return result.rows[0] ?? null;
}


export async function findUserById(id: number) {
    const result = await dbpool.query<User>(
        `SELECT * FROM users WHERE id = $1`,
        [id]
    );
    return result.rows[0] ?? null;
}

export async function updateFirebaseUid(
    userId: number,
    firebaseUid: string
) {
    const result = await dbpool.query<User>(
        `UPDATE users
         SET firebase_uid  = $1,
             last_login_at = NOW()
         WHERE id = $2
         RETURNING id, email, phone, name, role, is_active, created_at, last_login_at`,
        [firebaseUid, userId]
    );
    return result.rows[0];
}

export async function saveRefreshToken(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
    ipAddress: string | null,
    userAgent: string | null
) {
    await dbpool.query(
        `INSERT INTO refresh_tokens
            (user_id, token_hash, expires_at, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, tokenHash, expiresAt, ipAddress, userAgent]
    );
}

export async function findRefreshToken(tokenHash: string) {
    const result = await dbpool.query(
        `SELECT rt.*, u.id as user_id, u.email, u.phone, u.role, u.is_active
         FROM refresh_tokens rt
         JOIN users u ON u.id = rt.user_id
         WHERE rt.token_hash = $1
           AND rt.expires_at > NOW()
           AND rt.revoked_at IS NULL`,
        [tokenHash]
    );
    return result.rows[0] ?? null;
}

export async function revokeRefreshToken(tokenHash: string, userId: number) {
    await dbpool.query(
        `UPDATE refresh_tokens
         SET revoked_at = NOW()
         WHERE token_hash = $1 AND user_id = $2`,
        [tokenHash, userId]
    );
}