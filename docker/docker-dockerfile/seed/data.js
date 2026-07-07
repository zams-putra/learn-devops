import Database from "better-sqlite3";

const db = new Database("data.db");

const stmt = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
);
`

db.exec(stmt);

const chef = db
    .prepare("SELECT * FROM users WHERE username=?")
    .get("priagalak");

if (!chef) {
    db.prepare(`
        INSERT INTO users(username,password,role)
        VALUES(?,?,?)
    `).run(
        "priagalak",
        "beefgalak123",
        "masterchef"
    );
}


db.prepare(`
    INSERT INTO users(username,password,role)
    VALUES(?,?,?)
`).run(
    "johnson",
    "yourjohn",
    "user"
);

db.prepare(`
    INSERT INTO users(username,password,role)
    VALUES(?,?,?)
`).run(
    "owi",
    "sayaakanlawan",
    "user"
);

db.prepare(`
    INSERT INTO users(username,password,role)
    VALUES(?,?,?)
`).run(
    "owo",
    "haeantekantekasing",
    "user"
);