//@ts-nocheck
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const salesExecutiveSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    full_name: { type: String, required: true },
    chp_code: { type: String, required: true, unique: true },
    territory: { type: String, required: true },
    join_date: { type: Date, required: true },
    primary_phone: { type: String, required: true },
    alternative_phone: { type: String },
    email_address: { type: String, required: true, unique: true },
    profile_image: { type: String, default: "" },
    
    // Address fields
    address: {
      street_no: { type: String },
      block: { type: String },
      area: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postal_code: { type: String, required: true },
      country: { type: String, required: true, default: "India" },
      full_address: { type: String }
    },

    // Mandatory identity fields
    aadhaar: { type: String, required: true },
    pan: { type: String, required: true },
    passport_photo: { type: String, required: true },
    payment_packages: {
      type: {
        "emerald": { type: Number, default: 0 },
        "sapphire": { type: Number, default: 0 },
        "diamond": { type: Number, default: 0 },
      },
      default: {}
    },

    is_active: { type: Boolean, default: true },

    created_by_id: { type: Number },
  },
  { timestamps: true }
);

salesExecutiveSchema.pre("save", async function (next) {
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

salesExecutiveSchema.index({ id: 1, createdAt: -1 });
salesExecutiveSchema.plugin(mongoosePaginate);

const SalesExecutive = mongoose.model('SalesExecutive', salesExecutiveSchema);
export { SalesExecutive };