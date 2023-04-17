const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");
const path = require("path"); // biblioteca do Node que resolve caminhos de path em OS diferentes

async function sqliteConnection () {
  const database = await sqlite.open({ // .open para abrir uma conexão
    filename: path.resolve(__dirname, "..", "database.db"), // __dirname identifica onde estou dentro do projeto, ".." volta uma pasta
    driver: sqlite3.Database
  });

  return database;
}

module.exports = sqliteConnection;