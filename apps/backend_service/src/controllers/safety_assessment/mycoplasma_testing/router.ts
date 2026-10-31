import express from 'express';
import Handler from './handler';
import validateMycoplasmaTesting from './validation';
import { authentication } from "@oct-backend/shared-utils";

const newHandler = new Handler();
const router = express.Router();

router.post('/create', authentication, validateMycoplasmaTesting, newHandler.create);
router.post('/:id/update', authentication, validateMycoplasmaTesting, newHandler.update);
router.post('/upsert', authentication, validateMycoplasmaTesting, newHandler.upsert);
router.delete('/:id/delete', authentication, newHandler.delete);
router.get('/:id', authentication, newHandler.get);
router.get('', authentication, newHandler.list);

export default router;

