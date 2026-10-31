//@ts-nocheck
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const sampleDetailsSchema = new mongoose.Schema(
  {
    sample_id: { type: String },
    sample_type: { type: String },
    collection_point: { type: String },
    extraction_method: { type: String },
    internal_control_type: { type: String },
    internal_control_name: { type: String },
    extraction_control_status: { type: String }
  },
  { _id: false }
);

const internalControlRangeSchema = new mongoose.Schema(
  {
    min_ct: { type: Number },
    max_ct: { type: Number }
  },
  { _id: false }
);

const assayConfigurationSchema = new mongoose.Schema(
  {
    viral_agent: { type: String },
    assay: { type: String },
    positive_control_id: { type: String },
    cutoff: { type: Number },
    borderline_interval: { type: Number },
    lod: { type: mongoose.Schema.Types.Mixed },
    max_accepted_ct: { type: Number },
    internal_control_range: internalControlRangeSchema,
    suggested_internal_control: { type: String }
  },
  { _id: false }
);

const viralInputSchema = new mongoose.Schema(
  {
    viral_agent: { type: String },
    sample_ct: { type: Number },
    positive_control_ct: { type: Number },
    negative_control_ct: { type: Number },
    internal_control_ct: { type: Number }
  },
  { _id: false }
);

const sampleSchema = new mongoose.Schema(
  {
    sample_id: { type: String },
    sample_type: { type: String },
    collection_point: { type: String },
    extraction_method: { type: String },
    viral_inputs: [viralInputSchema]
  },
  { _id: false }
);

const borderlineRangeSchema = new mongoose.Schema(
  {
    lower_inclusive: { type: Number },
    upper_exclusive: { type: Number }
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    viral_agent: { type: String },
    assay: { type: String },
    positive_control_id: { type: String },
    sample_ct: { type: Number },
    sample_ct_status: { type: String },
    positive_control_ct: { type: Number },
    positive_control_status: { type: String },
    negative_control_ct: { type: Number },
    negative_control_status: { type: String },
    internal_control_ct: { type: Number },
    internal_control_status: { type: String },
    delta_ct_sample_minus_positive: { type: Number },
    cutoff: { type: Number },
    borderline_interval: { type: Number },
    borderline_range: borderlineRangeSchema,
    lod: { type: mongoose.Schema.Types.Mixed },
    max_accepted_ct: { type: Number },
    internal_control_range: internalControlRangeSchema,
    run_validity: { type: String },
    internal_control_qc: { type: String },
    qc_status: { type: String },
    screening_result: { type: String },
    interpretation: { type: String },
    notes: [{ type: mongoose.Schema.Types.Mixed }]
  },
  { _id: false }
);

const summarySchema = new mongoose.Schema(
  {
    total_targets: { type: Number },
    not_detected: { type: Number },
    detected: { type: Number },
    inconclusive: { type: Number },
    invalid: { type: Number },
    overall_viral_screening_status: { type: String },
    assay_controls: { type: String },
    pcr_inhibition: { type: String },
    overall_safety_assessment: { type: String }
  },
  { _id: false }
);

const adventitiousAgentsSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    project_id: { type: Number },
    category: { type: String, default: "safety_assessment" },
    assay_type: { type: String, default: "qPCR / RT-qPCR" },
    calculation_method: { type: String, default: "Ct cutoff-based screening" },
    sample_details: sampleDetailsSchema,
    assay_configuration: [assayConfigurationSchema],
    samples: [sampleSchema],
    results: [resultSchema],
    summary: summarySchema,
    graphs: { type: mongoose.Schema.Types.Mixed, default: {} },
    meta: {
      status: { type: mongoose.Schema.Types.Mixed, default: true },
      message: { type: String, default: "Adventitious Agents Analysis Completed Successfully" }
    },
    message: { type: String, default: "Adventitious Agents Analysis Completed Successfully" },
    success: { type: Boolean, default: true },
    status: { type: String, default: "completed" },
    is_active: { type: Boolean, default: true },
    created_by_id: { type: Number },
    updated_by_id: { type: Number }
  },
  { timestamps: true }
);

adventitiousAgentsSchema.pre("save", async function () {
  if (this.isNew && this.id == null) {
    const latestDocument: any = await (this.constructor as any).findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
});

adventitiousAgentsSchema.index({ id: 1, createdAt: -1, project_id: 1, category: 1 });
adventitiousAgentsSchema.plugin(mongoosePaginate);

const AdventitiousAgents = mongoose.model(
  'adventitious_agents',
  adventitiousAgentsSchema,
  'adventitious_agents'
);

export { AdventitiousAgents };
export default AdventitiousAgents;

