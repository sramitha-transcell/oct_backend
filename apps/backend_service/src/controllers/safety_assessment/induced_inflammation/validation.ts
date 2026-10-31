import { z } from 'zod';
import { apiResponse } from "@oct-backend/shared-utils";

const RelativePotencySchema = z.object({
    value: z.number().optional(),
    unit: z.string().optional(),
    method: z.string().optional(),
}).passthrough();

const StandardCurveSchema = z.object({
    parameters: z.any().optional(),
    table: z.array(z.any()).optional(),
}).passthrough();

const PotencyCurveSchema = z.object({
    parameters: z.any().optional(),
    table: z.array(z.any()).optional(),
}).passthrough();

const InducedInflammationSchema = z.object({
    project_id: z.union([z.number(), z.string()]).optional(),
    category: z.string().optional(),
    drug_name: z.string().optional(),
    batch_no: z.string().optional(),
    marker: z.string().optional(),
    dilution_factor: z.number().optional(),
    subtract_blank: z.boolean().optional(),
    method: z.string().optional(),
    test_drug_group: z.string().optional(),
    reference_drug_group: z.string().optional(),
    available_sample_groups: z.array(z.string()).optional(),
    warnings: z.array(z.any()).optional(),
    blank: z.number().optional(),
    n_blank: z.number().optional(),
    relative_potency: RelativePotencySchema.optional(),
    standard_curve: StandardCurveSchema.optional(),
    potency_curve: PotencyCurveSchema.optional(),
    samples: z.array(z.any()).optional(),
    graphs: z.any().optional(),
    exports: z.any().optional(),
    uploaded_file: z.any().optional(),
    message: z.string().optional(),
    success: z.boolean().optional(),
    status: z.string().optional(),
    is_active: z.boolean().optional(),
}).passthrough();

export default function validateInducedInflammation(req: any, res: any, next: any) {
    const result: any = InducedInflammationSchema.safeParse(req.body);
    if (!result.success) {
        const issues = result?.error?.issues || [];
        return res.status(500).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
    }
    return next();
}

