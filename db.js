const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './blog.db'
  },
  useNullAsDefault: true
});

module.exports = knex;
