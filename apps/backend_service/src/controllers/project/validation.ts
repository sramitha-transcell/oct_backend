import { z } from 'zod';
import { apiResponse } from "@oct-backend/shared-utils";

const ProjectSchema = z.object({
    project_name: z.string().optional(),
    project_unique_id: z.string().optional(),
    experimental_model: z.string().optional(),
    test_drug: z.string().optional(),
    reference_drug: z.string().optional(),
    status: z.string().optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
    lookup_type: z.string().optional(),
    lookup_code: z.string().optional(),
    display_name: z.string().optional(),
    is_enabled: z.boolean().optional(),
    module: z.union([z.string(), z.record(z.string(), z.any()), z.array(z.any())]).optional(),
    submodule: z.union([z.string(), z.record(z.string(), z.any()), z.array(z.any())]).optional(),
    modules: z.array(z.any()).optional(),
    assigned_modules: z.array(z.any()).optional(),
}).passthrough();

export default function projectLookupCode(req: any, res: any, next: any) {
    const result:any = ProjectSchema.safeParse(req.body);
    if (!result.success) {
        const issues = result?.error?.issues || [];
        return res.status(500).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"))
    }
    return next();
}

const AssignModuleSchema = z.object({
    module: z.union([z.string(), z.record(z.string(), z.any()), z.array(z.any())]).optional(),
    submodule: z.union([z.string(), z.record(z.string(), z.any()), z.array(z.any())]).optional(),
    modules: z.array(z.any()).optional(),
}).passthrough();

export function validateAssign(req: any, res: any, next: any) {
    const rawProjectId = req.query?.project_id || req.query?.id || req.query?.projectId || req.params?.id || req.body?.project_id || req.body?.id;
    if (!rawProjectId) {
        return res.status(400).json(apiResponse.FAILURE_RESP({}, {
            name: "Validation Error",
            message: "project_id is required in query"
        }, "project_id is required in query"));
    }

    const result: any = AssignModuleSchema.safeParse(req.body);
    if (!result.success) {
        const issues = result?.error?.issues || [];
        return res.status(400).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
    }
    return next();
}