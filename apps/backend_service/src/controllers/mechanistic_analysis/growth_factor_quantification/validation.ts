import { z } from 'zod';
import { apiResponse } from "@oct-backend/shared-utils";

const LaneResultSchema = z.object({
    lane_no: z.number().optional(),
    lane: z.string().optional(),
    lane_category: z.string().optional(),
    lane_group: z.string().optional(),
    sample_label: z.string().optional(),
    estimated_center_percentage: z.string().optional(),
    status: z.string().optional(),
    target_intensity: z.number().optional(),
    beta_actin_intensity: z.number().optional(),
    common_beta_actin_reference: z.number().optional(),
    normalized_expression: z.number().optional(),
    fold_change_vs_reference: z.number().optional(),
    rank: z.number().optional(),
    target_background: z.number().optional(),
    target_saturated_fraction: z.number().optional(),
    actin_saturated_fraction: z.number().optional(),
});

const ImageResultSchema = z.object({
    pair_number: z.number().optional(),
    category: z.string().optional(),
    target_image: z.object({
        filename: z.string().optional(),
        original_image_base64: z.string().optional(),
        processed_image_base64: z.string().optional(),
    }).optional(),
    actin_image: z.object({
        filename: z.string().optional(),
        original_image_base64: z.string().optional(),
        processed_image_base64: z.string().optional(),
    }).optional(),
    results: z.array(LaneResultSchema).optional(),
    graphs: z.object({
        target_intensity_graph_base64: z.string().optional(),
        normalized_expression_graph_base64: z.string().optional(),
        fold_change_graph_base64: z.string().optional(),
    }).passthrough().optional(),
}).passthrough();

const GrowthFactorQuantificationSchema = z.object({
    project_id: z.union([z.number(), z.string()]).optional(),
    category: z.string().min(1, "Category is required"),
    message: z.string().optional(),
    success: z.boolean().optional(),
    number_of_image_pairs: z.number().optional(),
    no_of_layers: z.number().optional(),
    lane_order: z.string().optional(),
    image_results: z.array(ImageResultSchema).optional(),
    status: z.string().optional(),
    is_active: z.boolean().optional(),
}).passthrough();

export default function validateGrowthFactorQuantification(req: any, res: any, next: any) {
    const result: any = GrowthFactorQuantificationSchema.safeParse(req.body);
    if (!result.success) {
        const issues = result?.error?.issues || [];
        return res.status(500).json(apiResponse.FAILURE_RESP({}, issues, "Validation Failed"));
    }
    return next();
}
