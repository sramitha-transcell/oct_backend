//@ts-nocheck
import mongoose from "mongoose";

const pregenSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    role: { type: String, default: 'PREGEN' },
    client_unique_id: { type: String },
    pregen_unique_id: { type: String },
    // Client Demographics
    first_name: { type: String, required: true },
    middle_name: { type: String },
    last_name: { type: String, required: true },
    dob: { type: Date },
    gender: { type: String },
    profile_image: { type: String, default: "" },

    // Contact
    mobile_number: { type: String, required: true },
    alternate_number: { type: String },
    email: { type: String, required: false },

    // Address - 6 mandatory fields only
    address: {
      type: {
        street_no: { type: String, required: false },
        block: { type: String, required: false },
        area: { type: String, required: false },
        city: { type: String, required: false },
        state: { type: String, required: false },
        pincode: { type: String, required: false }
      },
      default: {}
    },

    // Medical Details (from HealthCheck)
    medical_details: {
      type: {
        has_chronic_disease: { type: String },
        chronic_disease_when: { type: String },
        chronic_diseases: { type: [String] },
        other_chronic_diseases: { type: String },
        chronic_details: { type: String },
        other_medical_info: { type: String }
      },
      default: {}
    },

    // Biological Details
    biological_details: {
      type: {
        has_genetic_testing: { type: String},
        genetic_testing_age: { type: String },
        genetic_testing_report_url: { type: String },
        relative_genetic_testing: { type: String},
        relative_genetic_relationship: { type: String }
      },
      default: {}
    },

    // Family History (array of relatives)
    family_history: {
      type: [
        {
          relationship: { type: String },
          numbers: { type: Number },
          chronic_disease: { type: String },
          age_at_diagnosis: { type: Number },
          current_age: { type: Number },
          age_at_death: { type: Number }
        }
      ],
      default: []
    },

    // Detailed Medical History (from DetailedMedicalHistory.tsx)
    medical_history: {
      type: {
        present_complaints: { type: String },
        past_medical_history: { type: String },
        medications: { type: String },
        past_surgery_history: { type: String },
        family_health_history: { type: String },
        allergies: { type: String },
        diet_lifestyle: { type: String },
        signature_url: { type: String }
      },
      default: {}
    },

    // Sample Collection Details
    sample_collection: {
      type: {
        sample_type: { type: String, enum: ['Blood', 'Saliva', 'Tissue'] },
        collection_date_time: { type: Date },
        collection_address: { 
          type: {
            street_no: { type: String, required: true },
            block: { type: String, required: true },
            area: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true }
          }
        },
        storage_condition: { 
          type: String, 
          enum: ['Room temperature', 'Refrigerated', 'Frozen', 'Refrigerated at 4°C']
        }
      },
      default: {}
    },

    omics_data_url: { type: String },
    final_report_url: { type: String },
    report_summary: { type: String },
    consent_signature_url: { type: String },

    // Third-party status
    third_party_status: { type: String },
    third_party_details: { type: Object },

    // Workflow / metadata
    source: { type: String },
    enrollment_step: { type: String },
    status: { type: String, default: 'new' },
    payment_amount: { type: Number, default: 0 },
    payment_package_type: { type: String },
    payment_status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
  },
  { timestamps: true }
);

pregenSchema.pre("save", async function (next) {
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

const Pregen = mongoose.model('pregen', pregenSchema);

export { Pregen };
export default Pregen;
