//@ts-nocheck
import mongoose from "mongoose";

const notificationHistorySchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    message: { type: String },
    user_id: { type: Number },
    lead_id: { type: Number },
    user_type: { type: String },
    user_details: { type: Object },
    read_message: { type: Boolean, default: false },
    subject: { type: String }
  }, 
  { timestamps: true }
);

notificationHistorySchema.pre("save", async function (next) {
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

const NotificationHistory = mongoose.model('notification_history', notificationHistorySchema);

export { NotificationHistory };



