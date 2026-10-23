//@ts-nocheck
import mongoose from "mongoose";

const moduleMasterSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    name: { type: String },
    description: { type: String },
    is_view: { type: Boolean, default: false },
    is_edit: { type: Boolean, default: false },
    is_delete: { type: Boolean, default: false },
    company_id: { type: String },
    created_by_id: { type: String }
  }, 
  { timestamps: true }
);

moduleMasterSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const latestDocument = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
      this.id = latestDocument ? latestDocument.id + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const ModuleMaster = mongoose.model('module_master', moduleMasterSchema);

export { ModuleMaster };

