//@ts-nocheck
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";


const hospitalSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    hospital_name: { type: String, required: true },
    hospital_address: {
      street_no: { type: String, required: false },
      block: { type: String, required: false },
      area: { type: String, required: false },
      city: { type: String, required: false },
      state: { type: String, required: false },
      postal_code: { type: String, required: false },
      full_address: { type: String, required: false }
    },
    departments: { type: String },
    doctor_name: { type: String },
    doctor_email: { type: String },

    // TransvidhanHospital contact numbers
    hospital_primary_phone: { type: String },
    hospital_alternate_phone: { type: String },

    // Doctor contact numbers
    doctor_primary_phone: { type: String },
    doctor_alternate_phone: { type: String },

    hospital_email: { type: String },
    cd34_actual_amount: { type: Number, default: 0 },
    cd34_final_amount: { type: Number, default: 0 },
    tcr_actual_amount: { type: Number, default: 0 },
    tcr_final_amount: { type: Number, default: 0 },
    nano_100ml_amount: { type: Number, default: 0 },
    nano_additional_amount: { type: Number, default: 0 },
    micro_100ml_amount: { type: Number, default: 0 },
    micro_additional_amount: { type: Number, default: 0 },
    mini_100ml_amount: { type: Number, default: 0 },
    mini_additional_amount: { type: Number, default: 0 },
    medium_100ml_amount: { type: Number, default: 0 },
    medium_additional_amount: { type: Number, default: 0 },
    large_100ml_amount: { type: Number, default: 0 },
    large_additional_amount: { type: Number, default: 0 },
    excel_100ml_amount: { type: Number, default: 0 },
    excel_additional_amount: { type: Number, default: 0 },
    extra_100ml_amount: { type: Number, default: 0 },
    extra_additional_amount: { type: Number, default: 0 },
    whole_genome_amount: { type: Number, default: 0 },
    condition_specific_amount: { type: Number, default: 0 },
    paediatric_panel_amount: { type: Number, default: 0 },
    mesen_autologous_amount: { type: Number, default: 0 },
    mesen_allogenic_amount: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    isAdminCreated: { type: Boolean, default: false },
    created_by_id: { type: Number },
  },
  { timestamps: true }
);

hospitalSchema.pre("save", async function (next) {
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

hospitalSchema.index({ id: 1, createdAt: -1 });
hospitalSchema.plugin(mongoosePaginate);

const TransvidhanHospital = mongoose.model('transvidhan_hospital', hospitalSchema);
export { TransvidhanHospital };