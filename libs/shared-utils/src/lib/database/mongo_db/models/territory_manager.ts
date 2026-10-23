//@ts-nocheck
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const territoryManagerSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    unique_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    mobile_number: { type: String, required: true },
    email: { type: String, required: true },
    address: {
      street_no: { type: String, required: false },
      block: { type: String, required: false },
      area: { type: String, required: false },
      city: { type: String, required: false },
      state: { type: String, required: false },
      postal_code: { type: String, required: false },
      full_address: { type: String, required: false }
    },
    assigned_sales_executives: [{ type: Number }],
    
    is_active: { type: Boolean, default: true },
    created_by_role: { type: String, required: false },
    created_by_id: { type: Number },
  },
  { timestamps: true }
);

territoryManagerSchema.pre("save", async function (next) {
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

territoryManagerSchema.index({ id: 1, createdAt: -1 });
territoryManagerSchema.plugin(mongoosePaginate);

const TerritoryManager = mongoose.model('TerritoryManager', territoryManagerSchema);
export { TerritoryManager };
