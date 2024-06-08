
import express from 'express';
import { signUp, signIn, verifyEmail, createUser, getAllUsers, getUserById, deleteUserById, updateUserById } from "./user.controller.js";
import { validateUserCreation } from './validation.js';

const userRoutes = express.Router()


userRoutes.post("/signUp", signUp);
userRoutes.post("/signIn", signIn);
userRoutes.get("/verfiy/:token", verifyEmail)
userRoutes.post("/adddUser",validateUserCreation,createUser)
userRoutes.get("/", getAllUsers);
userRoutes.get("/:userId",getUserById);
userRoutes.delete("/:userId",deleteUserById);
userRoutes.put("/:userId",updateUserById);
export default userRoutes;