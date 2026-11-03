import express from "express";
import userController from "../../Controller/user.controller.js";

const router = express.Router();

router.post("/register",userController.signUp);
router.post("/login", userController.login);


export default router;
 