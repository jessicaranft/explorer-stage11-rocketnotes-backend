require("dotenv/config");
require("express-async-errors");

const express = require("express"); // importando o Express
const cors = require("cors");

const migrationsRun = require("./database/sqlite/migrations");
const AppError = require("./utils/AppError");
const routes = require("./routes");
const uploadConfig = require("./configs/upload");

migrationsRun();

const app = express(); // inicializando o Express
app.use(cors());
app.use(express.json()); // informando que o padrão dos dados é json

app.use("/files", express.static(uploadConfig.UPLOADS_FOLDER));

app.use(routes);

app.use((error, req, res, next) => {
  // tratamento de erro do lado do cliente
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message
    });
  }

  console.error(error);

  // tratamento de erro do lado do servidor
  return res.status(500).json({
    status: "error",
    message: "Internal Server Error"
  });
});

const PORT = process.env.PORT || 3333; // definindo a porta para as requisições HTTP
app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));