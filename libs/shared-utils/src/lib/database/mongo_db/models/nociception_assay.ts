//@ts-nocheck
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const qpcrMarkerCtDataSchema = new mongoose.Schema(
  {
    target_ct: [{ type: Number }],
    beta_actin_ct: [{ type: Number }]
  },
  { _id: false }
);

const qpcrSampleSchema = new mongoose.Schema(
  {
    sample_name: { type: String },
    markers: { type: mongoose.Schema.Types.Mixed }
  },
  { _id: false }
);

const qpcrResultItemSchema = new mongoose.Schema(
  {
    sample_name: { type: String },
    target_ct_average: { type: Number },
    target_ct_sd: { type: Number },
    beta_actin_ct_average: { type: Number },
    beta_actin_ct_sd: { type: Number },
    delta_ct: { type: Number },
    delta_ct_sd: { type: Number },
    delta_delta_ct: { type: Number },
    fold_change: { type: Number }
  },
  { _id: false }
);

const qpcrGraphItemSchema = new mongoose.Schema(
  {
    mime_type: { type: String, default: "image/png" },
    encoding: { type: String, default: "base64" },
    image_base64: { type: String }
  },
  { _id: false }
);

const nociceptionAssaySchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    project_id: { type: Number },
    assay_name: { type: String, default: "Nociception Assay" },
    category: { type: String, default: "mechanistic_analysis" },
    calculation_method: { type: String, default: "2^(-ΔΔCt)" },
    control_group: { type: String, default: "Vehicle control" },
    calibrator: { type: String, default: "Vehicle control" },
    groups: [{ type: String }],
    genes: [{ type: String }],
    markers: [{ type: String }],
    biological_replicates: [{ type: String }],
    formulas: { type: mongoose.Schema.Types.Mixed, default: {} },
    cq_values: { type: mongoose.Schema.Types.Mixed, default: {} },
    loading_control: [{ type: mongoose.Schema.Types.Mixed }],
    dct_ddct_fold_change: [{ type: mongoose.Schema.Types.Mixed }],
    biological_replicate_averages: [{ type: mongoose.Schema.Types.Mixed }],
    final_result: [{ type: mongoose.Schema.Types.Mixed }],
    results: { type: mongoose.Schema.Types.Mixed, default: {} },
    graph: { type: mongoose.Schema.Types.Mixed, default: {} },
    graphs: { type: mongoose.Schema.Types.Mixed, default: {} },
    images: { type: mongoose.Schema.Types.Mixed, default: {} },
    samples: [mongoose.Schema.Types.Mixed],
    data: { type: mongoose.Schema.Types.Mixed },
    meta: {
      status: { type: mongoose.Schema.Types.Mixed, default: true },
      message: { type: String, default: "qPCR Analysis Completed Successfully" }
    },
    message: { type: String, default: "qPCR Analysis Completed Successfully" },
    status: { type: String, default: "completed" },
    is_active: { type: Boolean, default: true },
    created_by_id: { type: Number },
    updated_by_id: { type: Number }
  },
  { timestamps: true, strict: false }
);

nociceptionAssaySchema.pre("save", async function () {
  if (this.isNew && this.id == null) {
    const latestDocument: any = await (this.constructor as any).findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
});

nociceptionAssaySchema.index({ id: 1, createdAt: -1, project_id: 1 });
nociceptionAssaySchema.plugin(mongoosePaginate);

const NociceptionAssay = mongoose.model(
  'nociception_assay',
  nociceptionAssaySchema,
  'nociception_assays'
);

export { NociceptionAssay };
export default NociceptionAssay;
