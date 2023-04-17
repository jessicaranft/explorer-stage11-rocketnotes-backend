const { compare } = require("bcryptjs");
const { sign } = require("jsonwebtoken");

const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const authConfig = require("../configs/auth");

class SessionsController {
  async create(req, res) { // vamos criar uma sessão
    const { email, password } = req.body;

    // buscar usuário pelo e-mail
    const user = await knex("users").where({ email }).first();

    // verificar se o e-mail existe na base de dados
    if(!user) {
      throw new AppError("E-mail e/ou senha incorretos.", 401);
    }

    // comparar a senha digitada com a senha cadastrada na base de dados
    const passwordMatched = await compare(password, user.password);

    // verificar se a senha está correta
    if(!passwordMatched) {
      throw new AppError("E-mail e/ou senha incorretos.", 401);
    }

    // gerar o token de identificação
    const { secret, expiresIn } = authConfig.jwt;
    const token = sign({}, secret, {
      subject: String(user.id),
      expiresIn
    })

    return res.json({ user, token });
  }
}

module.exports = SessionsController;