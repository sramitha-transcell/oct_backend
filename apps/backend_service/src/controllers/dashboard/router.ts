import express from 'express';
import Handler from './handler';
import { authentication } from "@oct-backend/shared-utils";

const newHandler = new Handler();
const router = express.Router();

router.get('/', authentication, newHandler.getDashboard);
router.get('/stats', authentication, newHandler.getDashboard);

export default router;

