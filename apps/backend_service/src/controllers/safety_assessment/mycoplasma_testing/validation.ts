import { z } from 'zod';
import { apiResponse } from "@oct-backend/shared-utils";

const AssayRulesSchema = z.object({
    cutoff: z.number().nullable().optional(),
    borderline: z.number().nullable().optional(),
    borderline_lower_limit: z.number().nullable().optional(),
    max_ct: z.number().nullable().optional(),
    internal_control_min: z.number().nullable().optional(),
    internal_control_max: z.number().nullable().optional(),
    positive_control_requirement: z.string().nullable().optional(),
    negative_control_requirement: z.string().nullable().optional(),
    extraction_blank_requirement: z.string().nullable().optional(),
}).passthrough();

const MycoplasmaSampleSchema = z.object({
    sample_id: z.string().optional(),
    target_ct: z.number().nullable().optional(),
    internal_control_ct: z.number().nullable().optional(),
    positive_control_ct: z.number().nullable().optional(),
    negative_control_ct: z.number().nullable().optional(),
}).passthrough();

const BorderlineRangeSchema = z.object({
    lower_inclusive: z.number().nullable().optional(),
    upper_exclusive: z.number().nullable().optional(),
}).passthrough();

const MycoplasmaResultSchema = z.object({
    sample_id: z.string().optional(),
    target_ct: z.number().nullable().optional(),
    target_ct_status: z.string().nullable().optional(),
    internal_control_ct: z.number().nullable().optional(),
    internal_control_status: z.string().nullable().optional(),
    positive_control_ct: z.number().nullable().optional(),
    positive_control_status: z.string().nullable().optional(),
    negative_control_ct: z.number().nullable().optional(),
    negative_control_status: z.string().nullable().optional(),
    negative_control: z.union([z.number(), z.string(), z.null()]).optional(),
    extraction_blank: z.string().nullable().optional(),
    delta_ct_target_minus_positive_control: z.number().nullable().optional(),
    delta_ct_target_minus_negative_control: z.number().nullable().optional(),
    cutoff: z.number().nullable().optional(),
    borderline_range: BorderlineRangeSchema.nullable().optional(),
    screening_result: z.string().nullable().optional(),
    interpretation: z.string().nullable().optional(),
    qc_status: z.string().nullable().optional(),
}).passthrough();

const MycoplasmaTestingSchema = z.object({
    project_id: z.union([z.number(), z.string()]).optional(),
    category: z.string().optional(),
    assay_type: z.string().optional(),
    calculation_method: z.string().optional(),
    assay_rules: AssayRulesSchema.nullable().optional(),
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

export { MycoplasmaTestingSchema };
