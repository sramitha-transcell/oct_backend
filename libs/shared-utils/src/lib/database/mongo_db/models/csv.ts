//@ts-nocheck
import mongoose from "mongoose";

const csvSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    request_id: { type: String },
    uploaded_file: { type: String },
    error_log_file: { type: String },
    succes_count: { type: Number },
    failure_count: { type: Number },
    status_id: { type: Number },
    total: { type: Number },
    module_name: { type: String },
    module_code: { type: String },
    created_by_id: { type: Number },
    updated_by_id: { type: Number },
    is_active: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

csvSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const latestDocument = await this.constructor.findOne(
        {},
        {},
        { sort: { id: -1 } }
      );
      this.id = latestDocument ? latestDocument.id + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Csv = mongoose.model("csv", csvSchema);

export { Csv };


