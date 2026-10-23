//@ts-nocheck
import mongoose from "mongoose";

 
payoutSchema.pre("save", async function (next) {
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
  
const Payout = mongoose.model('Payout', payoutSchema);
export  { Payout};
