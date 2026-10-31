//@ts-nocheck
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const laneResultSchema = new mongoose.Schema(
  {
    lane_no: { type: Number },
    lane: { type: String },
    lane_category: { type: String },
    lane_group: { type: String },
    sample_label: { type: String },
    estimated_center_percentage: { type: String },
    status: { type: String, default: "active" },
    target_intensity: { type: Number },
    beta_actin_intensity: { type: Number },
    common_beta_actin_reference: { type: Number },
    normalized_expression: { type: Number },
    fold_change_vs_reference: { type: Number },
    rank: { type: Number },
    target_background: { type: Number },
    target_saturated_fraction: { type: Number },
    actin_saturated_fraction: { type: Number }
  },
  { _id: false }
);

const imageResultSchema = new mongoose.Schema(
  {
    pair_number: { type: Number },
    category: { type: String },
    target_image: {
      filename: { type: String },
      original_image_base64: { type: String },
      processed_image_base64: { type: String }
    },
    actin_image: {
      filename: { type: String },
      original_image_base64: { type: String },
      processed_image_base64: { type: String }
    },
    results: [laneResultSchema],
    graphs: {
      target_intensity_graph_base64: { type: String },
      normalized_expression_graph_base64: { type: String },
      fold_change_graph_base64: { type: String }
    }
  },
  { _id: false }
);

const growthFactorQuantificationSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    project_id: { type: Number },
    category: { type: String, required: true },
    message: { type: String, default: "Analysis completed." },
    success: { type: Boolean, default: true },
    number_of_image_pairs: { type: Number, default: 1 },
    no_of_layers: { type: Number, default: 4 },
    lane_order: { type: String, default: "Custom" },
    image_results: [imageResultSchema],
    is_active: { type: Boolean, default: true },
    status: { type: String, default: "completed" },
    created_by_id: { type: Number },
    updated_by_id: { type: Number }
  },
  { timestamps: true }
);

growthFactorQuantificationSchema.pre("save", async function () {
  if (this.isNew && this.id == null) {
    const latestDocument: any = await (this.constructor as any).findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
});

growthFactorQuantificationSchema.index({ id: 1, createdAt: -1, category: 1 });
growthFactorQuantificationSchema.plugin(mongoosePaginate);

const GrowthFactorQuantification = mongoose.model(
  'growth_factor_quantification',
  growthFactorQuantificationSchema,
  'growth_factor_quantifications'
);

export { GrowthFactorQuantification };
export default GrowthFactorQuantification;
