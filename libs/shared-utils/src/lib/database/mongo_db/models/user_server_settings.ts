//@ts-nocheck

import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const fieldSchema = new mongoose.Schema(
    {
        field_sequence: { type: Number },
        field_key: { type: String },
        field_name: { type: String },
        env_key: { type: String },
        placeholder: { type: String },
        field_type: { type: String },
        is_mandatory: { type: Boolean, default: false },
        is_editable: { type: Boolean, default: true },
        allowed_values: [{ type: mongoose.Schema.Types.Mixed }],
        value: { type: mongoose.Schema.Types.Mixed }
    }
);

const sectionSchema = new mongoose.Schema(
    {
        section_sequence: { type: Number },
        section_key: { type: String },
        section_name: { type: String },
        section_description: { type: String },
        fields: [fieldSchema]
    }
);

const settingTypeSchema = new mongoose.Schema(
    {
        lookup_code: { type: String },
        display_name: { type: String },
        id: { type: Number }
    },
    { _id: false }
);

const userServerSettingsSchema = new mongoose.Schema(
    {
        id: { type: Number, unique: true },
        code: { type: String },
        logo: { type: String },
        name: { type: String },
        setting_type_id: { type: Number },
        setting_type: { type: settingTypeSchema },
        description: { type: String },
        redirection_link: { type: String },
        sections: [sectionSchema],
        company_id: { type: Number },
        is_active: { type: Boolean, default: true },
        status: { type: String },
        documentation_link: { type: String },
        banner_url: { type: String },
        tag_text: { type: String }
    },
    { timestamps: true }
);

userServerSettingsSchema.pre('save', async function (next) {
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

userServerSettingsSchema.index({ id: 1, createdAt: -1 });
userServerSettingsSchema.index({ company_id: 1 });
userServerSettingsSchema.index({ code: 1 });
userServerSettingsSchema.plugin(mongoosePaginate);

const UserServerSettings = mongoose.model('user_server_settings', userServerSettingsSchema, "user_server_settings");

export  {UserServerSettings};
