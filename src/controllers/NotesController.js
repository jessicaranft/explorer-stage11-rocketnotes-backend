const knex = require('../database/knex');
const notesRoutes = require('../routes/notes.routes');

class NotesController {
  async create(req, res) {
    const { title, description, tags, links } = req.body;
    const user_id = req.user.id;

    // inserindo o conteúdo da tabela notes
    const [note_id] = await knex('notes').insert({
      title,
      description,
      user_id
    });

    // mapeamento do array dos links
    const linksInsert = links.map(link => {
      return {
        note_id,
        url: link
      }
    });

    // inserindo o mapeamento acima dentro da tabela links
    await knex('links').insert(linksInsert);

    // mapeamento do array das tags
    const tagsInsert = tags.map(name => {
      return {
        note_id,
        name,
        user_id
      }
    });

    // inserindo o mapeamento acima dentro da tabela tags
    await knex('tags').insert(tagsInsert);

    return res.json();
  }

  async show(req, res) {
    const { id } = req.params;

    const note = await knex('notes').where({ id }).first();
    const tags = await knex('tags').where({ note_id: id }).orderBy('name');
    const links = await knex('links').where({ note_id: id }).orderBy('created_at');

    return res.json({
      ...note,
      tags,
      links
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    await knex('notes').where({ id }).delete();

    return res.json();
  }

  async index(req, res) {
    const { title, tags } = req.query;
    const user_id = req.user.id;
    let notes;

    if (tags) {
      const filterTags = tags.split(',').map(tag => tag.trim());
      
      notes = await knex('tags')
        .select([ // passando um array de quais campos quero selecionar de ambas as tabelas
          'notes.id', // nomedatabela.campo (de qual tabela quero buscar os campos)
          'notes.title',
          'notes.user_id',
        ])
        .where('notes.user_id', user_id) // filtro de tags baseado no id de usuário
        .whereLike('notes.title', `%${title}%`)
        .whereIn('name', filterTags)
        .innerJoin('notes', 'notes.id', 'tags.note_id') // ('tabela', 'campo_da_tabela', 'campo_em_comum')
        .groupBy('notes.id')
        .orderBy('notes.title');

    } else {
      notes = await knex('notes')
      .where({ user_id })
      .whereLike('title', `%${title}%`) // a % indica que o termo digitado na busca pode estar em qualquer parte do título da nota
      .orderBy('title');
    }

    const userTags = await knex('tags').where({ user_id });
    const notesWithTags = notes.map(note => {
      const noteTags = userTags.filter(tag => tag.note_id === note.id);

      return {
        ...note,
        tags: noteTags
      }
    })

    return res.json(notesWithTags);
  }
}

module.exports = NotesController;