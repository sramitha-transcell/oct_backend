import express from 'express';
import Handler from './handler';
import validateBarrierIntegrity from './validation';
import { authentication } from "@oct-backend/shared-utils";

const newHandler = new Handler();
const router = express.Router();

router.post('/create', authentication, validateBarrierIntegrity, newHandler.create);
router.post('/:id/update', authentication, validateBarrierIntegrity, newHandler.update);
router.post('/upsert', authentication, validateBarrierIntegrity, newHandler.upsert);
router.delete('/:id/delete', authentication, newHandler.delete);
router.get('/:id', authentication, newHandler.get);
router.get('', authentication, newHandler.list);

export default router;

