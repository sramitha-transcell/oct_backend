
//@ts-nocheck
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const lookupCodeandTypeSchemas = new mongoose.Schema(
    {
        id: { type: Number, unique: true },
        lookup_type: { type: String, default: "" },
        lookup_code: { type: String, default: "" },
        display_name: { type: String, default: "" },
        is_enabled: { type: Boolean, default: true },
        description: { type: String, default: "" },
    },
    { _id: true, timestamps: true }
)

lookupCodeandTypeSchemas.pre("save", async function (next) {
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


lookupCodeandTypeSchemas.index({ id: 1, createdAt: -1 });
lookupCodeandTypeSchemas.plugin(mongoosePaginate)

const LookupCodeandType = mongoose.model('lookup_codes', lookupCodeandTypeSchemas, "lookup_codes")

export { LookupCodeandType };