import { z } from 'zod';
import { apiResponse } from "@oct-backend/shared-utils";

const FormulasSchema = z.object({
    mean: z.string().optional(),
    sd: z.string().optional(),
    percent_integrity: z.string().optional(),
    percent_barrier_restoration: z.string().optional(),
}).passthrough();

const BarrierResultSchema = z.object({
    component_name: z.string().optional(),
    group: z.string().optional(),
    teer: z.array(z.number()).optional(),
    n: z.number().optional(),
    mean: z.number().optional(),
    sd: z.number().optional(),
    percent_integrity: z.union([z.number(), z.null()]).optional(),
    percent_barrier_restoration: z.union([z.number(), z.null()]).optional(),
}).passthrough();

const BarrierIntegritySchema = z.object({
    project_id: z.union([z.number(), z.string()]).optional(),
    category: z.string().optional().default("efficacy_assessment"),
    assay_type: z.string().optional(),
    formulas: FormulasSchema.optional(),
    healthy_mean_teer: z.union([z.number(), z.null()]).optional(),
    disease_mean_teer: z.union([z.number(), z.null()]).optional(),
    results: z.array(BarrierResultSchema).optional(),
    warnings: z.array(z.any()).optional(),
    graphs: z.object({}).passthrough().optional(),
    data: z.any().optional(),
    meta: z.any().optional(),
    message: z.string().optional(),
    success: z.boolean().optional(),
    status: z.string().optional(),
    is_active: z.boolean().optional(),
}).passthrough();

export default function validateBarrierIntegrity(req: any, res: any, next: any) {
    const result: any = BarrierIntegritySchema.safeParse(req.body);
    if (!result.success) {
        const issues = result?.error?.issues || [];
        return res.status(500).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
    }
    return next();
}

export { BarrierIntegritySchema };
