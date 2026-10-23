//@ts-nocheck
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const clientPartySchema = new mongoose.Schema({
    client_title: { type: String },
    client_full_name: { type: String },
    relation_title: { type: String },
    relation_name: { type: String },
    residence: { type: String },
    city: { type: String },
    state: { type: String }
}, { _id: false });

const motherDetailsSchema = new mongoose.Schema({
    client_name: { type: String },
    surname: { type: String },
    expected_delivery_date: { type: String },
    occupation: { type: String },
    telephone_res: { type: String },
    work_phone: { type: String },
    cell_phone_1: { type: String },
    cell_phone_2: { type: String },
    email_1: { type: String },
    email_2: { type: String },
    scheduled_cesarean: { type: String },
    multiple_births: { type: String },
    multiple_births_specify: { type: String },
    permanent_address: {
        street_no: { type: String },
        block: { type: String },
        area: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String }
    },
}, { _id: false });

const fatherDetailsSchema = new mongoose.Schema({
    first_name: { type: String },
    middle_name: { type: String },
    surname: { type: String },
    occupation: { type: String },
    telephone_res: { type: String },
    work_phone: { type: String },
    cell_phone: { type: String },
    email_1: { type: String },
    email_2: { type: String }
}, { _id: false });

const deliveryDetailsSchema = new mongoose.Schema({
    hospital_name: { type: String },
    hospital_location: { type: String },
    contact_no: { type: String },
    doctor_name: { type: String },
    doctor_phone: { type: String }
}, { _id: false });

const healthQuestionnaireSchema = new mongoose.Schema({
    feeling_healthy_today: { type: String },
    complications_this_pregnancy: { type: String },
    complications_other_pregnancy: { type: String },
    prior_health_issues: { type: String },
    maternal_medications: { type: String },
    donor_conception: { type: String },
    previous_cord_blood_attempt: { type: String },
    received_growth_hormones: { type: String },
    aware_of_cord_stem_cell: { type: String },
    blood_disorder: { type: String },
    seizures: { type: String },
    malaria_rabies: { type: String },
    blood_donor_refused: { type: String },
    infections_or_surgery: { type: String },
    hepatitis_jaundice: { type: String },
    hla_typed: { type: String },
    hiv_test: { type: String },
    aids_complications: { type: String },
    explanations: { type: String }
}, { _id: false });

const signaturesSchema = new mongoose.Schema({
    mother_name: { type: String },
    mother_signature: { type: String },
    mother_signature_date: { type: String },
    father_name: { type: String },
    father_signature: { type: String },
    father_signature_date: { type: String },
    authorized_person_name: { type: String },
    authorized_person_designation: { type: String },
    authorized_person_signature: { type: String },
    authorized_person_signature_date: { type: String },
    client_party_name: { type: String },
    client_party_signature: { type: String },
    client_party_signature_date: { type: String }
}, { _id: false });

// const memorandumOfUnderstandingSchema = new mongoose.Schema({
//     agreement_date: { type: String },
//     agreement_name1: { type: String },
//     agreement_name2: { type: String },
//     residence: { type: String },
//     city: { type: String },
//     state: { type: String }
// }, { _id: false });

// const consentAcknowledgementsSchema = new mongoose.Schema({
//     understand_storage: { type: Boolean },
//     understand_future_disease_uncertain: { type: Boolean },
//     consent_maternal_blood: { type: Boolean },
//     understand_ineligibility_risk: { type: Boolean },
//     understand_no_guarantee: { type: Boolean },
//     understand_no_discomfort: { type: Boolean },
//     understand_kit_return: { type: Boolean },
//     understand_sample_rejection: { type: Boolean },
//     understand_physician_decision: { type: Boolean },
//     understand_rights_to_sample: { type: Boolean },
//     agree_to_pay_fees: { type: Boolean },
//     understand_limited_liability: { type: Boolean },
//     agree_to_terms: { type: Boolean }
// }, { _id: false });

