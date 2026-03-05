import mysql from "mysql2/promise";

export async function createDbConnection() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL missing");

    const url = new URL(dbUrl);
    return mysql.createConnection({
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.slice(1),
        ssl: { rejectUnauthorized: false },
        connectTimeout: 10000,
    });
}
