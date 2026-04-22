import dbpool from "./client.ts";

export async function createUser(email: string, password: string) {
    const result = await dbpool.query (
        `insert into users (email, password) values ($1, $2) returning id, email`,
        [email, password]
    );
    return result.rows[0];  
}

export async function findUserByEmail(email: string) {
    const result = await dbpool.query (
        `select * from users where email = $1`,
        [email]
    );
    return result.rows[0];
}