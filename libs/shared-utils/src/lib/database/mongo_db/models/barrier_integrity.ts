//@ts-nocheck
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const formulasSchema = new mongoose.Schema(
  {
    mean: { type: String, default: "sum(TEER_i) / n" },
    sd: { type: String, default: "sqrt(sum((TEER_i - mean)^2) / (n - 1))" },
    percent_integrity: { type: String, default: "TEER_sample / TEER_healthy * 100" },
    percent_barrier_restoration: { type: String, default: "(TEER_treatment - TEER_disease) / (TEER_healthy - TEER_disease) * 100" }
  },
  { _id: false }
);

const barrierResultSchema = new mongoose.Schema(
  {
    component_name: { type: String },
    group: { type: String },
    teer: [{ type: Number }],
    n: { type: Number },
    mean: { type: Number },
    sd: { type: Number },
    percent_integrity: { type: Number, default: null },
    percent_barrier_restoration: { type: Number, default: null }
  },
  { _id: false }
);

const barrierIntegritySchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    project_id: { type: Number },
    category: { type: String, default: "efficacy_assessment" },
    assay_type: { type: String, default: "Transepithelial Electrical Resistance (TEER)" },
    formulas: { type: formulasSchema, default: () => ({}) },
    healthy_mean_teer: { type: Number, default: null },
    disease_mean_teer: { type: Number, default: null },
    results: [barrierResultSchema],
    warnings: [{ type: mongoose.Schema.Types.Mixed }],
    graphs: { type: mongoose.Schema.Types.Mixed, default: {} },
    data: { type: mongoose.Schema.Types.Mixed },
    meta: {
      status: { type: mongoose.Schema.Types.Mixed, default: true },
      message: { type: String, default: "Barrier Integrity Analysis Completed Successfully" }
    },
    message: { type: String, default: "Barrier Integrity Analysis Completed Successfully" },
    success: { type: Boolean, default: true },
    status: { type: String, default: "completed" },
    is_active: { type: Boolean, default: true },
    created_by_id: { type: Number },
    updated_by_id: { type: Number }
  },
  { timestamps: true }
);

barrierIntegritySchema.pre("save", async function () {
  if (this.isNew && this.id == null) {
    const latestDocument: any = await (this.constructor as any).findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
});

barrierIntegritySchema.index({ id: 1, createdAt: -1, project_id: 1, category: 1 });
barrierIntegritySchema.plugin(mongoosePaginate);

const BarrierIntegrity = mongoose.model(
  'barrier_integrity',
  barrierIntegritySchema,
  'barrier_integrities'
);

export { BarrierIntegrity };
export default BarrierIntegrity;

