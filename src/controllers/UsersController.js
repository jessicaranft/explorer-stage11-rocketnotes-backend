const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");
const sqliteConnection = require('../database/sqlite');

class UsersController {
/** MÉTODOS QUE FICAM DENTRO DE UM CONTROLLER:

 * index - GET para listar vários registros
 * show - GET para exibir um registro específico
 * create - POST para criar um registro
 * update - PUT para atualizar um registro
 * delete - DELETE para remover um registro
 * (para mais do que esses 5 métodos, melhor criar outros controllers)

 */

  // função para criação do usuário no banco de dados
  async create (req, res) {
    const { name, email, password } = req.body;
    const database = await sqliteConnection();
    const checkUserExist = await database.get("SELECT * FROM users WHERE email = (?)", [email]); // (?) será substituído pela variável entre []

    if (checkUserExist) {
      throw new AppError("Este e-mail já está cadastrado.");
    }

    const hashedPassword = await hash(password, 8); // recurso do framework bycrptjs

    await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);

    return res.status(201).json();
  }

  // função para atualizar dados do usuário no banco de dados
  async update (req, res) {
    const { name, email, password, old_password } = req.body;
    const user_id = req.user.id;

    const database = await sqliteConnection();
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id]);

    if (!user) {
      throw new AppError("Usuário não encontrado!");
    }

    const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) { // se houver dois IDs diferentes com esse mesmo e-mail
      throw new AppError("Este e-mail já está em uso.");
    }

    // caso o processo passe pela filtragem de erros normalmente, segue com os updates:
    user.name = name ?? user.name; // se não for inserido um novo name, mantém o user.name já existente
    user.email = email ?? user.email;
    /**
     * The nullish coalescing ( ?? ) operator is a logical operator that returns its right-hand side operand 
     * when its left-hand side operand is null or undefined , and otherwise returns its left-hand side operand.
     */

    if (password && !old_password) {
      throw new AppError("Você precisa informar a senha antiga para definir a nova senha.");
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password); // comparando a senha digitada com a senha do banco de dados
    
      if (!checkOldPassword) {
        throw new AppError("A senha antiga não confere.");
      }

      // passou pela filtragem de erro de senha, segue abaixo:
      user.password = await hash(password, 8);
    }

    await database.run(`
      UPDATE users SET
      name = ?,
      email = ?,
      password = ?,
      updated_at = DATETIME('now')
      WHERE id = ?`,
      [user.name, user.email, user.password, user_id]
    );

    return res.json();
  }
}

module.exports = UsersController;