//@ts-nocheck
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const inventorySchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    feedback: { type: String, required: true },
    role: { type: String, required: true },
    
    is_active: { type: Boolean, default: true },
    created_by_id: { type: Number },
  },
  { timestamps: true }
);

inventorySchema.pre("save", async function (next) {
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

inventorySchema.index({ id: 1, createdAt: -1 });
inventorySchema.plugin(mongoosePaginate);

const Inventory = mongoose.model('Inventory', inventorySchema);
export { Inventory };
