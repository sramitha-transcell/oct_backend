//@ts-nocheck
import mongoose from "mongoose";

/**
 * SampleCollection model - extracted from pregen.sample_collection
 * Keeps the same field names and validation as the nested object in pregen.ts
 * Includes an optional reference back to the PregenClient document.
 */

const pregenSampleCollectionSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    // Optional link to the PregenClient document
    pregen_client_id: { type: String },

    sample_type: {type: String},

    collection_date_time: { type: Date, required: true },

    collection_address: {
      type: {
        street_no: { type: String, required: true },
        block: { type: String, required: true },
        area: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
      },
      required: true
    },

    storage_condition: {type: String},

    // Optional metadata
    collected_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String }
  },
  { timestamps: true }
);

pregenSampleCollectionSchema.pre("save", async function (next) {
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

const PregenSampleCollection = mongoose.model('pregen_sample_collection', pregenSampleCollectionSchema);

export { PregenSampleCollection };
export default PregenSampleCollection;
