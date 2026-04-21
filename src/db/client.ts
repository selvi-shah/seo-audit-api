import { Pool } from 'pg';
import { config } from '../config/env.ts';

const dbpool = new Pool ({
    connectionString: config.databaseUrl,
    ssl: {
        rejectUnauthorized: false
    }
});

export default dbpool;