import dbpool from "./client.ts";

const createTables = async () => {
    try {
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
            `)
            console.log("Tables created");

            await dbpool.query(`
                create table if not exists users (
                id serial primary key,
                email text unique not null,
                password text not null,
                created_at timestamp default now()
                )
                `);
                console.log("User Table Created")
            process.exit(0);
    } catch (error: any) {
        console.error("Migration error:", error.message);
        process.exit(1);
    }
};
createTables();