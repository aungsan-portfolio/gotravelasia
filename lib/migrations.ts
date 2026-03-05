import type mysql from "mysql2/promise";

const MIGRATIONS = [
    `CREATE TABLE IF NOT EXISTS flightPriceAlerts (
        id                INT AUTO_INCREMENT PRIMARY KEY,
        email             VARCHAR(320) NOT NULL,
        origin            VARCHAR(3)   NOT NULL,
        destination       VARCHAR(3)   NOT NULL,
        departDate        VARCHAR(10),
        returnDate        VARCHAR(10),
        targetPrice       INT          NOT NULL DEFAULT 0,
        lastNotifiedPrice INT,
        currency          VARCHAR(3)   NOT NULL DEFAULT 'USD',
        routeId           VARCHAR(20),
        source            VARCHAR(20)  NOT NULL DEFAULT 'track_button',
        isActive          TINYINT(1)   NOT NULL DEFAULT 1,
        createdAt         TIMESTAMP    NOT NULL DEFAULT NOW(),
        updatedAt         TIMESTAMP    NOT NULL DEFAULT NOW() ON UPDATE NOW()
    )`,
];

const COLUMN_MIGRATIONS = [
    `ALTER TABLE flightPriceAlerts ADD COLUMN routeId VARCHAR(20)`,
    `ALTER TABLE flightPriceAlerts ADD COLUMN source VARCHAR(20) NOT NULL DEFAULT 'track_button'`,
    `ALTER TABLE flightPriceAlerts ADD COLUMN returnDate VARCHAR(10)`,
    `ALTER TABLE flightPriceAlerts ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'USD'`,
    `ALTER TABLE flightPriceAlerts ADD COLUMN lastNotifiedPrice INT`,
];

export async function runMigrations(connection: mysql.Connection) {
    for (const sql of MIGRATIONS) {
        await connection.execute(sql);
    }
    for (const sql of COLUMN_MIGRATIONS) {
        try {
            await connection.execute(sql);
        } catch (e: any) {
            const isDup =
                e.code === "ER_DUP_FIELDNAME" ||
                e.errno === 1060 ||
                e.message?.includes("Duplicate column");
            if (!isDup) throw e;
        }
    }
}
