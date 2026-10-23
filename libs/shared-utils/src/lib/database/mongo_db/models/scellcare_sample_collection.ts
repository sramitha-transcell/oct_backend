//@ts-nocheck
import mongoose from "mongoose";

const scellcareSampleCollectionSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    // Optional link to the scellcare Lead document
    scellcare_lead_id: { type: String },

    // Sample collection fields (from scellcare_lead.sample_collection)
    date_of_delivery: { type: String },
    time_of_delivery: { type: String },
    time_interval: { type: String },
    nature_of_pregnancy: { type: String },
    nature_of_delivery: { type: String },
    nature_of_collection: { type: String },
    sex_of_baby: { type: String },
    baby_weight: { type: String },
    hospital_city: { type: String },
    obstretician_name: { type: String },

  },
  { timestamps: true }
);

scellcareSampleCollectionSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const latestDocument = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
      this.id = latestDocument ? latestDocument.id + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});''

const ScellcareSampleCollection = mongoose.model('scellcare_sample_collection', scellcareSampleCollectionSchema);

export default ScellcareSampleCollection;
