// script para padronizar as mensagens de erro do aplicativo

class AppError {
  message;
  statusCode;

  // o método construtor é carregado automaticamente quando a classe é instanciada
  constructor (message, statusCode = 400) {// caso o statusCode não seja informado, o padrão será então 400
    this.message = message;
    this.statusCode = statusCode;
  }
}

module.exports = AppError;