//@ts-nocheck
import mongoose from "mongoose";

const paymentTypeSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    payment_type_name: { type: String },
    bag_type: { type: String },
    description: { type: String },
    amount: { type: Number },
    actual_amount: { type: Number },
    duration: { type: String },
    category_type: { type: String },
    is_active: { type: Boolean, default: true },
    created_by_id: { type: Number },
    created_at: { type: Date },
    updated_at: { type: Date },
  }, 
  { timestamps: true }
);

paymentTypeSchema.pre("save", async function (next) {
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

const PaymentType = mongoose.model('payment_type', paymentTypeSchema);

export { PaymentType };