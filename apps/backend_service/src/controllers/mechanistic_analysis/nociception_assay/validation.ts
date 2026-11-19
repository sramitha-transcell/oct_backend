import { z } from 'zod';
import { apiResponse } from "@oct-backend/shared-utils";

const NociceptionAssaySchema = z.object({
    id: z.union([z.number(), z.string()]).optional(),
    project_id: z.union([z.number(), z.string()]).optional(),
    assay_name: z.string().optional(),
    category: z.string().optional(),
    calculation_method: z.string().optional(),
    control_group: z.string().optional(),
    calibrator: z.string().optional(),
    groups: z.array(z.string()).optional(),
    genes: z.array(z.string()).optional(),
    markers: z.array(z.string()).optional(),
    biological_replicates: z.array(z.string()).optional(),
    formulas: z.any().optional(),
    cq_values: z.any().optional(),
    loading_control: z.any().optional(),
    dct_ddct_fold_change: z.any().optional(),
    biological_replicate_averages: z.any().optional(),
    final_result: z.any().optional(),
    results: z.any().optional(),
    graph: z.any().optional(),
    graphs: z.any().optional(),
    images: z.any().optional(),
    samples: z.array(z.any()).optional(),
    data: z.any().optional(),
    meta: z.any().optional(),
    message: z.string().optional(),
    status: z.string().optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
}).passthrough();

export default function validateNociceptionAssay(req: any, res: any, next: any) {
    const payloadToValidate = (req.body?.data && typeof req.body.data === 'object' && !req.body.calculation_method && !req.body.control_group)
        ? { ...req.body.data, ...req.body }
        : req.body;

    const result: any = NociceptionAssaySchema.safeParse(payloadToValidate);
    if (!result.success) {
        const issues = result?.error?.issues || [];
        return res.status(500).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
    }
    return next();
}
