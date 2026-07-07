package createtable

import (
	"database/sql"
	"log"

	_ "modernc.org/sqlite"
)

func main() {
	db, err := sql.Open("sqlite3", "./data.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	sqlStatement := `
			CREATE TABLE IF NOT EXISTS users (
			id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL,
			password TEXT NOT NULL,
			isAdmin INTEGER NOT NULL
		);
	`

	_, err = db.Exec(sqlStatement)
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Tables 'users' dah dibuat tuh")

}