// const agreementDetailsSchema = new mongoose.Schema({
//     agreement_date: { type: String },
//     client_party: clientPartySchema,
//     mother_details: motherDetailsSchema,
//     father_details: fatherDetailsSchema,
//     delivery_details: deliveryDetailsSchema,
//     health_questionnaire: healthQuestionnaireSchema,
//     signatures: signaturesSchema,
//     memorandum_of_understanding: memorandumOfUnderstandingSchema,
//     consent_acknowledgements: consentAcknowledgementsSchema
// }, { _id: false });
const documentsDetailsSchema = new mongoose.Schema({
    aadhaar_father: { type: String },
    aadhaar_mother: { type: String },
    photo: { type: String }
}, { _id: false });
const paramedicSchema = new mongoose.Schema({
    delivery_date: { type: String },
    hospital_name: { type: String },
    paramedic_name: { type: String },
    email: { type: String },
    contact_number_1: { type: String },
    contact_number_2: { type: String },
    doctor_name: { type: String },
    hospital_location: { type: String },
    kitbox_number: { type: String },
    obstetrician_name: { type: String },
    sample_dispatch_method: { type: String, enum: ['by-road', 'by-air'] },
    sample_dispatch_details: { type: String },
    time_of_delivery: { type: String },
    sms_sent: { type: Boolean }
}, { _id: false });
const sampleCollectionSchema = new mongoose.Schema({
    date_of_delivery: { type: String },
    time_of_delivery: { type: String },
    time_interval: { type: String },
    nature_of_delivery: { type: String },
    nature_of_collection: { type: String },
    sex_of_baby: { type: String },
    baby_weight: { type: String },
    hospital_name: { type: String },
    hospital_city: { type: String }
}, { _id: false });
const technicalProcessingSchema = new mongoose.Schema({
    cd34_cell_count: { type: String },
    cd34_viability: { type: String },
    cryopreservation_date: { type: String },
    cryopreservation_remarks: { type: String },
    cryopreservation_expiry: { type: String },
    hiv_test: { type: String },
    hbsag_test: { type: String },
    hcv_test: { type: String },
    vdrl_test: { type: String },
    cmv_igm_test: { type: String },
    lepto_igm_test: { type: String },
    htlv_test: { type: String },
    malaria_test: { type: String },
    pre_sterility_test: { type: String },
    post_sterility_test: { type: String },
    total_cell_count: { type: String },
    collected_volume: { type: String },
    final_storage_volume: { type: String },
    storage_plan: { type: String },
    storage_tank_no: { type: String },
    storage_quadrant_no: { type: String },
    storage_frame_no: { type: String },
    storage_slot_no: { type: String },
    report_generated: { type: Boolean },
    // Sample reception fields
    sample_received_date_time: { type: String },
    received_by: { type: String },
    source_received_by: { type: String },
    kitbox_temperature: { type: String },
    kitbox_number: { type: String },
    // Contents fields
    blood_bag: { type: Boolean },
    gel_packs: { type: Boolean },
    cord_tissue: { type: Boolean },
    maternal_blood: { type: Boolean },
    checklist_duly_filled: { type: Boolean },
    edta: { type: Boolean },
    serum_vial: { type: Boolean },
    received_volume: { type: String },
    sample_status: { type: String, enum: ['accepted', 'rejected'] },
    interpretation_remarks:{type:String}
}, { _id: false });
const addressSchema = new mongoose.Schema({
    street_no: { type: String },
    block: { type: String },
    area: { type: String },
    city: { type: String },
    state: { type: String },
    postal_code: { type: String },
}, { _id: false });

const paymentDetailsSchema = new mongoose.Schema({
    payment_mode: { type: String, enum: ["CASH", "ONLINE"] },
    payment_amount: { type: Number },
    payment_transaction_id: { type: String },
    payment_transaction_datetime: { type: String }, // ISO string
    payment_receipt_link: { type: String },
}, { _id: false });

const emiPaymentDetailsSchema = new mongoose.Schema({
    amount: { type: Number },
    loan_id: { type: String },
    date: { type: String },
}, { _id: false });

const leadSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    client_unique_id: { type: String },
    lead_unique_id: { type: String },

    user_name : { type: String },
    password : { type: String },
    role: { type: String, default: 'SCELLCARE_LEAD' },
    profile_image: { type: String, default: "" },

    is_bulk_uploaded: { type: Boolean, default: false },

    mother_name: { type: String },
    mother_dob: { type: String },
    mother_age: { type: String },
    father_name: { type: String },
    father_dob: { type: String },
    father_age: { type: String },
    mobile_number: { type: String },
    alternate_number: { type: String },
    email: { type: String },
    address: addressSchema,
    delivery_due_date: { type: String },
    hospital_info: { type: Object },
    lead_type: { type: String, enum: ['in-person', 'social-media', 'referral', 'other'] },
    tele_calling_required: { type: String, enum: ['yes', 'no'] },
    is_direct_enrollment: { type: Boolean, default: false },
    remarks: { type: String },
    enrollment_date: { type: String },

    call_outcome: { type: String, enum: ['interested', 'not-interested', 'rejected', 'follow-up'] },
    follow_up_date: { type: String },
    follow_up_details :{type : [Object]},
    assigned_sales_executive: { type: Number },
    appointment_date: { type: String },
    appointment_time: { type: String },
    appointment_type: { type: String, enum: ['in-person', 'on-call'] },
    appointment_address: addressSchema,
    call_remarks: { type: String },
    appointment_history: { type: [Object] },

    payment_package: { type: String },
    package_amount: { type: Number },
    package_amount_requested:{type:Number},
    final_payment_amount:{type:Number},

    amount_approval_status:{type:String,default:''},
    amount_approval_date:{type:Date},
    amount_rejected_date:{type:Date},
    amount_rejected_reason:{type:String},

    amount_approved_by: { type: Number },
    amount_rejected_by: { type: Number },

    payment_type: { type: String },
    payment_status: { type: String,default:'NOT-PAID' },
    remaining_amount: { type: Number },

    initial_payment_mode: { type: String, enum: ["CASH", "ONLINE"] },
    doctor_collection_charge_mode: { type: String, enum: ["CASH", "ONLINE"] },
    initial_payment_details: paymentDetailsSchema,
    doctor_collection_charge_payment_details: paymentDetailsSchema,
    emi_payment_details: emiPaymentDetailsSchema,

    documents: documentsDetailsSchema,

    agreement_date: { type: String },
    agreement_mother_details: motherDetailsSchema,
    agreement_father_details: fatherDetailsSchema,
    agreement_delivery_details: deliveryDetailsSchema,
    agreement_health_questionnaire: healthQuestionnaireSchema,
    agreement_signatures: signaturesSchema,
    agreement_client_party: clientPartySchema,
    live_room_name: { type: String },
    call_sid: { type: String },


    paramedic_details: paramedicSchema,
    sample_collection: sampleCollectionSchema,
    sample_collection_date: { type: String },
    sample_collected_date_time: { type: String },
    sample_processed_date: { type: String },
    sample_received_date: { type: String },
    technical_processing: technicalProcessingSchema,
    technical_report_link: { type: String},
    is_client_downloaded_technical_report: { type: Boolean, default: false },
    client_agreement_pdf_link: { type: String},
    is_client_downloaded_agreement_pdf: { type: Boolean, default: false },
    status: { type: String, default: 'new' }, //stages
    lead_status:{type:String},  // telecalling phase
    client_status :{type:String}, // sales enagement phase
    client_status_remarks:{type:String},
    created_by_id: { type: Number },
    created_by_role: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date },
}, { timestamps: true, _id: true, strict: false });


leadSchema.pre("save", async function (next) {
    if (this.isNew) {
        try {
            const latestDocument = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
            this.id = latestDocument ? latestDocument.id + 1 : 1;
        } catch (error) {
            return next(error);
        }
    }
    
    // Address migration logic - remove full_address and ensure proper structure
    if (this.address && this.address.full_address) {
        // Remove full_address field
        this.address.full_address = undefined;
        delete this.address.full_address;
    }
    
    // Ensure all required address fields exist
    if (this.address) {
        this.address.street_no = this.address.street_no || "";
        this.address.block = this.address.block || "";
        this.address.area = this.address.area || "";
        this.address.city = this.address.city || "";
        this.address.state = this.address.state || "";
        this.address.pincode = this.address.pincode || "";
    }
    
    next();
});

leadSchema.pre(["updateOne", "updateMany", "findOneAndUpdate"], async function (next) {
    const update = this.getUpdate();
    
    // Handle address migration for updates
    if (update.$set && update.$set.address) {
        if (update.$set.address.full_address) {
            // Remove full_address field
            update.$set.address.full_address = undefined;
            delete update.$set.address.full_address;
        }
        
        // Ensure all required address fields exist
        update.$set.address.street_no = update.$set.address.street_no || "";
        update.$set.address.block = update.$set.address.block || "";
        update.$set.address.area = update.$set.address.area || "";
        update.$set.address.city = update.$set.address.city || "";
        update.$set.address.state = update.$set.address.state || "";
        update.$set.address.pincode = update.$set.address.pincode || "";
    }
    
    next();
});


const ScellcareLead = mongoose.model('scellcare_lead', leadSchema);

export { ScellcareLead };
