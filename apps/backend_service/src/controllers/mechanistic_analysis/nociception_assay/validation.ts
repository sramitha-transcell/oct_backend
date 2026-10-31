import { z } from 'zod';
import { apiResponse } from "@oct-backend/shared-utils";

const NociceptionAssaySchema = z.object({
    calculation_method: z.string().optional(),
    calibrator: z.string().optional(),
    samples: z.array(z.any()).optional(),
    markers: z.array(z.string()).optional(),
    results: z.record(z.string(), z.any()).optional(),
    graphs: z.record(z.string(), z.any()).optional(),
    project_id: z.union([z.number(), z.string()]).optional(),
    assay_name: z.string().optional(),
    category: z.string().optional(),
    status: z.string().optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
}).passthrough();

export default function validateNociceptionAssay(req: any, res: any, next: any) {
    const result: any = NociceptionAssaySchema.safeParse(req.body);
    if (!result.success) {
        const issues = result?.error?.issues || [];
        return res.status(500).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
    }
    return next();
}
