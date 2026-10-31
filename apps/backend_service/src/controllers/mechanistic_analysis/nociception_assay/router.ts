import express from 'express';
import Handler from './handler';
import validateNociceptionAssay from './validation';
import { authentication } from "@oct-backend/shared-utils";

const newHandler = new Handler();
const router = express.Router();

router.post('/create', authentication, validateNociceptionAssay, newHandler.create);
router.post('/:id/update', authentication, validateNociceptionAssay, newHandler.update);
router.post('/upsert', authentication, validateNociceptionAssay, newHandler.upsert);
router.delete('/:id/delete', authentication, newHandler.delete);
router.get('/:id', authentication, newHandler.get);
router.get('', authentication, newHandler.list);

export default router;
