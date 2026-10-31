import express from 'express';
import nociceptionAssayRouter from './nociception_assay/router';
import mechanisticAnalysisRouter from './growth_factor_quantification/router';
const router = express.Router();

router.use('/nociception-assay', nociceptionAssayRouter);
router.use('/nociception', nociceptionAssayRouter);
router.use('/', nociceptionAssayRouter);
router.use('/mechanistic-analysis', mechanisticAnalysisRouter);
export default router;
