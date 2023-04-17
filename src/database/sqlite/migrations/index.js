const sqliteConnection = require('../../sqlite');
const createUsers = require('./createUsers');

async function migrationsRun () {
  const schemas = [ // schemas vai se referir às tabelas do bando de dados
    createUsers // se refere ao createUsers.js
  ].join(''); // tipo de separação entre os elementos (nesse caso, nenhuma)

  sqliteConnection()
    .then(db => db.exec(schemas))
    .catch(error => console.error(error));
}

module.exports = migrationsRun;