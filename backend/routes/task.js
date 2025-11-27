import express from "express";
import { createTask, deleteTask, getAllTask, updateTask } from "../controllers/task.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.route('/create').post(verifyJWT, createTask)
router.route('/get-all').get(verifyJWT, getAllTask)
router.route('/update/:id').post(verifyJWT,updateTask)
router.route('/delete/:id').delete(verifyJWT,deleteTask)

export default router;