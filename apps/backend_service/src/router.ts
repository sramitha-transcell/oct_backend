import express from 'express';

import projectCodeRouter from './controllers/project/router';
import growthFactorQuantificationRouter from './controllers/mechanistic_analysis/growth_factor_quantification/router';
import mechanisticAnalysisRouter from './controllers/mechanistic_analysis/router';
import nociceptionAssayRouter from './controllers/mechanistic_analysis/nociception_assay/router';
import adventitiousAgentsRouter from './controllers/safety_assessment/adventitious_agents/router';
import safetyAssessmentRouter from './controllers/safety_assessment/router';
import inducedInflammationRouter from './controllers/safety_assessment/induced_inflammation/router';
import mycoplasmaTestingRouter from './controllers/safety_assessment/mycoplasma_testing/router';
import woundHealingRouter from './controllers/efficacy_assessment/wound_healing/router';
import barrierIntegrityRouter from './controllers/efficacy_assessment/barrier_integrity/router';
import efficacyAssessmentRouter from './controllers/efficacy_assessment/router';

const router = express.Router();

router.use('/project', projectCodeRouter);
router.use('/growth-factor-quantification', growthFactorQuantificationRouter);
router.use('/mechanistic-analysis', mechanisticAnalysisRouter);
router.use('/nociception-assay', nociceptionAssayRouter);
router.use('/adventitious-agents', adventitiousAgentsRouter);
router.use('/adventitious_agents', adventitiousAgentsRouter);
router.use('/safety-assessment', safetyAssessmentRouter);
router.use('/safety_assessment', safetyAssessmentRouter);
router.use('/induced-inflammation', inducedInflammationRouter);
router.use('/induced_inflammation', inducedInflammationRouter);
router.use('/mycoplasma-testing', mycoplasmaTestingRouter);
router.use('/mycoplasma_testing', mycoplasmaTestingRouter);
router.use('/wound-healing', woundHealingRouter);
router.use('/wound_healing', woundHealingRouter);
router.use('/barrier-integrity', barrierIntegrityRouter);
router.use('/barrier_integrity', barrierIntegrityRouter);
router.use('/efficacy-assessment', efficacyAssessmentRouter);
router.use('/efficacy_assessment', efficacyAssessmentRouter);

export default router;
