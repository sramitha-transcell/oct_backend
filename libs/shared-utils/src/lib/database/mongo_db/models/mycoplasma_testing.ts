//@ts-nocheck
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const assayRulesSchema = new mongoose.Schema(
  {
    cutoff: { type: Number },
    borderline: { type: Number },
    borderline_lower_limit: { type: Number },
    max_ct: { type: Number },
    internal_control_min: { type: Number },
    internal_control_max: { type: Number },
    positive_control_requirement: { type: String },
    negative_control_requirement: { type: String },
    extraction_blank_requirement: { type: String }
  },
  { _id: false }
);

const mycoplasmaSampleSchema = new mongoose.Schema(
  {
    sample_id: { type: String },
    target_ct: { type: Number },
    internal_control_ct: { type: Number }
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

const mycoplasmaResultSchema = new mongoose.Schema(
  {
    sample_id: { type: String },
    target_ct: { type: Number },
    target_ct_status: { type: String },
    internal_control_ct: { type: Number },
    internal_control_status: { type: String },
    positive_control_ct: { type: Number },
    positive_control_status: { type: String },
    negative_control: { type: String },
    extraction_blank: { type: String },
    delta_ct_target_minus_positive_control: { type: Number },
    cutoff: { type: Number },
    borderline_range: borderlineRangeSchema,
    screening_result: { type: String },
    interpretation: { type: String },
    qc_status: { type: String }
  },
  { _id: false }
);

const mycoplasmaTestingSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    project_id: { type: Number },
    category: { type: String, default: "safety_assessment" },
    assay_type: { type: String, default: "Mycoplasma_qPCR" },
    calculation_method: { type: String, default: "Ct cutoff-based screening" },
    assay_rules: assayRulesSchema,
    samples: [mycoplasmaSampleSchema],
    results: [mycoplasmaResultSchema],
    graphs: { type: mongoose.Schema.Types.Mixed, default: {} },
    meta: {
      status: { type: mongoose.Schema.Types.Mixed, default: true },
      message: { type: String, default: "Mycoplasma Testing Completed Successfully" }
    },
    message: { type: String, default: "Mycoplasma Testing Completed Successfully" },
    success: { type: Boolean, default: true },
    status: { type: String, default: "completed" },
    is_active: { type: Boolean, default: true },
    created_by_id: { type: Number },
    updated_by_id: { type: Number }
  },
  { timestamps: true }
);

mycoplasmaTestingSchema.pre("save", async function () {
  if (this.isNew && this.id == null) {
    const latestDocument: any = await (this.constructor as any).findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
});

mycoplasmaTestingSchema.index({ id: 1, createdAt: -1, project_id: 1, category: 1 });
mycoplasmaTestingSchema.plugin(mongoosePaginate);

const MycoplasmaTesting = mongoose.model(
  'mycoplasma_testing',
  mycoplasmaTestingSchema,
  'mycoplasma_testings'
);

export { MycoplasmaTesting };
export default MycoplasmaTesting;

