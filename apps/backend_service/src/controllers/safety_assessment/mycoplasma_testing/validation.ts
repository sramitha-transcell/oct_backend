import { z } from 'zod';
import { apiResponse } from "@oct-backend/shared-utils";

const AssayRulesSchema = z.object({
    cutoff: z.number().optional(),
    borderline: z.number().optional(),
    borderline_lower_limit: z.number().optional(),
    max_ct: z.number().optional(),
    internal_control_min: z.number().optional(),
    internal_control_max: z.number().optional(),
    positive_control_requirement: z.string().optional(),
    negative_control_requirement: z.string().optional(),
    extraction_blank_requirement: z.string().optional(),
}).passthrough();

const MycoplasmaSampleSchema = z.object({
    sample_id: z.string().optional(),
    target_ct: z.number().optional(),
    internal_control_ct: z.number().optional(),
}).passthrough();

const BorderlineRangeSchema = z.object({
    lower_inclusive: z.number().optional(),
    upper_exclusive: z.number().optional(),
}).passthrough();

const MycoplasmaResultSchema = z.object({
    sample_id: z.string().optional(),
    target_ct: z.number().optional(),
    target_ct_status: z.string().optional(),
    internal_control_ct: z.number().optional(),
    internal_control_status: z.string().optional(),
    positive_control_ct: z.number().optional(),
    positive_control_status: z.string().optional(),
    negative_control: z.string().optional(),
    extraction_blank: z.string().optional(),
    delta_ct_target_minus_positive_control: z.number().optional(),
    cutoff: z.number().optional(),
    borderline_range: BorderlineRangeSchema.optional(),
    screening_result: z.string().optional(),
    interpretation: z.string().optional(),
    qc_status: z.string().optional(),
}).passthrough();

const MycoplasmaTestingSchema = z.object({
    project_id: z.union([z.number(), z.string()]).optional(),
    category: z.string().optional(),
    assay_type: z.string().optional(),
    calculation_method: z.string().optional(),
    assay_rules: AssayRulesSchema.optional(),
    samples: z.array(MycoplasmaSampleSchema).optional(),
    results: z.array(MycoplasmaResultSchema).optional(),
    graphs: z.any().optional(),
    message: z.string().optional(),
    success: z.boolean().optional(),
    status: z.string().optional(),
    is_active: z.boolean().optional(),
}).passthrough();

export default function validateMycoplasmaTesting(req: any, res: any, next: any) {
    const result: any = MycoplasmaTestingSchema.safeParse(req.body);
    if (!result.success) {
        const issues = result?.error?.issues || [];
        return res.status(500).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
    }
    return next();
}

