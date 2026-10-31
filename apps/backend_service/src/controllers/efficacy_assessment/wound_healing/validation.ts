import { z } from 'zod';
import { apiResponse } from "@oct-backend/shared-utils";

const ImageItemSchema = z.object({
    image_id: z.string().optional(),
    sample_group: z.string().optional(),
    time_hours: z.number().optional(),
    filename: z.string().optional(),
    mime_type: z.string().optional(),
    encoding: z.string().optional(),
    image_base64: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    detected_format: z.string().optional(),
}).passthrough();

const WoundHealingDataSchema = z.object({
    analysis_type: z.string().optional(),
    patient_id: z.string().optional(),
    app_inputs: z.any().optional(),
    image_count: z.number().optional(),
    images: z.array(ImageItemSchema).optional(),
    results: z.any().optional(),
    graphs: z.any().optional(),
    output_images: z.any().optional(),
}).passthrough();

const MetaSchema = z.object({
    status: z.any().optional(),
    message: z.string().optional(),
}).passthrough();

const WoundHealingSchema = z.object({
    project_id: z.union([z.number(), z.string()]).optional(),
    category: z.string().optional(),
    meta: MetaSchema.optional(),
    data: WoundHealingDataSchema.optional(),
    analysis_type: z.string().optional(),
    patient_id: z.string().optional(),
    app_inputs: z.any().optional(),
    image_count: z.number().optional(),
    images: z.array(ImageItemSchema).optional(),
    results: z.any().optional(),
    graphs: z.any().optional(),
    output_images: z.any().optional(),
    message: z.string().optional(),
    success: z.boolean().optional(),
    status: z.string().optional(),
    is_active: z.boolean().optional(),
}).passthrough();

export default function validateWoundHealing(req: any, res: any, next: any) {
    const result: any = WoundHealingSchema.safeParse(req.body);
    if (!result.success) {
        const issues = result?.error?.issues || [];
        return res.status(500).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
    }
    return next();
}

