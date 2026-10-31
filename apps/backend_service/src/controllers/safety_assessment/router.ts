import express from 'express';
import adventitiousAgentsRouter from './adventitious_agents/router';
import inducedInflammationRouter from './induced_inflammation/router';
import mycoplasmaTestingRouter from './mycoplasma_testing/router';

const router = express.Router();

router.use('/adventitious-agents', adventitiousAgentsRouter);
router.use('/adventitious_agents', adventitiousAgentsRouter);

router.use('/induced-inflammation', inducedInflammationRouter);
router.use('/induced_inflammation', inducedInflammationRouter);

router.use('/mycoplasma-testing', mycoplasmaTestingRouter);
router.use('/mycoplasma_testing', mycoplasmaTestingRouter);

router.use('/', adventitiousAgentsRouter);

export default router;
