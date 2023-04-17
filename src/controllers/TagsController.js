const knex = require('../database/knex');

class TagsController {
  async index(req, res) {
    const user_id = req.user.id; // pegar o user_id passado no token

    const tags = await knex('tags') // referenciado a tabela de tags do database
      .where({ user_id })
      .groupBy("name") // para tirar os duplicados

      return res.json(tags);
  }
}

module.exports = TagsController;