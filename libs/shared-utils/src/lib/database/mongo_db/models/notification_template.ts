//@ts-nocheck
import mongoose from "mongoose";

const notificationTemplateSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    template_category: { type: String }, // title
    subject: { type: String },
    description: { type: String },
    sms_description: { type: String },
    user_type_id: { type: Number },
    user_type: { type: String },
    message_type: { type: String }, // email or sms or both
    sms_template_id: { type: String },
    email_template_id: { type: String },
    created_by_id: { type: Number },
    created_by: { type: String },
    updated_by_id: { type: Number },
    updated_by: { type: String },
    company_id: { type: Number },
    company_details: { type: String },
    is_active: { type: Boolean, default: true }
  }, 
  { timestamps: true }
);

notificationTemplateSchema.pre("save", async function (next) {
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

const NotificationTemplate = mongoose.model('notification_template', notificationTemplateSchema);

export { NotificationTemplate };

