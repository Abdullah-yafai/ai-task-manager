import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { generateAIPlan } from '../controllers/ai.controller.js';
const router = express.Router();


router.route("/generate-plan").post(verifyJWT, generateAIPlan)


export default router