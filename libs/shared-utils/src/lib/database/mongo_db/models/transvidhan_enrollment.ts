//@ts-nocheck
import mongoose from "mongoose";

const AddressSchema = {
    street_no: { type: String, required: true },
    block: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
};


const OptionalAddressSchema = {
    street_no: { type: String },
    block: { type: String },
    area: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String }
};

const transvidhanEnrollmentSchema = new mongoose.Schema(
    {
        id: { type: Number, unique: true },
        client_unique_id: { type: String },
        transvidan_unique_id: { type: String },
        // Patient Details
        first_name: { type: String },
        middle_name: { type: String },
        last_name: { type: String },
        date_of_birth: { type: Date, required: false },
        age: { type: Number, required: false },
        mobile_number: { type: String, required: true },
        email: { type: String, required: false },
        gender: { type: String},
        address: { type: OptionalAddressSchema, required: false },

        // Nominee Details
        nominee_details: {
            type: {
                first_name: { type: String },
                middle_name: { type: String },
                last_name: { type: String, required: true },
                date_of_birth: { type: Date, required: true },
                contact_number: { type: String, required: true },
                email: { type: String, required: true },
                gender: { type: String },
                address: { type: AddressSchema, required: true },
                relationship_with_patient: { type: String, required: true }
            },
            required: false
        },

        // Hospital Details
        hospital_details: {
            type: {
                name: { type: String, required: false },
                doctor_name: { type: String, required: false },
                contact_number: { type: String, required: false },
                address: { type: OptionalAddressSchema, required: false }
            },
            required: false
        },

        // Doctor Details
        doctor_details: {
            type: {
                name: { type: String, required: false },
                mobile_number: { type: String },
                landline_number: { type: String },
                address: { type: OptionalAddressSchema, required: false }
            },
            required: false
        },

        // Attendant Details
        attendant_details: {
            type: {
                name: { type: String, required: false },
                contact_number: { type: String, required: false },
                relationship_with_patient: { type: String, required: false }
            },
            required: false
        },

        // Medical Information
        medical_information: {
            type: {
                patient_condition: { type: String, required: false },
                medical_records: { type: [String] },
            },
            required: false
        },

        // Donor Details
        donor_details: {
            type: {
                first_name: { type: String },
                middle_name: { type: String },
                last_name: { type: String, required: false },
                date_of_birth: { type: Date, required: false },
                contact_number: { type: String, required: false },
                email: { type: String, required: false },
                gender: { type: String },
                address: { type: OptionalAddressSchema, required: false },
                relationship_with_patient: { type: String, required: false }
            },
            required: false
        },

        // Part B - Additional Details
        doctor2_details: {
            type: {
                name: { type: String, required: false },
                mobile_number: { type: String, required: false },
                landline_number: { type: String },
                address: { type: OptionalAddressSchema, required: false }
            },
            required: false
        },
        hospital2_details: {
            type: {
                name: { type: String, required: false },
                contact_number: { type: String, required: false },
                address: { type: OptionalAddressSchema, required: false }
            },
            required: false
        },
        is_pickup_drop_same: { type: Boolean, required: false },
        pickup_address: { type: OptionalAddressSchema },

        // Terms and Status
        terms_accepted: { type: Boolean, required: false },
        consent_signature: { type: String },
        status: {type: String},
        transplant_type: { type: String },
        submitted_at: { type: Date },

        // Metadata
        source: { type: String },
        enrollment_step: { type: String },

        created_by_id: { type: Number },
        created_by_role : {type: String},
        created_at: { type: Date },
        updated_at: { type: Date },

        // Service Assignment
        service_required: { type: String, enum: ["Cryo-p", "Mesen", "Procedure", "Miscellaneous"] },
        assigned_record_id: { type: Number }
    },
    { timestamps: true }
);

transvidhanEnrollmentSchema.pre("save", async function (next) {
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

const TransvidhanEnrollment = mongoose.model('transvidhan_enrollment', transvidhanEnrollmentSchema);

export { TransvidhanEnrollment };
export default TransvidhanEnrollment;
