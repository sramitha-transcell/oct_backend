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

const transvidanSchema = new mongoose.Schema(
    {
        id: { type: Number, unique: true },
        enrollment_id: { type: Number },
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
        gender: { type: String },
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

        // Payment Details (optional)
        payment_package_id: { type: Number },
        payment_package_type: { type: String },
        payment_package_name: { type: String },
        payment_package_duration: { type: String },
        payment_package_amount: { type: Number },
        payment_additional_package_amount: { type: Number },
        additional_package_amount: { type: Number },
        payment_final_amount: { type: Number },
        payment_actual_final_amount: { type: Number },
        payment_mode: { type: String, enum: ["CASH", "ONLINE"] },
        payment_online_mode: { type: String, enum: ["UPI", "NET_BANKING", "CREDIT_CARD", "DEBIT_CARD"] },
        payment_transaction_id: { type: String },
        payment_transaction_datetime: { type: String }, // ISO string
        payment_transaction_status: { type: String, enum: ["SUCCESS", "PENDING", "FAILED"] },
        payment_receipt_link: { type: String },
        payment_transaction_notes: { type: String },
        payment_status: { type: String },
        payment_type: { type: String },
        fully_paid: { type: Boolean },
        pending_amount: { type: Number },


        payment_history: [{
            amount: { type: Number },
            payment_mode: { type: String, enum: ["CASH", "ONLINE"] },
            payment_type: { type: String, enum: ["FULL_PAYMENT", "PARTIAL_PAYMENT", "PAY_LATER"] },
            payment_online_mode: { type: String },
            transaction_id: { type: String },
            transaction_datetime: { type: String },
            transaction_status: { type: String },
            receipt_link: { type: String },
            transaction_notes: { type: String },
            cash_remarks: { type: String },
        }],

        // Sample Collection / Processing (optional)
        sample_collection_datetime: { type: Date }, // stored as Date
        sample_received_datetime: { type: Date }, // stored as Date
        sample_received_by: { type: String },
        sample_processed_datetime: { type: Date }, // stored as Date
        total_cassettes_cryo_preserved: { type: Number },
        remaining_cassettes_cryo_preserved: { type: Number },
        total_cassettes_dispatched: { type: Number },

        // Step 2: Product Accountability Record (optional)
        product_accountability_record: {
            type: {
                // Product + lab values
                product_code: { type: String },
                sample_source: { type: String },
                apheresis_done_date: { type: String }, // YYYY-MM-DD
                initial_sample_volume_ml: { type: Number },
                viable_cd45_count_cells_per_ul: { type: Number },
                cd34_percent_of_cd45: { type: Number },
                total_cd34_count_cells_per_ul: { type: Number },
                viability_cd34_percent: { type: Number },
                final_product_volume_ml: { type: Number },

                // Storage
                volume_per_bag_ml: { type: Number },
                volume_per_bag_ml_list: { type: [Number] },
                cryopreservation_expiry_date: { type: String } // YYYY-MM-DD
            },
            required: false
        },

        // Step 3: Product Retrieval (optional)
        product_retrieval_details: {
            type: {
                product_retrieval_datetime: { type: Date }, // stored as Date
                delivery_hospital_details_demographics: { type: String },
                doctor_details_demographics: { type: String },
                logistics_details: { type: String },
                volume_per_bag_ml_list: { type: [Number] }
            },
            required: false
        },

        total_bags: { type: Number },
        bag_package_allocations: {
            type: [
                {
                    bag_no: { type: Number },
                    package_id: { type: Number },
                    amount_applied: { type: Number },
                    package_name: { type: String },
                },
            ],
            default: [],
        },

        // Terms and Status
        terms_accepted: { type: Boolean, required: false },
        consent_signature: { type: String },
        accountability_sheet_link: { type: String },
        raw_data_url: { type: String },
        status: { type: String },
        transplant_type: { type: String },
        submitted_at: { type: Date },
        cash_remarks: { type: String },

        // Metadata
        source: { type: String },
        enrollment_step: { type: String },

        created_by_id: { type: Number },
        created_by_role : {type:String},
        created_at: { type: Date },
        updated_at: { type: Date },
    },
    { timestamps: true }
);

transvidanSchema.pre("save", async function (next) {
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

const Transvidan = mongoose.model('transvidan', transvidanSchema);

export { Transvidan };
export default Transvidan;