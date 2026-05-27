import express from 'express';
import { translateTexts } from '../controllers/translationController.js';

const router = express.Router();

router.post('/', translateTexts);

export default router;
