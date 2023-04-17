const { Router } = require("express");
const multer = require("multer");

const uploadConfig = require("../configs/upload");
const UsersController =  require("../controllers/UsersController");
const UserAvatarController = require("../controllers/UserAvatarController");
const ensureAutheticated = require("../middlewares/ensureAutheticated");

const userRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const usersController = new UsersController();
const userAvatarController = new UserAvatarController();

userRoutes.post("/", usersController.create);
userRoutes.put("/", ensureAutheticated, usersController.update);
userRoutes.patch("/avatar", ensureAutheticated, upload.single("avatar"), userAvatarController.update);

module.exports = userRoutes;