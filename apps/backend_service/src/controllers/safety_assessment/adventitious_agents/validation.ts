import { z } from 'zod';
import { apiResponse } from "@oct-backend/shared-utils";

const SampleDetailsSchema = z.object({
    sample_id: z.string().optional(),
    sample_type: z.string().optional(),
    collection_point: z.string().optional(),
    extraction_method: z.string().optional(),
    internal_control_type: z.string().optional(),
    internal_control_name: z.string().optional(),
    extraction_control_status: z.string().optional(),
}).passthrough();

const InternalControlRangeSchema = z.object({
    min_ct: z.number().optional(),
    max_ct: z.number().optional(),
}).passthrough();

const AssayConfigurationItemSchema = z.object({
    viral_agent: z.string().optional(),
    assay: z.string().optional(),
    positive_control_id: z.string().optional(),
    cutoff: z.number().optional(),
    borderline_interval: z.number().optional(),
    lod: z.union([z.number(), z.string()]).optional(),
    max_accepted_ct: z.number().optional(),
    internal_control_range: InternalControlRangeSchema.optional(),
    suggested_internal_control: z.string().optional(),
}).passthrough();

const ViralInputSchema = z.object({
    viral_agent: z.string().optional(),
    sample_ct: z.number().optional(),
    positive_control_ct: z.number().optional(),
    negative_control_ct: z.number().optional(),
    internal_control_ct: z.number().optional(),
}).passthrough();

const SampleItemSchema = z.object({
    sample_id: z.string().optional(),
    sample_type: z.string().optional(),
    collection_point: z.string().optional(),
    extraction_method: z.string().optional(),
    viral_inputs: z.array(ViralInputSchema).optional(),
}).passthrough();

const BorderlineRangeSchema = z.object({
    lower_inclusive: z.number().optional(),
    upper_exclusive: z.number().optional(),
}).passthrough();

const ResultItemSchema = z.object({
    viral_agent: z.string().optional(),
    assay: z.string().optional(),
    positive_control_id: z.string().optional(),
    sample_ct: z.number().optional(),
    sample_ct_status: z.string().optional(),
    positive_control_ct: z.number().optional(),
    positive_control_status: z.string().optional(),
    negative_control_ct: z.number().optional(),
    negative_control_status: z.string().optional(),
    internal_control_ct: z.number().optional(),
    internal_control_status: z.string().optional(),
    delta_ct_sample_minus_positive: z.number().optional(),
    cutoff: z.number().optional(),
    borderline_interval: z.number().optional(),
    borderline_range: BorderlineRangeSchema.optional(),
    lod: z.union([z.number(), z.string()]).optional(),
    max_accepted_ct: z.number().optional(),
    internal_control_range: InternalControlRangeSchema.optional(),
    run_validity: z.string().optional(),
    internal_control_qc: z.string().optional(),
    qc_status: z.string().optional(),
    screening_result: z.string().optional(),
    interpretation: z.string().optional(),
    notes: z.array(z.any()).optional(),
}).passthrough();

const SummarySchema = z.object({
    total_targets: z.number().optional(),
    not_detected: z.number().optional(),
    detected: z.number().optional(),
    inconclusive: z.number().optional(),
    invalid: z.number().optional(),
    overall_viral_screening_status: z.string().optional(),
    assay_controls: z.string().optional(),
    pcr_inhibition: z.string().optional(),
    overall_safety_assessment: z.string().optional(),
}).passthrough();

const AdventitiousAgentsSchema = z.object({
    project_id: z.union([z.number(), z.string()]).optional(),
    category: z.string().optional(),
    assay_type: z.string().optional(),
    calculation_method: z.string().optional(),
    sample_details: SampleDetailsSchema.optional(),
    assay_configuration: z.array(AssayConfigurationItemSchema).optional(),
    samples: z.array(SampleItemSchema).optional(),
    results: z.array(ResultItemSchema).optional(),
    summary: SummarySchema.optional(),
    graphs: z.any().optional(),
    message: z.string().optional(),
    success: z.boolean().optional(),
    status: z.string().optional(),
    is_active: z.boolean().optional(),
}).passthrough();

export default function validateAdventitiousAgents(req: any, res: any, next: any) {
    const result: any = AdventitiousAgentsSchema.safeParse(req.body);
    if (!result.success) {
        const issues = result?.error?.issues || [];
        return res.status(500).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
    }
    return next();
}

