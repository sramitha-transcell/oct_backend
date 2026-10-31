//@ts-nocheck
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const inducedInflammationSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    project_id: { type: Number },
    category: { type: String, default: "safety_assessment" },
    drug_name: { type: String },
    batch_no: { type: String },
    marker: { type: String },
    dilution_factor: { type: Number, default: 1.0 },
    subtract_blank: { type: Boolean, default: false },
    method: { type: String },
    test_drug_group: { type: String },
    reference_drug_group: { type: String },
    available_sample_groups: [{ type: String }],
    warnings: [{ type: mongoose.Schema.Types.Mixed }],
    blank: { type: Number },
    n_blank: { type: Number },
    relative_potency: {
      value: { type: Number },
      unit: { type: String},
      method: { type: String}
    },
    standard_curve: {
      parameters: { type: mongoose.Schema.Types.Mixed },
      table: [{ type: mongoose.Schema.Types.Mixed }]
    },
    potency_curve: {
      parameters: { type: mongoose.Schema.Types.Mixed },
      table: [{ type: mongoose.Schema.Types.Mixed }]
    },
    samples: [{ type: mongoose.Schema.Types.Mixed }],
    graphs: { type: mongoose.Schema.Types.Mixed, default: {} },
    exports: { type: mongoose.Schema.Types.Mixed, default: {} },
    uploaded_file: { type: mongoose.Schema.Types.Mixed },
    message: { type: String},
    success: { type: Boolean },
    status: { type: String, default: "completed" },
    is_active: { type: Boolean, default: true },
    created_by_id: { type: Number },
    updated_by_id: { type: Number }
  },
  { timestamps: true }
);

inducedInflammationSchema.pre("save", async function () {
  if (this.isNew && this.id == null) {
    const latestDocument: any = await (this.constructor as any).findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
});

inducedInflammationSchema.index({ id: 1, createdAt: -1, project_id: 1, category: 1 });
inducedInflammationSchema.plugin(mongoosePaginate);

const InducedInflammation = mongoose.model(
  'induced_inflammation',
  inducedInflammationSchema,
  'induced_inflammations'
);

export { InducedInflammation };
export default InducedInflammation;

