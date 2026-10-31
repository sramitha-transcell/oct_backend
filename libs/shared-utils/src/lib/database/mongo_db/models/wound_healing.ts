//@ts-nocheck
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const imageItemSchema = new mongoose.Schema(
  {
    image_id: { type: String },
    sample_group: { type: String },
    time_hours: { type: Number },
    filename: { type: String },
    mime_type: { type: String },
    encoding: { type: String },
    image_base64: { type: String },
    width: { type: Number },
    height: { type: Number },
    detected_format: { type: String }
  },
  { _id: false }
);

const woundHealingSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    project_id: { type: Number },
    category: { type: String, default: "efficacy_assessment" },
    analysis_type: { type: String, default: "microscopy_image_batch" },
    patient_id: { type: String },
    app_inputs: { type: mongoose.Schema.Types.Mixed, default: {} },
    image_count: { type: Number },
    images: [imageItemSchema],
    results: { type: mongoose.Schema.Types.Mixed, default: {} },
    graphs: { type: mongoose.Schema.Types.Mixed, default: [] },
    output_images: { type: mongoose.Schema.Types.Mixed, default: [] },
    data: { type: mongoose.Schema.Types.Mixed },
    meta: {
      status: { type: mongoose.Schema.Types.Mixed, default: true },
      message: { type: String, default: "Wound Healing Analysis Completed Successfully" }
    },
    message: { type: String, default: "Wound Healing Analysis Completed Successfully" },
    success: { type: Boolean, default: true },
    status: { type: String, default: "completed" },
    is_active: { type: Boolean, default: true },
    created_by_id: { type: Number },
    updated_by_id: { type: Number }
  },
  { timestamps: true }
);

woundHealingSchema.pre("save", async function () {
  if (this.isNew && this.id == null) {
    const latestDocument: any = await (this.constructor as any).findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
});

woundHealingSchema.index({ id: 1, createdAt: -1, project_id: 1, category: 1 });
woundHealingSchema.plugin(mongoosePaginate);

const WoundHealing = mongoose.model(
  'wound_healing',
  woundHealingSchema,
  'wound_healings'
);

export { WoundHealing };
export default WoundHealing;

