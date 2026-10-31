//@ts-nocheck
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    project_name:{ type: String },
    project_unique_id: { type: String },
    experimental_model: { type: String },
    test_drug: { type: String },
    reference_drug: { type: String },

    description: { type: String },
    module: { type: mongoose.Schema.Types.Mixed },
    submodule: { type: mongoose.Schema.Types.Mixed },
    modules: [{ type: mongoose.Schema.Types.Mixed }],
    assigned_modules: [{ type: mongoose.Schema.Types.Mixed }],

    status: { type: String, default: 'new' },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: true, strict: false }
);

projectSchema.pre("save", async function () {
  if (this.isNew && this.id == null) {
    const latestDocument: any = await (this.constructor as any).findOne({}, {}, { sort: { id: -1 } });
    this.id = latestDocument ? latestDocument.id + 1 : 1;
  }
});

const Project = mongoose.model('project', projectSchema);

export { Project };
export default Project;
