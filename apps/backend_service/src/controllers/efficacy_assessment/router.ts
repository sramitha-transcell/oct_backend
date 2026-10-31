import express from 'express';
import woundHealingRouter from './wound_healing/router';
import barrierIntegrityRouter from './barrier_integrity/router';

const router = express.Router();

router.use('/wound-healing', woundHealingRouter);
router.use('/wound_healing', woundHealingRouter);
router.use('/barrier-integrity', barrierIntegrityRouter);
router.use('/barrier_integrity', barrierIntegrityRouter);
router.use('/', woundHealingRouter);

export default router;
