import express from 'express';
import Handler from './handler';
import projectLookupCode, { validateAssign } from './validation';
import { authentication } from "@oct-backend/shared-utils";
const newHandler = new Handler();
const router = express.Router();

router.post('/create', authentication, projectLookupCode, newHandler.create);
router.post('/assign', authentication, validateAssign, newHandler.assign);
router.post('/:id/assign', authentication, validateAssign, newHandler.assign);
router.post('/:id/update', authentication, projectLookupCode, newHandler.update);
router.post('/upsert', authentication, projectLookupCode, newHandler.upsert);
router.delete('/:id/delete', authentication, newHandler.delete);
router.get('/:id', authentication, newHandler.get);
router.get('', authentication, newHandler.list);

export default router;